import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag, MapPin, Pencil, Archive, RotateCcw, Trash2,
  LayoutGrid, BedDouble, Layers, UtensilsCrossed, Ban,
  Percent, StickyNote, History,
} from "lucide-react";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { propertyScopedCrumbs } from "../../lib/breadcrumbs.js";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { Textarea } from "../../components/ui/Input.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatDate } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { mealPlanLabel } from "../../mocks/ratePlans.js";
import { RatePlanForm } from "./RatePlanForm.jsx";
import { RatePlanRoomPricingRangesEditor } from "./PricingRangesTable.jsx";
import { RoomInfoCard } from "./RoomInfoCard.jsx";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "rooms", label: "Pricing Ranges", icon: Layers },
  { key: "mealPlan", label: "Meal Plan", icon: UtensilsCrossed },
  { key: "cancellation", label: "Cancellation Policy", icon: Ban },
  { key: "taxes", label: "Taxes & Fees", icon: Percent },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "audit", label: "Audit Information", icon: History },
];

// One card per Rate Plan Room — its own Pricing Ranges editor and a delete
// action. Room membership itself is managed from the Overview tab's
// Rooms/Property selector, not here, so there's no room picker on this card.
// This tab, unlike the Add/Edit modal, persists immediately since the parent
// Rate Plan already exists here (the same "genuinely editable" convention
// this codebase uses elsewhere for profile-page tabs).
function RatePlanRoomCard({ ratePlanRoom, roomOptions, onDelete, canDelete }) {
  const room = roomOptions.find((r) => r.id === ratePlanRoom.roomId);
  return (
    <Card className="rate-plan-room-card" padded={false} glow={false}>
      <div className="rate-plan-room-card__header">
        <div className="rate-plan-room-card__room-field">
          <strong>{room ? room.label : "Unknown room"}</strong>
        </div>
        <div className="rate-plan-room-card__actions">
          <button
            type="button"
            className="table__action-btn table__action-btn--danger"
            title="Remove Room"
            onClick={onDelete}
            disabled={!canDelete}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="rate-plan-room-card__body">
        <RatePlanRoomPricingRangesEditor ratePlanRoomId={ratePlanRoom.id} />
      </div>
    </Card>
  );
}

