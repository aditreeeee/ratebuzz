import React, { useState, useMemo, useEffect } from "react";
import { Plus, Tag, Pencil, Trash2 } from "lucide-react";
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
import { usePaginatedSortedFiltered, formatCurrency, formatDate } from "../../lib/format.js";
import { RatePlanForm } from "./RatePlanForm.jsx";

const COLUMNS = [
  { key: "id", label: "Rate Plan ID", sortable: true, width: 120 },
  { key: "name", label: "Name", sortable: true },
  { key: "mealPlan", label: "Meal Plan", sortable: false, width: 150 },
  { key: "basePrice", label: "Base Price", sortable: true, width: 110 },
  { key: "validTo", label: "Valid Through", sortable: true, width: 130 },
  { key: "status", label: "Status", sortable: true, width: 100 },
  { key: "actions", label: "", sortable: false, width: 120 },
];

export function RatePlansPage() {
  const data = useData();
  const toast = useToast();
  const [propertyId, setPropertyId] = useState(data.properties[0]?.id || "");
  const [roomId, setRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const roomsForProperty = useMemo(() => data.rooms.filter((r) => r.propertyId === propertyId), [data.rooms, propertyId]);

  useEffect(() => {
    if (!propertyId && data.properties.length) setPropertyId(data.properties[0].id);
  }, [data.properties, propertyId]);

  useEffect(() => {
    if (roomsForProperty.length && !roomsForProperty.find((r) => r.id === roomId)) {
      setRoomId(roomsForProperty[0].id);
    } else if (!roomsForProperty.length) {
      setRoomId("");
    }
  }, [roomsForProperty, roomId]);

  const selectedRoom = data.rooms.find((r) => r.id === roomId);
  const ratePlansForRoom = useMemo(() => data.ratePlans.filter((rp) => rp.roomId === roomId), [data.ratePlans, roomId]);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const { pageData } = useMemo(
    () =>
      usePaginatedSortedFiltered({
        data: ratePlansForRoom,
        search,
        searchFields: ["id", "name", "mealPlan"],
        filters: {},
        sortKey,
        sortDir,
        page: 1,
        pageSize: 1000,
      }),
    [ratePlansForRoom, search, sortKey, sortDir]
  );

  const currency = data.properties.find((p) => p.id === propertyId)?.currency || "USD";

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (rp) => { setEditing(rp); setFormOpen(true); };

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

  const handleDelete = () => {
    data.deleteRatePlan(confirmDelete.id);
    toast.success(`${confirmDelete.name} deleted.`);
    setConfirmDelete(null);
  };

  return (
    <div>
      <Topbar title="Rate Plans" subtitle="Rate plans always live under Property → Room." />

      <Card padded={false}>
        <div style={{ padding: "20px 20px 0" }}>
          <div className="page-toolbar">
            <Select
              options={data.properties.map((p) => p.name)}
              value={data.properties.find((p) => p.id === propertyId)?.name || ""}
              onChange={(e) => {
                const p = data.properties.find((pp) => pp.name === e.target.value);
                setPropertyId(p?.id || "");
              }}
              style={{ maxWidth: 240, fontWeight: 700 }}
            />
            <Select
              options={roomsForProperty.map((r) => r.name)}
              placeholder={roomsForProperty.length ? undefined : "No rooms available"}
              value={selectedRoom?.name || ""}
              onChange={(e) => {
                const r = roomsForProperty.find((rr) => rr.name === e.target.value);
                setRoomId(r?.id || "");
              }}
              style={{ maxWidth: 220 }}
              disabled={!roomsForProperty.length}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search rate plans..." />
            <div className="page-toolbar__spacer" />
            <Button variant="primary" size="md" icon={Plus} onClick={openCreate} disabled={!roomId}>Add Rate Plan</Button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {!roomsForProperty.length ? (
            <EmptyState
              icon={Tag}
              title="No rooms for this property"
              message="Add a room first — rate plans must be linked to a room."
            />
          ) : (
            <Table
              columns={COLUMNS}
              data={pageData}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              rowKey={(row) => row.id}
              emptyState={
                <EmptyState
                  icon={Tag}
                  title="No rate plans yet"
                  message={`Add the first rate plan for ${selectedRoom?.name || "this room"}.`}
                  action={<Button variant="secondary" size="sm" icon={Plus} onClick={openCreate}>Add Rate Plan</Button>}
                />
              }
              renderRow={(rp) => (
                <tr key={rp.id}>
                  <td className="tabular table__cell-muted">{rp.id}</td>
                  <td>
                    <div className="table__cell-primary">{rp.name}</div>
                    <div className="table__cell-muted">{rp.cancellationPolicy}</div>
                  </td>
                  <td>{rp.mealPlan}</td>
                  <td className="tabular">{formatCurrency(rp.basePrice, currency)}</td>
                  <td className="tabular">{formatDate(rp.validTo)}</td>
                  <td><StatusBadge status={rp.status} /></td>
                  <td>
                    <div className="table__actions">
                      <button className="table__action-btn" title="Edit" onClick={() => openEdit(rp)}><Pencil size={15} strokeWidth={2} /></button>
                      <button className="table__action-btn table__action-btn--danger" title="Delete" onClick={() => setConfirmDelete(rp)}><Trash2 size={15} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      </Card>

      <RatePlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        roomLabel={selectedRoom?.name}
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Rate Plan"
        message={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
