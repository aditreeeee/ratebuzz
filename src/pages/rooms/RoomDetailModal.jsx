import React from "react";
import { BedDouble, Users, Pencil, Tag } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { formatCurrency } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";

export function RoomDetailModal({ room, onClose, onEdit }) {
  const data = useData();
  if (!room) return null;

  const property = data.properties.find((p) => p.id === room.propertyId);
  const ratePlans = data.ratePlans.filter((rp) => rp.roomId === room.id);

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title="Room Details"
      size="md"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={onClose}>Close</button>
          <Button variant="primary" size="md" icon={Pencil} onClick={() => onEdit(room)}>Edit Room</Button>
        </>
      }
    >
      <div className="detail-view">
        <div className="detail-view__header">
          <div className="property-thumb property-thumb--lg"><BedDouble size={22} strokeWidth={2} /></div>
          <div>
            <div className="detail-view__title">{room.name}</div>
            <div className="detail-view__subtitle">{property?.name || "Unassigned property"}</div>
          </div>
          <div className="detail-view__header-badge"><StatusBadge status={room.status} /></div>
        </div>

        <div className="detail-grid">
          <div className="detail-field"><span>Room ID</span><strong className="tabular">{room.id}</strong></div>
          <div className="detail-field"><span>Bed Type</span><strong>{room.bedType}</strong></div>
          <div className="detail-field"><span>View</span><strong>{room.view}</strong></div>
          <div className="detail-field"><span>Occupancy</span><strong><Users size={12} strokeWidth={2} style={{ marginRight: 4 }} />{room.maxAdults} Adults / {room.maxChildren} Children</strong></div>
          <div className="detail-field"><span>Smoking</span><strong>{room.smoking ? "Allowed" : "Not Allowed"}</strong></div>
          <div className="detail-field"><span>Rate Plans</span><strong className="tabular">{ratePlans.length}</strong></div>
        </div>

        {room.description && (
          <div className="detail-field detail-field--full">
            <span>Description</span>
            <p className="detail-view__description">{room.description}</p>
          </div>
        )}

        {ratePlans.length > 0 && (
          <div className="detail-field detail-field--full">
            <span><Tag size={12} strokeWidth={2} /> Linked Rate Plans</span>
            <div className="detail-linked-list">
              {ratePlans.map((rp) => (
                <div key={rp.id} className="detail-linked-item">
                  <span>{rp.name}</span>
                  <span className="tabular">{formatCurrency(rp.basePrice, property?.currency || "USD")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
