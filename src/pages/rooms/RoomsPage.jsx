import React, { useState, useMemo } from "react";
import { Plus, BedDouble, Pencil, Copy, Trash2, Users, Cigarette, RotateCcw } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { SearchBar } from "../../components/ui/SearchBar.jsx";
import { Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { Checkbox } from "../../components/ui/Checkbox.jsx";
import { BulkActionBar } from "../../components/ui/BulkActionBar.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useSelection } from "../../hooks/useSelection.js";
import { usePaginatedSortedFiltered } from "../../lib/format.js";
import { BED_TYPES, ROOM_STATUSES } from "../../mocks/rooms.js";
import { RoomForm } from "./RoomForm.jsx";
import { RoomDetailModal } from "./RoomDetailModal.jsx";

const BASE_COLUMNS = [
  { key: "id", label: "Room ID", sortable: true, width: 110 },
  { key: "name", label: "Room Name", sortable: true },
  { key: "property", label: "Property", sortable: false, width: 170 },
  { key: "bedType", label: "Bed Type", sortable: true, width: 100 },
  { key: "occupancy", label: "Occupancy", sortable: true, width: 100 },
  { key: "view", label: "View", sortable: false, width: 130 },
  { key: "status", label: "Status", sortable: true, width: 100 },
  { key: "actions", label: "", sortable: false, width: 140 },
];

export function RoomsPage() {
  const data = useData();
  const toast = useToast();
  const [propertyId, setPropertyId] = useState("");
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("");
  const [bedTypeFilter, setBedTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [viewing, setViewing] = useState(null);

  const roomsInScope = useMemo(
    () => (propertyId ? data.rooms.filter((r) => r.propertyId === propertyId) : data.rooms),
    [data.rooms, propertyId]
  );
  const selectedProperty = data.properties.find((p) => p.id === propertyId);
  const propertyName = (id) => data.properties.find((p) => p.id === id)?.name || "—";

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtersActive = search || occupancyFilter || bedTypeFilter || statusFilter;
  const resetFilters = () => {
    setSearch(""); setOccupancyFilter(""); setBedTypeFilter(""); setStatusFilter("");
  };

  const { pageData } = useMemo(
    () =>
      usePaginatedSortedFiltered({
        data: roomsInScope,
        search,
        searchFields: ["id", "name", "bedType", "view"],
        filters: {
          occupancy: occupancyFilter ? Number(occupancyFilter) : "",
          bedType: bedTypeFilter,
          status: statusFilter,
        },
        sortKey,
        sortDir,
        page: 1,
        pageSize: 1000,
      }),
    [roomsInScope, search, occupancyFilter, bedTypeFilter, statusFilter, sortKey, sortDir]
  );

  const visibleIds = pageData.map((r) => r.id);
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
  const openEdit = (r) => { setViewing(null); setEditing(r); setFormOpen(true); };

  const handleSubmit = (form) => {
    if (editing) {
      data.updateRoom({ ...editing, ...form });
      toast.success(`${form.name} updated.`);
    } else {
      const created = data.addRoom({ ...form, propertyId });
      toast.success(`${created.name} created as ${created.id}.`);
    }
    setFormOpen(false);
  };

  const handleDuplicate = (r) => {
    const copy = data.duplicateRoom(r);
    toast.info(`Duplicated as ${copy.id}.`);
  };

  const handleDelete = () => {
    data.deleteRoom(confirmDelete.id);
    toast.success(`${confirmDelete.name} deleted.`);
    setConfirmDelete(null);
  };

  const handleBulkArchive = () => {
    data.bulkArchiveRooms(selection.selected);
    toast.info(`${selection.count} room(s) set to Inactive.`);
    selection.clear();
  };
  const handleBulkDuplicate = () => {
    const copies = data.bulkDuplicateRooms(selection.selected);
    toast.info(`${copies.length} room(s) duplicated.`);
    selection.clear();
  };
  const handleBulkDelete = () => {
    data.bulkDeleteRooms(selection.selected);
    toast.success(`${selection.count} room(s) deleted.`);
    selection.clear();
    setConfirmBulkDelete(false);
  };
  const handleBulkStatus = (status) => {
    data.bulkChangeStatusRooms(selection.selected, status);
    toast.info(`Status updated to ${status} for ${selection.count} room(s).`);
    selection.clear();
  };

  return (
    <div>
      <Topbar title="Rooms" subtitle="Rooms are managed within their parent property." />

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
              }}
              style={{ maxWidth: 220, fontWeight: 700 }}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search rooms..." />
            <Select options={["1", "2", "3", "4"]} placeholder="Occupancy" value={occupancyFilter} onChange={(e) => setOccupancyFilter(e.target.value)} style={{ maxWidth: 130 }} />
            <Select options={BED_TYPES} placeholder="Bed Type" value={bedTypeFilter} onChange={(e) => setBedTypeFilter(e.target.value)} style={{ maxWidth: 140 }} />
            <Select options={ROOM_STATUSES} placeholder="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 130 }} />
            {filtersActive && (
              <button className="btn btn--ghost btn--sm" onClick={resetFilters}>
                <RotateCcw size={13} strokeWidth={2} /> Reset
              </button>
            )}
            <div className="page-toolbar__spacer" />
            <Button variant="primary" size="md" icon={Plus} onClick={openCreate} disabled={!propertyId} title={!propertyId ? "Select a specific property first" : undefined}>Add Room</Button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <BulkActionBar
            count={selection.count}
            onClear={selection.clear}
            onArchive={handleBulkArchive}
            onDuplicate={handleBulkDuplicate}
            onDelete={() => setConfirmBulkDelete(true)}
            statusOptions={ROOM_STATUSES}
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
                icon={BedDouble}
                title="No rooms found"
                message="Try adjusting your filters, or add a new room to a property."
                action={<Button variant="secondary" size="sm" icon={Plus} onClick={openCreate} disabled={!propertyId}>Add Room</Button>}
              />
            }
            renderRow={(r) => (
              <tr key={r.id}>
                <td>
                  <Checkbox checked={selection.selected.includes(r.id)} onChange={() => selection.toggle(r.id)} label={`Select ${r.name}`} />
                </td>
                <td className="tabular table__cell-muted">{r.id}</td>
                <td className="row-link" onClick={() => setViewing(r)}>
                  <div className="table__cell-primary">{r.name}</div>
                  <div className="table__cell-muted">{r.description}</div>
                </td>
                <td className="table__cell-muted">{propertyName(r.propertyId)}</td>
                <td>{r.bedType}</td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Users size={13} strokeWidth={2} style={{ color: "var(--color-text-faint)" }} />
                    <span className="tabular">{r.maxAdults}A / {r.maxChildren}C</span>
                    {r.smoking && <Cigarette size={13} strokeWidth={2} style={{ color: "var(--color-text-faint)" }} />}
                  </span>
                </td>
                <td>{r.view}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <div className="table__actions">
                    <button className="table__action-btn" title="Edit" onClick={() => openEdit(r)}><Pencil size={15} strokeWidth={2} /></button>
                    <button className="table__action-btn" title="Duplicate" onClick={() => handleDuplicate(r)}><Copy size={15} strokeWidth={2} /></button>
                    <button className="table__action-btn table__action-btn--danger" title="Delete" onClick={() => setConfirmDelete(r)}><Trash2 size={15} strokeWidth={2} /></button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </Card>

      <RoomForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initial={editing} />

      <RoomDetailModal room={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will also remove its rate plans.`}
        confirmLabel="Delete"
        danger
      />

      <ConfirmModal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Rooms"
        message={`Delete ${selection.count} selected room(s), along with their rate plans? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
