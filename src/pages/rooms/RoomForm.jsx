import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles, LayoutGrid, Sliders, Sofa, UsersRound, Heart,
  Check, AlertCircle, StickyNote, BedDouble, Info, RotateCcw, Ruler,
  Pencil, Trash2, Save, Settings2, X,
} from "lucide-react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { MasterDataManager } from "../../components/ui/MasterDataManager.jsx";
import { ROOM_STATUSES } from "../../mocks/rooms.js";
import {
  OCCUPANCY_TYPES, BED_CONFIGURATIONS, ROOM_LAYOUTS,
  ROOM_OPTIONS, BEST_SUITED_FOR, SUITE_FEATURES, isSuiteRoomType,
} from "../../mocks/roomClassification.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";

const ROOM_DEFAULTS_SETTINGS = { bedConfiguration: BED_CONFIGURATIONS[0], status: ROOM_STATUSES[0], maxOccupancy: 6 };

const EMPTY = {
  name: "", description: "", propertyId: "", status: "Active",
  occupancyType: OCCUPANCY_TYPES[0], bedConfiguration: BED_CONFIGURATIONS[0], numberOfBeds: 1, extraBedAllowed: false,
  roomType: "", layout: ROOM_LAYOUTS[0],
  roomOptions: [],
  amenities: [],
  squareFeet: "",
  maxAdults: 2, maxChildren: 0, maxInfants: 0, maxOccupancy: 2, baseOccupancy: 2,
  extraAdultAllowed: false, extraChildAllowed: false,
  bestSuitedFor: [],
  suiteFeatures: [],
};

// `platformMaxOccupancy` is Settings → Defaults → Rooms' real effect: a hard
// validation cap, not just a suggestion — a room can never be saved above it.
function validate(form, { skipProperty = false, platformMaxOccupancy } = {}) {
  const errors = {};
  if (!skipProperty && !form.propertyId) errors.propertyId = "Property is required.";
  if (!form.name || !form.name.trim()) errors.name = "Room name is required.";
  for (const [key, label] of [
    ["maxAdults", "Max adults"],
    ["maxChildren", "Max children"],
    ["maxOccupancy", "Max occupancy"],
    ["baseOccupancy", "Base occupancy"],
    ["numberOfBeds", "Number of beds"],
  ]) {
    const val = form[key];
    if (val === "" || val === null || Number.isNaN(Number(val))) errors[key] = `${label} must be a number.`;
    else if (Number(val) < (key === "numberOfBeds" || key === "maxOccupancy" || key === "baseOccupancy" ? 1 : 0)) {
      errors[key] = `${label} must be at least ${key === "numberOfBeds" || key === "maxOccupancy" || key === "baseOccupancy" ? 1 : 0}.`;
    }
  }
  if (!errors.maxOccupancy && !errors.maxAdults && !errors.maxChildren) {
    if (Number(form.maxAdults) + Number(form.maxChildren) > Number(form.maxOccupancy)) {
      errors.maxOccupancy = "Max occupancy cannot be less than max adults + max children.";
    } else if (platformMaxOccupancy && Number(form.maxOccupancy) > Number(platformMaxOccupancy)) {
      errors.maxOccupancy = `Max occupancy cannot exceed the platform cap of ${platformMaxOccupancy} (Settings → Defaults → Rooms).`;
    }
  }
  return errors;
}

// Maps each section to the field keys it owns, for completion/error/dirty tracking.
const SECTION_FIELDS = {
  overview: ["propertyId", "name", "description", "status", "squareFeet"],
  classification: ["roomType"],
  occupancy: ["maxAdults", "maxChildren", "maxInfants", "maxOccupancy", "baseOccupancy", "extraAdultAllowed", "extraChildAllowed"],
  bedConfig: ["occupancyType", "bedConfiguration", "numberOfBeds", "extraBedAllowed"],
  layout: ["layout"],
  features: ["roomOptions"],
  amenities: ["amenities"],
  suited: ["bestSuitedFor", "suiteFeatures"],
  notes: [],
};

