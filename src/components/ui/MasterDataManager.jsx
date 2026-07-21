import React, { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Modal, ConfirmModal } from "./Modal.jsx";
import { Input } from "./Input.jsx";
import { Button } from "./Button.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

// Generic Add / Edit / Delete manager for simple `{ id, name }` master
// tables (Room Types, Amenities). Reads and writes through DataContext's
// `masters[kind]` slice, so it needs nothing beyond a `kind` key and a
// human label — the same component will keep working unmodified once
// `kind` is backed by a SQL Server master table instead of mock state.
export function MasterDataManager({ open, onClose, kind, label }) {
  const data = useData();
  const toast = useToast();
  const items = data.masters[kind] || [];

  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const startEdit = (item) => { setEditingId(item.id); setDraftName(item.name); };
  const cancelEdit = () => { setEditingId(null); setDraftName(""); };
  const saveEdit = () => {
    if (!draftName.trim()) return;
    const item = items.find((i) => i.id === editingId);
    data.updateMasterItem(kind, { ...item, name: draftName.trim() });
    toast.success(`${label} updated.`);
    cancelEdit();
  };

  const startCreate = () => { setCreating(true); setNewName(""); };
  const saveCreate = () => {
    if (!newName.trim()) return;
    data.addMasterItem(kind, { name: newName.trim() });
    toast.success(`${label} added.`);
    setCreating(false);
    setNewName("");
  };

  const confirmDelete = () => {
    data.deleteMasterItem(kind, confirmDeleteId);
    toast.success(`${label} removed.`);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Manage ${label}`} size="sm">
        <div className="master-manager">
          <p className="master-manager__hint">
            These records are shared across every room form. Changes apply immediately.
          </p>
          <div className="master-manager__list">
            {items.map((item) => (
              <div key={item.id} className="master-manager__row">
                {editingId === item.id ? (
                  <>
                    <Input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    />
                    <button type="button" className="master-manager__icon-btn" onClick={saveEdit} aria-label="Save">
                      <Check size={15} strokeWidth={2.5} />
                    </button>
                    <button type="button" className="master-manager__icon-btn" onClick={cancelEdit} aria-label="Cancel">
                      <X size={15} strokeWidth={2} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="master-manager__name">{item.name}</span>
                    <button type="button" className="master-manager__icon-btn" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}>
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="master-manager__icon-btn master-manager__icon-btn--danger"
                      onClick={() => setConfirmDeleteId(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            ))}

            {creating && (
              <div className="master-manager__row">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`New ${label.toLowerCase().replace(/s$/, "")}...`}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveCreate()}
                />
                <button type="button" className="master-manager__icon-btn" onClick={saveCreate} aria-label="Add">
                  <Check size={15} strokeWidth={2.5} />
                </button>
                <button type="button" className="master-manager__icon-btn" onClick={() => setCreating(false)} aria-label="Cancel">
                  <X size={15} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {!creating && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={startCreate} className="master-manager__add">
              Add {label.replace(/s$/, "")}
            </Button>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title={`Delete ${label.replace(/s$/, "")}`}
        message={`This will remove it from the ${label} list. Rooms already using this value keep it as free text.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
