import React, { useState, useMemo, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Tag, Pencil, Trash2, RotateCcw, Archive, Upload, Building2 } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { SearchBar } from "../../components/ui/SearchBar.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { Checkbox } from "../../components/ui/Checkbox.jsx";
import { BulkActionBar } from "../../components/ui/BulkActionBar.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { ExportMenu } from "../../components/ui/ExportMenu.jsx";
import { ImportWizard } from "../../components/ui/ImportWizard.jsx";
import { PropertyRoomTreeFilter, useSelectedRooms } from "../../components/ui/PropertyRoomTreeFilter.jsx";
import { useData } from "../../context/DataContext.jsx";
import { usePropertyContext } from "../../context/PropertyContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useSelection } from "../../hooks/useSelection.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useAppSettings } from "../../context/AppSettingsContext.jsx";
import { usePaginatedSortedFiltered, formatDate } from "../../lib/format.js";
import { RATE_PLAN_STATUSES, mealPlanLabel } from "../../mocks/ratePlans.js";
import { RatePlanForm } from "./RatePlanForm.jsx";
import { TagChips } from "../../components/ui/TagChips.jsx";
import { DEFAULT_FILTERS_DEFAULTS } from "../../lib/appSettingsStore.js";
import { IMPORT_EXPORT_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

const BASE_COLUMNS = [
  { key: "id", label: "Rate Plan ID", sortable: true, width: 120 },
  { key: "name", label: "Name", sortable: true },
  { key: "room", label: "Room", sortable: false, width: 150 },
  { key: "property", label: "Property", sortable: false, width: 160 },
  { key: "mealPlan", label: "Meal Plan", sortable: false, width: 150 },
  { key: "pricingRange", label: "Pricing Range", sortable: false, width: 190 },
  { key: "status", label: "Status", sortable: true, width: 100 },
  { key: "actions", label: "", sortable: false, width: 150 },
];

const VIEW_TABS = [
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
];

// Extracted + memoized so a re-render of RatePlansPage (e.g. a search
// keystroke) only re-renders rows whose own props actually changed. Room
// names/property names/pricing summary are pre-resolved by the caller so
// this component's props stay comparable by React.memo's shallow check.
const RatePlanTableRow = memo(function RatePlanTableRow({
  ratePlan, roomNames, propertyNames, pricingSummary, selected, onToggleSelect, onOpen, showId,
  onEdit, onArchive, onRestore, onDeleteRequest, canDeletePermanently,
}) {
  const rp = ratePlan;
  return (
    <tr>
      <td>
        <Checkbox checked={selected} onChange={() => onToggleSelect(rp.id)} label={`Select ${rp.name}`} />
      </td>
      {showId && <td className="tabular table__cell-muted">{rp.id}</td>}
      <td className="row-link" onClick={() => onOpen(rp.id)}>
        <div className="table__cell-primary">{rp.name}</div>
        <div className="table__cell-muted">{rp.cancellationPolicy}</div>
      </td>
      <td><TagChips tags={roomNames} max={2} /></td>
      <td className="table__cell-muted">{propertyNames || "—"}</td>
      <td title={mealPlanLabel(rp.mealPlan)}>{rp.mealPlan}</td>
      <td className="table__cell-muted">{pricingSummary}</td>
      <td><StatusBadge status={rp.status} /></td>
      <td>
        <div className="table__actions">
          {rp.status !== "Archived" ? (
            <>
              <button className="table__action-btn" title="Edit" onClick={() => onEdit(rp)}><Pencil size={15} strokeWidth={2} /></button>
              <button className="table__action-btn" title="Archive" onClick={() => onArchive(rp)}><Archive size={15} strokeWidth={2} /></button>
            </>
          ) : (
            <>
              <button className="table__action-btn" title="Restore" onClick={() => onRestore(rp)}><RotateCcw size={15} strokeWidth={2} /></button>
              {canDeletePermanently && (
                <button className="table__action-btn table__action-btn--danger" title="Delete Permanently" onClick={() => onDeleteRequest(rp)}><Trash2 size={15} strokeWidth={2} /></button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

export function RatePlansPage() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { selectedPropertyIds, setSelectedPropertyIds } = usePropertyContext();
  // Room-level selection is new and Rate-Plans-specific, so it's kept as
  // page-local state rather than added to the shared PropertyContext — Rooms
  // page and other consumers of that context don't need this granularity.
  // Property-level selection still reuses PropertyContext so breadcrumbs and
  // any other property-scoped consumer stay in sync.
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [search, setSearch] = useState("");
  const [mealPlanFilter, setMealPlanFilter] = usePersistedState("ratePlans.mealPlanFilter", []);
  const [defaultFilters] = usePersistedState("settings.defaultFilters", DEFAULT_FILTERS_DEFAULTS);
  const [viewMode, setViewMode] = usePersistedState("ratePlans.viewMode", defaultFilters.ratePlansView);
  const [sortKey, setSortKey] = usePersistedState("ratePlans.sortKey", "name");
  const [sortDir, setSortDir] = usePersistedState("ratePlans.sortDir", "asc");
  const { table: tablePrefs } = useAppSettings();
  const PAGE_SIZE = tablePrefs.pageSize;
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const selectedProperties = useMemo(
    () => data.properties.filter((p) => selectedPropertyIds.includes(p.id)),
    [data.properties, selectedPropertyIds]
  );
  const selectedProperty = selectedProperties.length === 1 ? selectedProperties[0] : null;

  // Keep room-level selection valid if the underlying scoped rooms change
  // (e.g. role switch, or a room gets deleted) — mirrors the same cleanup
  // PropertyContext already does for selectedPropertyIds.
  useEffect(() => {
    const validRoomIds = new Set(data.rooms.map((r) => r.id));
    setSelectedRoomIds((ids) => ids.filter((id) => validRoomIds.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.rooms]);

  // Effective selected rooms = union of rooms under any selected property,
  // plus any individually-selected room. This is the single source of truth
  // the table and the Add Rate Plan prefill both read from.
  const effectiveRoomIds = useSelectedRooms({
    properties: data.properties,
    rooms: data.rooms,
    selectedPropertyIds,
    selectedRoomIds,
  });
  const hasSelection = selectedPropertyIds.length > 0 || selectedRoomIds.length > 0;

  const roomsForProperty = useMemo(
    () => data.rooms.filter((r) => effectiveRoomIds.includes(r.id)),
    [data.rooms, effectiveRoomIds]
  );

  const roomLookup = (id) => data.rooms.find((r) => r.id === id);
  const propertyForRoom = (room) => data.properties.find((p) => p.id === room?.propertyId);
  const roomOptions = useMemo(
    () => roomsForProperty.map((r) => ({ id: r.id, label: `${r.name} — ${propertyForRoom(r)?.name || "Unknown Property"}` })),
    [roomsForProperty, data.properties]
  );

  // Prefill the Add Rate Plan form's room only when the current selection
  // resolves to exactly one room — otherwise let the user pick explicitly.
  const scopeRoomId = effectiveRoomIds.length === 1 ? effectiveRoomIds[0] : "";
  const selectedRoom = data.rooms.find((r) => r.id === scopeRoomId);

  // A Rate Plan is now "in scope" if at least one of its Rooms references a
  // room within the current property/room selection.
  const roomNamesForRatePlan = (ratePlanId) =>
    data.ratePlanRooms.filter((rp) => rp.ratePlanId === ratePlanId).map((rp) => roomLookup(rp.roomId)?.name).filter(Boolean);

  // A Rate Plan has no applicability window of its own anymore — Pricing
  // Ranges (per Room) are the only validity mechanism, so this is a display
  // aggregate only, computed on the fly from every linked room's rows.
  const pricingRangeSummary = (ratePlanId) => {
    const ratePlanRoomIds = data.ratePlanRooms.filter((rp) => rp.ratePlanId === ratePlanId).map((rp) => rp.id);
    const rows = data.pricingRanges.filter((pr) => ratePlanRoomIds.includes(pr.ratePlanRoomId));
    if (rows.length === 0) return "No pricing ranges yet";
    if (rows.some((r) => r.alwaysApplicable || (!r.startDate && !r.endDate))) return "Always applicable";
    const starts = rows.map((r) => r.startDate).filter(Boolean).sort();
    const ends = rows.map((r) => r.endDate).filter(Boolean).sort();
    if (!starts.length || !ends.length) return "Always applicable";
    return `${formatDate(starts[0])} – ${formatDate(ends[ends.length - 1])}`;
  };

  const ratePlansInScope = useMemo(() => {
    const roomIdSet = new Set(effectiveRoomIds);
    const inScopeRatePlanIds = new Set(
      data.ratePlanRooms.filter((rp) => roomIdSet.has(rp.roomId)).map((rp) => rp.ratePlanId)
    );
    return data.ratePlans.filter((rp) => inScopeRatePlanIds.has(rp.id));
  }, [data.ratePlans, data.ratePlanRooms, effectiveRoomIds]);

  const ratePlansInView = useMemo(
    () => ratePlansInScope.filter((rp) => (viewMode === "archived" ? rp.status === "Archived" : rp.status !== "Archived")),
    [ratePlansInScope, viewMode]
  );

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtersActive = Boolean(search) || mealPlanFilter.length > 0;
  const resetFilters = () => {
    setSearch(""); setMealPlanFilter([]);
    setPage(1);
  };

  // Any change to the panel's filter selections (property/room scope, meal
  // plan) or the search box should snap back to page 1.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropertyIds, selectedRoomIds, mealPlanFilter, search, viewMode]);

  const { pageData, total } = useMemo(
    () =>
      usePaginatedSortedFiltered({
        data: ratePlansInView,
        search,
        searchFields: ["id", "name", "mealPlan"],
        filters: { mealPlan: mealPlanFilter },
        sortKey,
        sortDir,
        page,
        pageSize: PAGE_SIZE,
      }),
    [ratePlansInView, search, mealPlanFilter, sortKey, sortDir, page, PAGE_SIZE]
  );

  const visibleIds = pageData.map((rp) => rp.id);
  const selection = useSelection(visibleIds);

  const columns = [
    {
      key: "select",
      label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onChange={selection.toggleAll} label="Select all" />,
      sortable: false,
      width: 40,
    },
    ...(tablePrefs.showIdColumn ? BASE_COLUMNS : BASE_COLUMNS.filter((c) => c.key !== "id")),
  ];
  // Floor for the flexible "Name" column, plus every fixed column's own
  // width — passed to <Table minWidth> so the grid scrolls horizontally on
  // narrower viewports instead of squeezing the name column illegibly.
  const NAME_COLUMN_FLOOR = 220;
  const tableMinWidth = columns.reduce((sum, c) => sum + (c.width || NAME_COLUMN_FLOOR), 0);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (rp) => { setEditing(rp); setFormOpen(true); };

  const handleSubmit = (form, ratePlanRoomsDraft, opts) => {
    if (editing) {
      data.updateRatePlan({ ...editing, ...form });
      data.saveRatePlanRooms(editing.id, ratePlanRoomsDraft);
      toast.success(`${form.name} updated.`);
    } else {
      const created = data.addRatePlan(form);
      data.saveRatePlanRooms(created.id, ratePlanRoomsDraft);
      toast.success(`${created.name} created as ${created.id}.`);
    }
    if (!opts?.keepOpen) setFormOpen(false);
  };

  const handleArchive = (rp) => { data.archiveRatePlan(rp); toast.info(`${rp.name} archived.`); };
  const handleRestore = (rp) => { data.restoreRatePlan(rp); toast.success(`${rp.name} restored.`); };

  const handleDelete = () => {
    data.deleteRatePlanPermanently(confirmDelete.id);
    toast.success(`${confirmDelete.name} permanently deleted.`);
    setConfirmDelete(null);
  };

  const handleBulkArchive = () => {
    data.bulkArchiveRatePlans(selection.selected);
    toast.info(`${selection.count} rate plan(s) archived.`);
    selection.clear();
  };
  const handleBulkRestore = () => {
    data.bulkRestoreRatePlans(selection.selected);
    toast.success(`${selection.count} rate plan(s) restored.`);
    selection.clear();
  };
  const handleBulkDelete = () => {
    data.bulkDeleteRatePlans(selection.selected);
    toast.success(`${selection.count} rate plan(s) permanently deleted.`);
    selection.clear();
    setConfirmBulkDelete(false);
  };
  const handleBulkStatus = (status) => {
    data.bulkChangeStatusRatePlans(selection.selected, status);
    toast.info(`Status updated to ${status} for ${selection.count} rate plan(s).`);
    selection.clear();
  };

  const archivedView = viewMode === "archived";
  const changeStatusOptions = RATE_PLAN_STATUSES.filter((s) => s !== "Archived");

  const exportColumns = [
    { label: "Rate Plan ID", value: (rp) => rp.id },
    { label: "Name", value: (rp) => rp.name },
    { label: "Room", value: (rp) => roomNamesForRatePlan(rp.id).join(", ") },
    {
      label: "Property",
      value: (rp) => {
        const names = new Set(
          data.ratePlanRooms.filter((p) => p.ratePlanId === rp.id).map((p) => propertyForRoom(roomLookup(p.roomId))?.name).filter(Boolean)
        );
        return [...names].join(", ");
      },
    },
    { label: "Meal Plan", value: (rp) => `${rp.mealPlan} (${mealPlanLabel(rp.mealPlan)})` },
    { label: "Pricing Range", value: (rp) => pricingRangeSummary(rp.id) },
    { label: "Status", value: (rp) => rp.status },
  ];
  // Settings → Configuration Settings → Import & Export → Include Archived.
  const [importExportSettings] = usePersistedState("settings.competitors.importExport", IMPORT_EXPORT_SETTINGS_DEFAULTS);
  const exportRowsData = selection.count
    ? ratePlansInView.filter((rp) => selection.selected.includes(rp.id))
    : (importExportSettings.includeArchived ? ratePlansInScope : pageData);

  return (
    <div>
      <Breadcrumbs
        items={
          selectedProperty
            ? [{ label: "Properties", to: "/portal/properties" }, { label: selectedProperty.name, to: `/portal/properties/${selectedProperty.id}` }, { label: "Rate Plans" }]
            : [{ label: "Rate Plans" }]
        }
      />
      <Topbar title="Rate Plans" subtitle="Rate plans always live under Property → Room." hidePropertySelector />

      <div className="property-scoped-layout">
        <PropertyRoomTreeFilter
          selectedPropertyIds={selectedPropertyIds}
          setSelectedPropertyIds={setSelectedPropertyIds}
          selectedRoomIds={selectedRoomIds}
          setSelectedRoomIds={setSelectedRoomIds}
          mealPlanFilter={mealPlanFilter}
          setMealPlanFilter={setMealPlanFilter}
        />

        <div className="property-scoped-layout__content">
          <div className="page-section">
            <Tabs tabs={VIEW_TABS} active={viewMode} onChange={setViewMode} />
          </div>

          <Card padded={false}>
        <div style={{ padding: "20px 20px 0" }}>
          <div className="page-toolbar">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search rate plans..." disabled={!hasSelection} />
            {filtersActive && (
              <button className="btn btn--ghost btn--sm" onClick={resetFilters}>
                <RotateCcw size={13} strokeWidth={2} /> Reset
              </button>
            )}
            <div className="page-toolbar__spacer" />
            <button className="btn btn--ghost btn--md" onClick={() => setImportOpen(true)} disabled={!hasSelection}>
              <Upload size={16} strokeWidth={2} /><span>Import</span>
            </button>
            <ExportMenu rows={exportRowsData} columns={exportColumns} filenameBase="rate-plans" selectedCount={selection.count} />
            <Button variant="primary" size="md" icon={Plus} onClick={openCreate} disabled={!hasSelection}>Add Rate Plan</Button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <BulkActionBar
            count={selection.count}
            onClear={selection.clear}
            onArchive={handleBulkArchive}
            onRestore={handleBulkRestore}
            onDelete={() => setConfirmBulkDelete(true)}
            statusOptions={changeStatusOptions}
            onChangeStatus={handleBulkStatus}
            archived={archivedView}
            canDelete={permissions.canDeleteRatePlanPermanently}
          />
          <Table
            columns={columns}
            data={pageData}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            rowKey={(row) => row.id}
            minWidth={tableMinWidth}
            stickyHeader
            emptyState={
              !hasSelection ? (
                <EmptyState
                  icon={Building2}
                  title="Select a property or room to view rate plans"
                  message="Select one or more properties or rooms from the panel on the left to view their rate plans."
                />
              ) : (
                <EmptyState
                  icon={Tag}
                  title={archivedView ? "No archived rate plans" : filtersActive ? "No rate plans match your filters" : "No rate plans yet"}
                  message={
                    archivedView || filtersActive
                      ? "Try adjusting your search or filters."
                      : "Create your first rate plan, or import one from a template."
                  }
                  action={
                    archivedView ? null : filtersActive ? (
                      <Button variant="secondary" size="sm" onClick={resetFilters}>Clear Filters</Button>
                    ) : (
                      <Button variant="secondary" size="sm" icon={Plus} onClick={openCreate}>Create Rate Plan</Button>
                    )
                  }
                />
              )
            }
            renderRow={(rp) => {
              const roomNames = roomNamesForRatePlan(rp.id);
              const propertyNames = [
                ...new Set(
                  data.ratePlanRooms.filter((p) => p.ratePlanId === rp.id).map((p) => propertyForRoom(roomLookup(p.roomId))?.name).filter(Boolean)
                ),
              ].join(", ");
              return (
                <RatePlanTableRow
                  key={rp.id}
                  ratePlan={rp}
                  roomNames={roomNames}
                  propertyNames={propertyNames}
                  pricingSummary={pricingRangeSummary(rp.id)}
                  selected={selection.selected.includes(rp.id)}
                  showId={tablePrefs.showIdColumn}
                  onToggleSelect={selection.toggle}
                  onOpen={(id) => navigate(`/portal/rate-plans/${id}`)}
                  onEdit={openEdit}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDeleteRequest={setConfirmDelete}
                  canDeletePermanently={permissions.canDeleteRatePlanPermanently}
                />
              );
            }}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          </Card>
        </div>
      </div>

      <RatePlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        roomLabel={selectedRoom?.name}
        rooms={roomOptions}
        allRooms={data.rooms}
        properties={data.properties}
        scopeRoomId={scopeRoomId}
      />

      <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} defaultEntityType="ratePlans" />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Rate Plan Permanently"
        message={`Permanently delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
      />

      <ConfirmModal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Rate Plans Permanently"
        message={`Permanently delete ${selection.count} selected rate plan(s)? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
      />
    </div>
  );
}
