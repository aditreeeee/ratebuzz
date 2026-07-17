import React, { useState, useMemo, useEffect } from "react";
import { Plus, BedDouble, Pencil, Trash2, Users, Cigarette } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { SearchBar } from "../../components/ui/SearchBar.jsx";
import { Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { usePaginatedSortedFiltered } from "../../lib/format.js";
import { RoomForm } from "./RoomForm.jsx";

const COLUMNS = [
  { key: "id", label: "Room ID", sortable: true, width: 110 },
  { key: "name", label: "Room Name", sortable: true },
  { key: "bedType", label: "Bed Type", sortable: true, width: 100 },
  { key: "occupancy", label: "Occupancy", sortable: true, width: 100 },
  { key: "view", label: "View", sortable: false, width: 130 },
  { key: "status", label: "Status", sortable: true, width: 100 },
  { key: "actions", label: "", sortable: false, width: 120 },
];

export function RoomsPage() {
  const data = useData();
  const toast = useToast();
  const [propertyId, setPropertyId] = useState(data.properties[0]?.id || "");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!propertyId && data.properties.length) setPropertyId(data.properties[0].id);
  }, [data.properties, propertyId]);

  const roomsForProperty = useMemo(() => data.rooms.filter((r) => r.propertyId === propertyId), [data.rooms, propertyId]);
  const selectedProperty = data.properties.find((p) => p.id === propertyId);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const { pageData, total } = useMemo(
    () =>
      usePaginatedSortedFiltered({
        data: roomsForProperty,
        search,
        searchFields: ["id", "name", "bedType", "view"],
        filters: {},
        sortKey,
        sortDir,
        page: 1,
        pageSize: 1000,
      }),
    [roomsForProperty, search, sortKey, sortDir]
  );

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r) => { setEditing(r); setFormOpen(true); };

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

  const handleDelete = () => {
    data.deleteRoom(confirmDelete.id);
    toast.success(`${confirmDelete.name} deleted.`);
    setConfirmDelete(null);
  };

  return (
    <div>
      <Topbar title="Rooms" subtitle="Rooms are managed within their parent property." />

      <Card padded={false}>
        <div style={{ padding: "20px 20px 0" }}>
          <div className="page-toolbar">
            <Select
              options={data.properties.map((p) => p.name)}
              value={selectedProperty?.name || ""}
              onChange={(e) => {
                const p = data.properties.find((pp) => pp.name === e.target.value);
                setPropertyId(p?.id || "");
              }}
              style={{ maxWidth: 260, fontWeight: 700 }}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search rooms..." />
            <div className="page-toolbar__spacer" />
            <Button variant="primary" size="md" icon={Plus} onClick={openCreate} disabled={!propertyId}>Add Room</Button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <Table
            columns={COLUMNS}
            data={pageData}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={BedDouble}
                title="No rooms yet"
                message={`Add the first room for ${selectedProperty?.name || "this property"}.`}
                action={<Button variant="secondary" size="sm" icon={Plus} onClick={openCreate}>Add Room</Button>}
              />
            }
            renderRow={(r) => (
              <tr key={r.id}>
                <td className="tabular table__cell-muted">{r.id}</td>
                <td>
                  <div className="table__cell-primary">{r.name}</div>
                  <div className="table__cell-muted">{r.description}</div>
                </td>
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
                    <button className="table__action-btn table__action-btn--danger" title="Delete" onClick={() => setConfirmDelete(r)}><Trash2 size={15} strokeWidth={2} /></button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </Card>

      <RoomForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initial={editing} />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will also remove its rate plans.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