function buildSections(form) {
  const showSuite = isSuiteRoomType(form.roomType);
  return [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "classification", label: "Classification", icon: Sofa },
    { key: "occupancy", label: "Occupancy", icon: UsersRound },
    { key: "bedConfig", label: "Bed Configuration", icon: BedDouble },
    { key: "layout", label: "Layout", icon: LayoutGrid },
    { key: "features", label: "Features", icon: Sliders, badge: form.roomOptions.length || null },
    { key: "amenities", label: "Amenities", icon: Sofa, badge: form.amenities.length || null },
    { key: "suited", label: "Best Suited For", icon: Heart, badge: (form.bestSuitedFor.length + (showSuite ? form.suiteFeatures.length : 0)) || null },
    { key: "notes", label: "Notes", icon: StickyNote },
  ];
}

export function RoomForm({ open, onClose, onSubmit, initial, properties = [], scopePropertyId }) {
  const data = useData();
  const toast = useToast();
  const roomTypeMaster = data.masters.roomTypes;
  const amenitiesMaster = data.masters.amenities;
  const templatesMaster = data.masters.roomTemplates;

  const [form, setForm] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});
  const [active, setActive] = useState("overview");
  const [notes, setNotes] = useState("");
  const [manageOpen, setManageOpen] = useState(null); // "roomTypes" | "amenities" | null
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const baselineRef = useRef(EMPTY);
  // Settings → Defaults → Rooms: prefills a brand-new room's Bed
  // Configuration/Status; Platform Max Occupancy is enforced in validate().
  const [roomDefaults] = usePersistedState("settings.defaults.rooms", ROOM_DEFAULTS_SETTINGS);

  // Creating (not editing) with more than one property selected in the left
  // filter and no single scoped property means the room should be cloned
  // into every selected property on submit — see RoomsPage.handleSubmit.
  const isEditing = !!initial;
  const multiPropertyMode = !isEditing && !scopePropertyId && properties.length > 1;

  useEffect(() => {
    const baseline = initial
      ? { ...EMPTY, ...initial }
      : {
          ...EMPTY,
          propertyId: scopePropertyId || "",
          roomType: roomTypeMaster[0]?.name || "",
          bedConfiguration: roomDefaults.bedConfiguration,
          status: roomDefaults.status,
        };
    setForm(baseline);
    setErrors({});
    setActive("overview");
    setNotes("");
    baselineRef.current = baseline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open, scopePropertyId]);

  const scopedProperty = properties.find((p) => p.id === form.propertyId);
  const showSuiteSection = isSuiteRoomType(form.roomType);
  const sections = useMemo(() => buildSections(form), [form]);

  const isDirty = open && JSON.stringify(form) !== JSON.stringify(baselineRef.current);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);
  const guardedClose = () => requestAction(onClose);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value === "" ? "" : Number(e.target.value) }));
  const setList = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const dirtyFields = useMemo(() => {
    const s = new Set();
    for (const key of Object.keys(form)) {
      if (JSON.stringify(form[key]) !== JSON.stringify(baselineRef.current[key])) s.add(key);
    }
    return s;
  }, [form]);

  const isSectionComplete = (key) => {
    const fields = SECTION_FIELDS[key];
    if (key === "suited" && !showSuiteSection) return form.bestSuitedFor.length > 0;
    if (!fields || fields.length === 0) return true;
    const relevantErrors = fields.some((f) => errors[f]);
    if (relevantErrors) return false;
    if (key === "overview") return (multiPropertyMode || !!form.propertyId) && !!form.name.trim();
    return true;
  };

  const sectionHasError = (key) => (SECTION_FIELDS[key] || []).some((f) => errors[f]);

  const runValidation = () => {
    const validationErrors = validate(form, { skipProperty: multiPropertyMode, platformMaxOccupancy: roomDefaults.maxOccupancy });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorSection = sections.find((s) => (SECTION_FIELDS[s.key] || []).some((f) => validationErrors[f]));
      if (firstErrorSection) setActive(firstErrorSection.key);
      return null;
    }
    return form;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = runValidation();
    if (!valid) return;
    onSubmit(valid);
  };

  const handleSaveAndContinue = (e) => {
    e.preventDefault();
    const valid = runValidation();
    if (!valid) return;
    onSubmit(valid, { keepOpen: true });
    baselineRef.current = valid;
    const idx = sections.findIndex((s) => s.key === active);
    const next = sections[(idx + 1) % sections.length];
    if (next) setActive(next.key);
  };

  const handleReset = () => setForm(baselineRef.current);

  return (
    <>
    <Modal
      open={open}
      onClose={guardedClose}
      title={initial ? "Edit Room" : "Add Room"}
      size="full"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={guardedClose} type="button">Cancel</button>
          {isDirty && (
            <button className="btn btn--ghost btn--md" onClick={handleReset} type="button">
              <RotateCcw size={15} strokeWidth={2} /> Reset Changes
            </button>
          )}
          {initial && (
            <Button variant="secondary" size="md" onClick={handleSaveAndContinue} type="button">
              Save &amp; Continue
            </Button>
          )}
          <Button variant="primary" size="md" type="submit" form="room-form">
            {initial ? "Save Changes" : "Create Room"}
          </Button>
        </>
      }
    >
      <div className="entity-wizard">
        <nav className="entity-wizard__nav">
          {sections.map((s) => {
            const complete = isSectionComplete(s.key);
            const hasError = sectionHasError(s.key);
            return (
              <button
                key={s.key}
                type="button"
                className={`entity-wizard__nav-item ${active === s.key ? "entity-wizard__nav-item--active" : ""} ${hasError ? "entity-wizard__nav-item--error" : ""}`}
                onClick={() => setActive(s.key)}
              >
                <span className="entity-wizard__nav-icon">
                  {hasError ? <AlertCircle size={16} strokeWidth={2} /> : complete ? <Check size={16} strokeWidth={2.5} /> : <s.icon size={16} strokeWidth={2} />}
                </span>
                <span className="entity-wizard__nav-label">{s.label}</span>
                {s.badge != null && <span className="entity-wizard__nav-badge">{s.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="entity-wizard__content">
          {!initial && active === "overview" && (
            <div className="template-picker">
              <div className="template-picker__label"><Sparkles size={13} strokeWidth={2} /> Quick-fill from a template</div>
              <div className="template-picker__list">
                {templatesMaster.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className="template-picker__item"
                    onClick={() => setForm((f) => ({ ...f, ...t.values }))}
                  >
                    {t.name}
                  </button>
                ))}
                <button type="button" className="template-picker__manage" onClick={() => setTemplateManagerOpen(true)}>
                  <Settings2 size={13} strokeWidth={2} /> Manage Templates
                </button>
              </div>
            </div>
          )}

          <form id="room-form" onSubmit={handleSubmit}>
            {active === "overview" && (
              <div className="form-grid">
                <div className="form-grid__full">
                  <Field label="Property" required={!multiPropertyMode} id="r-property" error={errors.propertyId}>
                    {scopePropertyId ? (
                      <Input value={scopedProperty?.name || scopePropertyId} disabled />
                    ) : multiPropertyMode ? (
                      <Input value={`${properties.length} properties selected`} disabled />
                    ) : (
                      <Select
                        id="r-property"
                        placeholder="Select a property"
                        options={properties.map((p) => p.name)}
                        value={scopedProperty?.name || ""}
                        onChange={(e) => {
                          const p = properties.find((pp) => pp.name === e.target.value);
                          setForm((f) => ({ ...f, propertyId: p?.id || "" }));
                        }}
                        disabled={!!initial}
                      />
                    )}
                  </Field>
                  {multiPropertyMode && (
                    <p className="room-form__clone-note">
                      <Info size={13} strokeWidth={2} />
                      This room will be created for all selected properties. A separate copy will be generated for each property.
                    </p>
                  )}
                </div>
                <div className="form-grid__full">
                  <Field label="Room Name" required id="r-name" error={errors.name} modified={dirtyFields.has("name")}>
                    <Input id="r-name" value={form.name} onChange={set("name")} required placeholder="e.g. Deluxe Ocean King" />
                  </Field>
                </div>
                <div className="form-grid__full">
                  <Field label="Description" id="r-desc" modified={dirtyFields.has("description")}>
                    <Textarea id="r-desc" value={form.description} onChange={set("description")} placeholder="Brief room description..." />
                  </Field>
                </div>
                <Field label="Status" required id="r-status" modified={dirtyFields.has("status")}>
                  <Select id="r-status" options={ROOM_STATUSES} value={form.status} onChange={set("status")} />
                </Field>
                <Field label="Square Feet / Metres" id="r-sqft" hint="Approximate room area." modified={dirtyFields.has("squareFeet")}>
                  <Input id="r-sqft" icon={Ruler} type="number" min="0" tabular value={form.squareFeet} onChange={setNum("squareFeet")} placeholder="e.g. 350" />
                </Field>
              </div>
            )}

            {active === "classification" && (
              <FeatureChipGrid
                label="Room Type"
                options={roomTypeMaster.map((t) => t.name)}
                value={form.roomType}
                onChange={(v) => setForm((f) => ({ ...f, roomType: v }))}
                multiple={false}
                resetValue={baselineRef.current.roomType}
                onManage={() => setManageOpen("roomTypes")}
                manageLabel="Manage Room Types"
              />
            )}

            {active === "occupancy" && (
              <>
              <div className="form-grid">
                <Field label="Maximum Adults" required id="r-adults" error={errors.maxAdults} modified={dirtyFields.has("maxAdults")}>
                  <Input id="r-adults" type="number" min="0" tabular value={form.maxAdults} onChange={setNum("maxAdults")} required />
                </Field>
                <Field label="Maximum Children" required id="r-children" error={errors.maxChildren} modified={dirtyFields.has("maxChildren")}>
                  <Input id="r-children" type="number" min="0" tabular value={form.maxChildren} onChange={setNum("maxChildren")} required />
                </Field>
                <Field label="Maximum Infants" id="r-infants" modified={dirtyFields.has("maxInfants")}>
                  <Input id="r-infants" type="number" min="0" tabular value={form.maxInfants} onChange={setNum("maxInfants")} />
                </Field>
                <Field label="Maximum Occupancy" required id="r-maxocc" error={errors.maxOccupancy} modified={dirtyFields.has("maxOccupancy")} hint={`Platform cap: ${roomDefaults.maxOccupancy} (Settings → Defaults → Rooms).`}>
                  <Input id="r-maxocc" type="number" min="1" max={roomDefaults.maxOccupancy} tabular value={form.maxOccupancy} onChange={setNum("maxOccupancy")} required />
                </Field>
                <Field label="Base Occupancy" required id="r-baseocc" error={errors.baseOccupancy} modified={dirtyFields.has("baseOccupancy")}>
                  <Input id="r-baseocc" type="number" min="1" tabular value={form.baseOccupancy} onChange={setNum("baseOccupancy")} required />
                </Field>
              </div>
              <div style={{ marginTop: "var(--space-6)" }}>
                <FeatureChipGrid
                  label="Extra Adult Allowed"
                  options={["No", "Yes"]}
                  value={form.extraAdultAllowed ? "Yes" : "No"}
                  onChange={(v) => setForm((f) => ({ ...f, extraAdultAllowed: v === "Yes" }))}
                  multiple={false}
                  resetValue={baselineRef.current.extraAdultAllowed ? "Yes" : "No"}
                />
              </div>
              <div style={{ marginTop: "var(--space-6)" }}>
                <FeatureChipGrid
                  label="Extra Child Allowed"
                  options={["No", "Yes"]}
                  value={form.extraChildAllowed ? "Yes" : "No"}
                  onChange={(v) => setForm((f) => ({ ...f, extraChildAllowed: v === "Yes" }))}
                  multiple={false}
                  resetValue={baselineRef.current.extraChildAllowed ? "Yes" : "No"}
                />
              </div>
              </>
            )}

            {active === "bedConfig" && (
              <>
              <FeatureChipGrid
                label="Occupancy Based"
                options={OCCUPANCY_TYPES}
                value={form.occupancyType}
                onChange={(v) => setForm((f) => ({ ...f, occupancyType: v }))}
                multiple={false}
                resetValue={baselineRef.current.occupancyType}
              />
              <div style={{ marginTop: "var(--space-6)" }}>
                <FeatureChipGrid
                  label="Bed Configuration"
                  options={BED_CONFIGURATIONS}
                  value={form.bedConfiguration}
                  onChange={(v) => setForm((f) => ({ ...f, bedConfiguration: v }))}
                  multiple={false}
                  resetValue={baselineRef.current.bedConfiguration}
                />
              </div>
              <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
                <Field label="Number of Beds" required id="r-numbeds" error={errors.numberOfBeds} modified={dirtyFields.has("numberOfBeds")}>
                  <Input id="r-numbeds" type="number" min="1" tabular value={form.numberOfBeds} onChange={setNum("numberOfBeds")} required />
                </Field>
              </div>
              <div style={{ marginTop: "var(--space-6)" }}>
                <FeatureChipGrid
                  label="Extra Bed Allowed"
                  options={["No", "Yes"]}
                  value={form.extraBedAllowed ? "Yes" : "No"}
                  onChange={(v) => setForm((f) => ({ ...f, extraBedAllowed: v === "Yes" }))}
                  multiple={false}
                  resetValue={baselineRef.current.extraBedAllowed ? "Yes" : "No"}
                />
              </div>
              </>
            )}

            {active === "layout" && (
              <FeatureChipGrid
                label="Layout"
                options={ROOM_LAYOUTS}
                value={form.layout}
                onChange={(v) => setForm((f) => ({ ...f, layout: v }))}
                multiple={false}
                resetValue={baselineRef.current.layout}
              />
            )}

            {active === "features" && (
              <FeatureChipGrid
                label="Room Options"
                options={ROOM_OPTIONS}
                value={form.roomOptions}
                onChange={setList("roomOptions")}
                resetValue={baselineRef.current.roomOptions}
              />
            )}

            {active === "amenities" && (
              <FeatureChipGrid
                label="Room Amenities"
                options={amenitiesMaster.map((a) => a.name)}
                value={form.amenities}
                onChange={setList("amenities")}
                resetValue={baselineRef.current.amenities}
                onManage={() => setManageOpen("amenities")}
                manageLabel="Manage Amenities"
              />
            )}

            {active === "suited" && (
              <>
                <FeatureChipGrid
                  label="Best Suited For"
                  options={BEST_SUITED_FOR}
                  value={form.bestSuitedFor}
                  onChange={setList("bestSuitedFor")}
                  resetValue={baselineRef.current.bestSuitedFor}
                />
                {showSuiteSection && (
                  <div style={{ marginTop: "var(--space-6)" }}>
                    <FeatureChipGrid
                      label="Suite Features"
                      options={SUITE_FEATURES}
                      value={form.suiteFeatures}
                      onChange={setList("suiteFeatures")}
                      resetValue={baselineRef.current.suiteFeatures}
                      hint="Shown because the selected Room Type is a suite."
                    />
                  </div>
                )}
              </>
            )}

            {active === "notes" && (
              <div className="notes-panel">
                <Textarea
                  placeholder="Add internal notes about this room..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                />
                <p className="notes-panel__hint"><Info size={12} strokeWidth={2} style={{ verticalAlign: "-2px", marginRight: 4 }} />Notes are kept in this session only and are not saved with the room record.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </Modal>
    <ConfirmModal
      open={confirmOpen}
      onClose={cancelDiscard}
      onConfirm={confirmDiscard}
      title="Unsaved Changes"
      message="You have unsaved changes. Discard them and continue?"
      confirmLabel="Discard Changes"
      danger
    />
    <MasterDataManager open={manageOpen === "roomTypes"} onClose={() => setManageOpen(null)} kind="roomTypes" label="Room Types" />
    <MasterDataManager open={manageOpen === "amenities"} onClose={() => setManageOpen(null)} kind="amenities" label="Amenities" />
    <RoomTemplateManager
      open={templateManagerOpen}
      onClose={() => setTemplateManagerOpen(false)}
      currentForm={form}
    />
    </>
  );
}

// Room Template master-data manager. Kept alongside RoomForm (rather than in
// MasterDataManager) because template records carry a full room field-set
// under `values`, not just a name — "Edit" here means renaming the template;
// the room fields it applies come from "Save Current Form as Template",
// which snapshots whatever is in the form right now.
function RoomTemplateManager({ open, onClose, currentForm }) {
  const data = useData();
  const toast = useToast();
  const templates = data.masters.roomTemplates;

  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [newName, setNewName] = useState("");

  const startEdit = (t) => { setEditingId(t.id); setDraftName(t.name); };
  const cancelEdit = () => { setEditingId(null); setDraftName(""); };
  const saveEdit = () => {
    if (!draftName.trim()) return;
    const t = templates.find((tt) => tt.id === editingId);
    data.updateMasterItem("roomTemplates", { ...t, name: draftName.trim() });
    toast.success("Template updated.");
    cancelEdit();
  };

  const confirmDelete = () => {
    data.deleteMasterItem("roomTemplates", confirmDeleteId);
    toast.success("Template removed.");
    setConfirmDeleteId(null);
  };

  const saveCurrentAsTemplate = () => {
    if (!newName.trim()) return;
    const { propertyId, ...values } = currentForm;
    data.addMasterItem("roomTemplates", { name: newName.trim(), values });
    toast.success(`Saved as "${newName.trim()}" template.`);
    setNewName("");
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Manage Room Templates" size="sm">
        <div className="master-manager">
          <p className="master-manager__hint">
            Templates quick-fill the room form. Save the fields currently entered as a new reusable template.
          </p>
          <div className="master-manager__list">
            {templates.map((t) => (
              <div key={t.id} className="master-manager__row">
                {editingId === t.id ? (
                  <>
                    <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                    <button type="button" className="master-manager__icon-btn" onClick={saveEdit} aria-label="Save"><Check size={15} strokeWidth={2.5} /></button>
                    <button type="button" className="master-manager__icon-btn" onClick={cancelEdit} aria-label="Cancel"><X size={15} strokeWidth={2} /></button>
                  </>
                ) : (
                  <>
                    <span className="master-manager__name">{t.name}</span>
                    <button type="button" className="master-manager__icon-btn" onClick={() => startEdit(t)} aria-label={`Rename ${t.name}`}><Pencil size={14} strokeWidth={2} /></button>
                    <button type="button" className="master-manager__icon-btn master-manager__icon-btn--danger" onClick={() => setConfirmDeleteId(t.id)} aria-label={`Delete ${t.name}`}><Trash2 size={14} strokeWidth={2} /></button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="master-manager__row">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New template name..." onKeyDown={(e) => e.key === "Enter" && saveCurrentAsTemplate()} />
            <button type="button" className="master-manager__icon-btn" onClick={saveCurrentAsTemplate} aria-label="Save current form as template"><Save size={14} strokeWidth={2} /></button>
          </div>
          <p className="master-manager__hint">Save Current Form as Template captures every field currently entered (name, type, occupancy, amenities, etc.) except the property.</p>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="This template will no longer appear in Quick-fill. Rooms already created from it are unaffected."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
