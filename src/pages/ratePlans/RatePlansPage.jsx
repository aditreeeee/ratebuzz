import React, { useState, useMemo } from "react";
import { Plus, Tag, Pencil, Copy, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { SearchBar } from "../../components/ui/SearchBar.jsx";
import { Select, Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { Checkbox } from "../../components/ui/Checkbox.jsx";
import { BulkActionBar } from "../../components/ui/BulkActionBar.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useSelection } from "../../hooks/useSelection.js";
import { usePaginatedSortedFiltered, formatCurrency, formatDate } from "../../lib/format.js";
import { MEAL_PLANS, RATE_PLAN_STATUSES } from "../../mocks/ratePlans.js";
import { RatePlanForm } from "./RatePlanForm.jsx";
import { RatePlanDetailModal } from "./RatePlanDetailModal.jsx";

const PAGE_SIZE = 10;

const BASE_COLUMNS = [
  { key: "id", label: "Rate Plan ID", sortable: true, width: 120 },
  { key: "name", label: "Name", sortable: true },
  { key: "room", label: "Room", sortable: false, width: 150 },
  { key: "property", label: "Property", sortable: false, width: 160 },
  { key: "mealPlan", label: "Meal Plan", sortable: false, width: 150 },
  { key: "basePrice", label: "Base Price", sortable: true, width: 110 },
  { key: "validTo", label: "Valid Through", sortable: true, width: 130 },
  { key: "status", label: "Status", sortable: true, width: 100 },
  { key: "actions", label: "", sortable: false, width: 140 },
];

export function RatePlansPage() {
  const data = useData();
  const toast = useToast();
  const [propertyId, setPropertyId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [mealPlanFilter, setMealPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [viewing, setViewing] = useState(null);

  const roomsForProperty = useMemo(
    () => (propertyId ? data.rooms.filter((r) => r.propertyId === propertyId) : data.rooms),
    [data.rooms, propertyId]
  );
  const selectedRoom = data.rooms.find((r) => r.id === roomId);
  const selectedProperty = data.properties.find((p) => p.id === propertyId);

  const roomLookup = (id) => data.rooms.find((r) => r.id === id);
  const propertyForRoom = (room) => data.properties.find((p) => p.id === room?.propertyId);

  const ratePlansInScope = useMemo(() => {
    return data.ratePlans.filter((rp) => {
      const room = roomLookup(rp.roomId);
      if (!room) return false;
      if (roomId) return rp.roomId === roomId;
      if (propertyId) return room.propertyId === propertyId;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ratePlans, data.rooms, roomId, propertyId]);

  const dateFiltered = useMemo(
    () =>
      ratePlansInScope.filter((rp) => {
        if (dateFrom && rp.validFrom < dateFrom) return false;
        if (dateTo && rp.validTo > dateTo) return false;
        return true;
      }),
    [ratePlansInScope, dateFrom, dateTo]
  );

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtersActive = search || mealPlanFilter || statusFilter || dateFrom || dateTo;
  const resetFilters = () => {
    setSearch(""); setMealPlanFilter(""); setStatusFilter(""); setDateFrom(""); setDateTo("");
    setPage(1);
  };

  const { pageData, total } = useMemo(
    () =>
      usePaginatedSortedFiltered({
        data: dateFiltered,
        search,
        searchFields: ["id", "name", "mealPlan"],
        filters: { mealPlan: mealPlanFilter, status: statusFilter },
        sortKey,
        sortDir,
        page,
        pageSize: PAGE_SIZE,
      }),
    [dateFiltered, search, mealPlanFilter, statusFilter, sortKey, sortDir, page]
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
    ...BASE_COLUMNS,
  ];

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (rp) => { setViewing(null); setEditing(rp); setFormOpen(true); };

  const handleSubmit = (form) => {
    if (editing) {
      data.updateRatePlan({ ...editing, ...form });
      toast.success(`${form.name} updated.`);
    } else {
      const created = data.addRatePlan({ ...form, roomId });
      toast.success(`${created.name} created as ${created.id}.`);
    }
    setFormOpen(false);
  };

  const handleDuplicate = (rp) => {
    const copy = data.duplicateRatePlan(rp);
    toast.info(`Duplicated as ${copy.id}.`);
  };

  const handleDelete = () => {
    data.deleteRatePlan(confirmDelete.id);
    toast.success(`${confirmDelete.name} deleted.`);
    setConfirmDelete(null);
  };

  const handleBulkArchive = () => {
    data.bulkArchiveRatePlans(selection.selected);
    toast.info(`${selection.count} rate plan(s) set to Inactive.`);
    selection.clear();
  };
  const handleBulkDuplicate = () => {
    const copies = data.bulkDuplicateRatePlans(selection.selected);
    toast.info(`${copies.length} rate plan(s) duplicated.`);
    selection.clear();
  };
  const handleBulkDelete = () => {
    data.bulkDeleteRatePlans(selection.selected);
    toast.success(`${selection.count} rate plan(s) deleted.`);
    selection.clear();
    setConfirmBulkDelete(false);
  };
  const handleBulkStatus = (status) => {
    data.bulkChangeStatusRatePlans(selection.selected, status);
    toast.info(`Status updated to ${status} for ${selection.count} rate plan(s).`);
    selection.clear();
  };

  return (
    <div>
      <Topbar title="Rate Plans" subtitle="Rate plans always live under Property → Room." />

      <Card padded={false}>
        <div style={{ padding: "20px 20px 0" }}>
          <div className="page-toolbar">
            <Select
              options={data.properties.map((p) => p.name)}
              placeholder="All Properties"
              value={selectedProperty?.name || ""}
              onChange={(e) => {
                const p = data.properties.find((pp) => pp.name === e.target.value);
                setPropertyId(p?.id || "");
                setRoomId("");
                setPage(1);
              }}
              style={{ maxWidth: 200, fontWeight: 700 }}
            />
            <Select
              options={roomsForProperty.map((r) => r.name)}
              placeholder="All Rooms"
              value={selectedRoom?.name || ""}
              onChange={(e) => {
                const r = roomsForProperty.find((rr) => rr.name === e.target.value);
                setRoomId(r?.id || "");
                setPage(1);
              }}
              style={{ maxWidth: 180 }}
            />
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search rate plans..." />
            <Select options={MEAL_PLANS} placeholder="Meal Plan" value={mealPlanFilter} onChange={(e) => { setMealPlanFilter(e.target.value); setPage(1); }} style={{ maxWidth: 150 }} />
            <Select options={RATE_PLAN_STATUSES} placeholder="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 120 }} />
            <Input type="date" tabular value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={{ maxWidth: 150 }} title="Valid from" />
            <Input type="date" tabular value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={{ maxWidth: 150 }} title="Valid to" />
            {filtersActive && (
              <button className="btn btn--ghost btn--sm" onClick={resetFilters}>
                <RotateCcw size={13} strokeWidth={2} /> Reset
              </button>
            )}
            <div className="page-toolbar__spacer" />
            <Button variant="primary" size="md" icon={Plus} onClick={openCreate} disabled={!roomId} title={!roomId ? "Select a specific room first" : undefined}>Add Rate Plan</Button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <BulkActionBar
            count={selection.count}
            onClear={selection.clear}
            onArchive={handleBulkArchive}
            onDuplicate={handleBulkDuplicate}
            onDelete={() => setConfirmBulkDelete(true)}
            statusOptions={RATE_PLAN_STATUSES}
            onChangeStatus={handleBulkStatus}
          />
          <Table
            columns={columns}
            data={pageData}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={Tag}
                title="No rate plans found"
                message="Try adjusting your filters, or add a rate plan to a room."
                action={<Button variant="secondary" size="sm" icon={Plus} onClick={openCreate} disabled={!roomId}>Add Rate Plan</Button>}
              />
            }
            renderRow={(rp) => {
              const room = roomLookup(rp.roomId);
              const property = propertyForRoom(room);
              return (
                <tr key={rp.id}>
                  <td>
                    <Checkbox checked={selection.selected.includes(rp.id)} onChange={() => selection.toggle(rp.id)} label={`Select ${rp.name}`} />
                  </td>
                  <td className="tabular table__cell-muted">{rp.id}</td>
                  <td className="row-link" onClick={() => setViewing(rp)}>
                    <div className="table__cell-primary">{rp.name}</div>
                    <div className="table__cell-muted">{rp.cancellationPolicy}</div>
                  </td>
                  <td className="table__cell-muted">{room?.name || "—"}</td>
                  <td className="table__cell-muted">{property?.name || "—"}</td>
                  <td>{rp.mealPlan}</td>
                  <td className="tabular">{formatCurrency(rp.basePrice, property?.currency || "USD")}</td>
                  <td className="tabular">{formatDate(rp.validTo)}</td>
                  <td><StatusBadge status={rp.status} /></td>
                  <td>
                    <div className="table__actions">
                      <button className="table__action-btn" title="Edit" onClick={() => openEdit(rp)}><Pencil size={15} strokeWidth={2} /></button>
                      <button className="table__action-btn" title="Duplicate" onClick={() => handleDuplicate(rp)}><Copy size={15} strokeWidth={2} /></button>
                      <button className="table__action-btn table__action-btn--danger" title="Delete" onClick={() => setConfirmDelete(rp)}><Trash2 size={15} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </Card>

      <RatePlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        roomLabel={selectedRoom?.name}
      />

      <RatePlanDetailModal ratePlan={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Rate Plan"
        message={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete"
        danger
      />

      <ConfirmModal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Rate Plans"
        message={`Delete ${selection.count} selected rate plan(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