export function RatePlanProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const toast = useToast();
  const permissions = usePermissions();
  const [active, setActive] = useState("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState(null);
  const [notes, setNotes] = useState("");

  const ratePlan = data.ratePlans.find((rp) => rp.id === id);
  const ratePlanRooms = useMemo(() => (ratePlan ? data.roomsForRatePlan(ratePlan.id) : []), [data, ratePlan]);
  const roomLookup = (roomId) => data.rooms.find((r) => r.id === roomId);
  const propertyForRoom = (room) => (room ? data.properties.find((p) => p.id === room.propertyId) : null);
  const allRoomOptions = useMemo(
    () => data.rooms.map((r) => ({ id: r.id, label: `${r.name} — ${propertyForRoom(r)?.name || "Unknown Property"}` })),
    [data.rooms, data.properties]
  );

  if (!ratePlan) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Rate Plans", to: "/portal/rate-plans" }, { label: "Not found" }]} />
        <EmptyState icon={Tag} title="Rate plan not found" message="It may have been deleted." action={<Button variant="secondary" onClick={() => navigate("/portal/rate-plans")}>Back to Rate Plans</Button>} />
      </div>
    );
  }

  const handleSubmit = (form, ratePlanRoomsDraft, opts) => {
    data.updateRatePlan({ ...ratePlan, ...form });
    if (ratePlanRoomsDraft) data.saveRatePlanRooms(ratePlan.id, ratePlanRoomsDraft);
    toast.success(`${form.name} updated.`);
    if (!opts?.keepOpen) setFormOpen(false);
  };

  const handleArchive = () => { data.archiveRatePlan(ratePlan); toast.info(`${ratePlan.name} archived.`); };
  const handleRestore = () => { data.restoreRatePlan(ratePlan); toast.success(`${ratePlan.name} restored.`); };
  const handleDeletePermanently = () => {
    data.deleteRatePlanPermanently(ratePlan.id);
    toast.success(`${ratePlan.name} permanently deleted.`);
    navigate("/portal/rate-plans");
  };

  const handleDeleteRatePlanRoom = () => {
    data.deleteRatePlanRoom(confirmDeleteRoomId);
    toast.success("Room removed from rate plan.");
    setConfirmDeleteRoomId(null);
  };

  const roomNames = ratePlanRooms.map((rp) => roomLookup(rp.roomId)?.name).filter(Boolean);
  const firstRoom = ratePlanRooms.length ? roomLookup(ratePlanRooms[0].roomId) : null;
  const firstProperty = propertyForRoom(firstRoom);

  return (
    <div>
      <Breadcrumbs
        items={[
          ...propertyScopedCrumbs(firstProperty),
          { label: ratePlan.name },
        ]}
      />

      <Card>
        <div className="profile-header">
          <div className="property-thumb property-thumb--lg"><Tag size={22} strokeWidth={2} /></div>
          <div className="profile-header__info">
            <div className="profile-header__title">{ratePlan.name}</div>
            <div className="profile-header__subtitle">
              <MapPin size={13} strokeWidth={2} /> {roomNames.length ? roomNames.join(", ") : "No rooms yet"}
              <span style={{ marginLeft: 8 }}><StatusBadge status={ratePlan.status} /></span>
            </div>
          </div>
          <div className="profile-header__actions">
            {ratePlan.status !== "Archived" ? (
              <Button variant="ghost" size="md" icon={Archive} onClick={handleArchive}>Archive</Button>
            ) : (
              <>
                <Button variant="ghost" size="md" icon={RotateCcw} onClick={handleRestore}>Restore</Button>
                {permissions.canDeleteRatePlanPermanently && (
                  <Button variant="danger" size="md" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete Permanently</Button>
                )}
              </>
            )}
            <Button variant="primary" size="md" icon={Pencil} onClick={() => setFormOpen(true)}>Edit</Button>
          </div>
        </div>
      </Card>

      <div className="page-section">
        <Card className="current-price-card">
          <div className="current-price-card__label"><Tag size={14} strokeWidth={2} /> {ratePlan.name}</div>
          <div className="current-price-card__row">
            <div className="current-price-card__stat">
              <span>Meal Plan</span>
              <strong title={mealPlanLabel(ratePlan.mealPlan)}>{ratePlan.mealPlan}</strong>
            </div>
            <div className="current-price-card__stat">
              <span>Linked Room(s)</span>
              <strong>{roomNames.length ? (roomNames.length > 2 ? `${roomNames.length} rooms` : roomNames.join(", ")) : "None yet"}</strong>
            </div>
            <div className="current-price-card__stat">
              <span>Property</span>
              <strong>{firstProperty?.name || "—"}</strong>
            </div>
            <div className="current-price-card__stat">
              <span>Status</span>
              <strong><StatusBadge status={ratePlan.status} /></strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="page-section">
        <Tabs tabs={TABS} active={active} onChange={setActive} />
      </div>

      {active === "overview" && (
        <>
          <Card>
            <div className="detail-grid">
              <div className="detail-field"><span>Rate Plan ID</span><strong className="tabular">{ratePlan.id}</strong></div>
              <div className="detail-field"><span>Name</span><strong>{ratePlan.name}</strong></div>
              <div className="detail-field"><span>Status</span><strong><StatusBadge status={ratePlan.status} /></strong></div>
              <div className="detail-field"><span>Rooms</span><strong className="tabular">{ratePlanRooms.length}</strong></div>
            </div>
          </Card>

          {/* Room/Property association is edited only via the Edit button (RatePlanForm's
              own Overview room/property selector) — not inline here, per the Details page's
              simplified, read-only Overview. */}
          {ratePlanRooms.length > 0 && (
            <Card style={{ marginTop: "var(--space-4)" }}>
              <div className="config-summary__section-title">
                <span className="config-summary__section-title-text"><BedDouble size={14} strokeWidth={2} /> Room Information</span>
              </div>
              {ratePlanRooms.map((rp) => {
                const room = roomLookup(rp.roomId);
                return <RoomInfoCard key={rp.id} room={room} propertyName={propertyForRoom(room)?.name} />;
              })}
            </Card>
          )}
        </>
      )}

      {active === "rooms" && (
        <Card>
          {ratePlanRooms.length === 0 && (
            <EmptyState icon={BedDouble} title="No rooms yet" message="Select rooms or a property from the Overview tab to link them to this rate plan." />
          )}
          {ratePlanRooms.map((rp) => (
            <RatePlanRoomCard
              key={rp.id}
              ratePlanRoom={rp}
              roomOptions={allRoomOptions}
              onDelete={() => setConfirmDeleteRoomId(rp.id)}
              canDelete
            />
          ))}
        </Card>
      )}

      {active === "mealPlan" && (
        <Card>
          <div className="detail-field" title={mealPlanLabel(ratePlan.mealPlan)}>
            <span>Meal Plan</span>
            <strong>{ratePlan.mealPlan} &middot; {mealPlanLabel(ratePlan.mealPlan)}</strong>
          </div>
        </Card>
      )}

      {active === "cancellation" && (
        <Card>
          <div className="detail-grid">
            <div className="detail-field"><span>Cancellation Policy</span><strong>{ratePlan.cancellationPolicy}</strong></div>
            <div className="detail-field"><span>Partial Refund</span><strong>{ratePlan.partialRefundAllowed ? "Yes" : "No"}</strong></div>
            {ratePlan.partialRefundAllowed && (
              <>
                <div className="detail-field"><span>Refund Percentage</span><strong className="tabular">{ratePlan.refundPercent}%</strong></div>
                <div className="detail-field"><span>Refund Until</span><strong className="tabular">{ratePlan.refundUntilValue} {ratePlan.refundUntilUnit} before check-in</strong></div>
              </>
            )}
          </div>
        </Card>
      )}

      {active === "taxes" && (
        <Card>
          <div className="detail-grid">
            <div className="detail-field"><span>Tax Inclusive</span><strong>{ratePlan.taxInclusive ? "Yes" : "No"}</strong></div>
            <div className="detail-field"><span>Tax Percent</span><strong className="tabular">{ratePlan.taxPercent}%</strong></div>
          </div>
        </Card>
      )}

      {active === "notes" && (
        <Card>
          <div className="notes-panel">
            <Textarea
              placeholder="Add internal notes about this rate plan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
            <div>
              <Button variant="primary" size="sm" onClick={() => toast.success("Notes saved (session only).")}>Save Notes</Button>
            </div>
            <p className="notes-panel__hint">Notes are kept in this session only — a real notes/audit endpoint will replace this once the backend exists.</p>
          </div>
        </Card>
      )}

      {active === "audit" && (
        <Card>
          <div className="detail-grid">
            <div className="detail-field"><span>Rate Plan ID</span><strong className="tabular">{ratePlan.id}</strong></div>
            <div className="detail-field"><span>Rooms</span><strong className="tabular">{roomNames.join(", ") || "—"}</strong></div>
            <div className="detail-field"><span>Last Modified</span><strong className="tabular">{formatDate(ratePlan.lastModifiedAt)}</strong></div>
            <div className="detail-field"><span>Last Modified By</span><strong>{ratePlan.lastModifiedBy || "—"}</strong></div>
          </div>
        </Card>
      )}

      <RatePlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={ratePlan}
        rooms={allRoomOptions}
        allRooms={data.rooms}
        properties={data.properties}
        scopeRoomId=""
      />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeletePermanently}
        title="Delete Rate Plan Permanently"
        message={`"${ratePlan.name}" is archived. Permanently deleting it cannot be undone. All of its rooms' Pricing Range rows will be deleted along with it.`}
        confirmLabel="Delete Permanently"
        danger
      />

      <ConfirmModal
        open={!!confirmDeleteRoomId}
        onClose={() => setConfirmDeleteRoomId(null)}
        onConfirm={handleDeleteRatePlanRoom}
        title="Remove Room from Rate Plan"
        message="Remove this room from the rate plan? Its Pricing Range rows for this room will be deleted along with it. This action cannot be undone."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
