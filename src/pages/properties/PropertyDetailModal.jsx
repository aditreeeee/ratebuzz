import React from "react";
import { Building, MapPin, Star, Pencil } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { TagChips } from "../../components/ui/TagChips.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { formatDate } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";

export function PropertyDetailModal({ property, onClose, onEdit }) {
  const data = useData();
  if (!property) return null;

  return (
    <Modal
      open={!!property}
      onClose={onClose}
      title="Property Details"
      size="md"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={onClose}>Close</button>
          <Button variant="primary" size="md" icon={Pencil} onClick={() => onEdit(property)}>Edit Property</Button>
        </>
      }
    >
      <div className="detail-view">
        <div className="detail-view__header">
          <div className="property-thumb property-thumb--lg">
            {property.logoUrl ? <img src={property.logoUrl} alt="" /> : <Building size={22} strokeWidth={2} />}
          </div>
          <div>
            <div className="detail-view__title">{property.name}</div>
            <div className="detail-view__subtitle">
              <MapPin size={13} strokeWidth={2} /> {property.city}, {property.country}
            </div>
          </div>
          <div className="detail-view__header-badge"><StatusBadge status={property.status} /></div>
        </div>

        <div className="detail-grid">
          <div className="detail-field"><span>Property ID</span><strong className="tabular">{property.id}</strong></div>
          <div className="detail-field"><span>Brand</span><strong>{property.brand}</strong></div>
          <div className="detail-field"><span>Property Type</span><strong>{property.propertyType}</strong></div>
          <div className="detail-field"><span>Star Rating</span><strong><Star size={12} strokeWidth={2} fill="currentColor" style={{ marginRight: 4, color: "var(--color-warning)" }} />{property.starRating}</strong></div>
          <div className="detail-field"><span>Currency</span><strong>{property.currency}</strong></div>
          <div className="detail-field"><span>Time Zone</span><strong>{property.timeZone}</strong></div>
          <div className="detail-field"><span>Rooms</span><strong className="tabular">{data.roomCountFor(property.id)}</strong></div>
          <div className="detail-field"><span>Rate Plans</span><strong className="tabular">{data.ratePlanCountFor(property.id)}</strong></div>
          <div className="detail-field"><span>Last Modified</span><strong className="tabular">{formatDate(property.lastModifiedAt)} &middot; {property.lastModifiedBy}</strong></div>
        </div>

        <div className="detail-field detail-field--full">
          <span>Tags</span>
          <TagChips tags={property.tags} max={10} />
        </div>

        {property.description && (
          <div className="detail-field detail-field--full">
            <span>Description</span>
            <p className="detail-view__description">{property.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
