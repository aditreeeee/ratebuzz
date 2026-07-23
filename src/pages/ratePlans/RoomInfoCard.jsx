import React from "react";
import { BedDouble, MapPin } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { TagChips } from "../../components/ui/TagChips.jsx";

// Read-only summary of a Phase-1 Room's own metadata (never Pricing Range
// data — that lives on the Pricing Ranges tab). Shown once per room linked
// to a Rate Plan, on the Rate Plan's Overview.
export function RoomInfoCard({ room, propertyName }) {
  if (!room) return null;
  return (
    <Card className="rate-plan-room-card" padded glow={false}>
      <div className="rate-plan-room-card__header" style={{ marginBottom: 12 }}>
        <div className="rate-plan-room-card__room-field">
          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BedDouble size={15} strokeWidth={2} /> {room.name}
          </strong>
          {propertyName && (
            <div className="table__cell-muted" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <MapPin size={11} strokeWidth={2} /> {propertyName}
            </div>
          )}
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-field"><span>Room Type</span><strong>{room.roomType || "—"}</strong></div>
        <div className="detail-field"><span>Occupancy Type</span><strong>{room.occupancyType || "—"}</strong></div>
        <div className="detail-field"><span>Bed Configuration</span><strong>{room.bedConfiguration || "—"}{room.numberOfBeds ? ` × ${room.numberOfBeds}` : ""}</strong></div>
        <div className="detail-field"><span>View</span><strong>{room.view || "—"}</strong></div>
        <div className="detail-field"><span>Max Occupancy</span><strong className="tabular">{room.maxOccupancy ?? "—"}</strong></div>
        <div className="detail-field"><span>Size</span><strong className="tabular">{room.squareFeet ? room.squareFeet : "—"}</strong></div>
      </div>
      <div className="detail-field detail-field--full" style={{ marginTop: 12 }}>
        <span>Amenities</span>
        <TagChips tags={room.amenities || []} max={10} />
      </div>
    </Card>
  );
}
