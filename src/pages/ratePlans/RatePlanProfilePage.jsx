import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag, MapPin, Pencil, Copy, Archive, RotateCcw, Trash2, Settings2,
  LayoutGrid, BedDouble, CalendarRange, UtensilsCrossed, Ban, UsersRound,
  Percent, StickyNote, History,
} from "lucide-react";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge, Badge } from "../../components/ui/Badge.jsx";
import { Textarea } from "../../components/ui/Input.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { RoomClassificationSummary } from "../../components/ui/RoomClassificationSummary.jsx";
import { formatDate, formatCurrency } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { mealPlanLabel } from "../../mocks/ratePlans.js";
import { RatePlanForm } from "./RatePlanForm.jsx";
import { RateSeasonManager } from "./RateSeasonManager.jsx";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "room", label: "Room Information", icon: BedDouble },
  { key: "pricing", label: "Seasonal Pricing", icon: CalendarRange },
  { key: "mealPlan", label: "Meal Plan", icon: UtensilsCrossed },
  { key: "cancellation", label: "Cancellation Policy", icon: Ban },
  { key: "occupancy", label: "Occupancy Rules", icon: UsersRound },
  { key: "taxes", label: "Taxes & Fees", icon: Percent },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "audit", label: "Audit Information", icon: History },
];

export function RatePlanProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const toast = useToast();
  const permissions = usePermissions();
  const [active, setActive] = useState("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState("");
  const [seasonManagerOpen, setSeasonManagerOpen] = useState(false);

  const ratePlan = data.ratePlans.find((rp) => rp.id === id);
  const room = ratePlan ? data.rooms.find((r) => r.id === ratePlan.roomId) : null;
  const property = room ? data.properties.find((p) => p.id === room.propertyId) : null;

  const assignedSeasons = ratePlan
    ? (ratePlan.seasons || []).map((name) => (data.masters.rateSeasons || []).find((s) => s.name === name)).filter(Boolean)
    : [];

  if (!ratePlan) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Rate Plans", to: "/portal/rate-plans" }, { label: "Not found" }]} />
        <EmptyState icon={Tag} title="Rate plan not found" message="It may have been deleted." action={<Button variant="secondary" onClick={() => navigate("/portal/rate-plans")}>Back to Rate Plans</Button>} />
      </div>
    );
  }

  const handleSubmit = (form, opts) => {
    data.updateRatePlan({ ...ratePlan, ...form });
    toast.success(`${form.name} updated.`);
    if (!opts?.keepOpen) setFormOpen(false);
  };

  const handleDuplicate = () => {
    const copy = data.duplicateRatePlan(ratePlan);
    toast.info(`Duplicated as ${copy.id}.`);
    navigate(`/portal/rate-plans/${copy.id}`);
  };

  const handleArchive = () => { data.archiveRatePlan(ratePlan); toast.info(`${ratePlan.name} archived.`); };
  const handleRestore = () => { data.restoreRatePlan(ratePlan); toast.success(`${ratePlan.name} restored.`); };
  const handleDeletePermanently = () => {
    data.deleteRatePlanPermanently(ratePlan.id);
    toast.success(`${ratePlan.name} permanently deleted.`);
    navigate("/portal/rate-plans");
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Properties", to: "/portal/properties" },
          ...(property ? [{ label: property.name, to: `/portal/properties/${property.id}` }] : []),
          ...(room ? [{ label: room.name, to: `/portal/rooms/${room.id}` }] : []),
          { label: ratePlan.name },
        ]}
      />

      <Card>
        <div className="profile-header">
          <div className="property-thumb property-thumb--lg"><Tag size={22} strokeWidth={2} /></div>
          <div className="profile-header__info">
            <div className="profile-header__title">{ratePlan.name}</div>
            <div className="profile-header__subtitle">
              <MapPin size={13} strokeWidth={2} /> {room?.name || "Unlinked room"} &middot; {property?.name || "—"}
              <span style={{ marginLeft: 8 }}><StatusBadge status={ratePlan.status} /></span>
            </div>
          </div>
          <div className="profile-header__actions">
            <Button variant="ghost" size="md" icon={Copy} onClick={handleDuplicate}>Duplicate</Button>
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
          <div className="current-price-card__label"><CalendarRange size={14} strokeWidth={2} /> Assigned Rate Seasons</div>
          {assignedSeasons.length > 0 ? (
            <>
              <div className="current-price-card__row">
                {assignedSeasons.map((season) => (
                  <div className="current-price-card__stat" key={season.id}>
                    <span>{season.category}</span>
                    <strong>{season.name}</strong>
                  </div>
                ))}
              </div>
              <p className="current-price-card__range">
                Master configuration only — default pricing where set. Historical and live pricing will be tracked from Phase 3 onward.
              </p>
            </>
          ) : (
            <p className="current-price-card__empty">
              No Rate Seasons assigned yet. Edit this rate plan's Seasonal Pricing section to attach one.
            </p>
          )}
        </Card>
      </div>

      <div className="page-section">
        <Tabs tabs={TABS} active={active} onChange={setActive} />
      </div>

      {active === "overview" && (
        <Card>
          <div className="detail-grid">
            <div className="detail-field"><span>Rate Plan ID</span><strong className="tabular">{ratePlan.id}</strong></div>
            <div className="detail-field"><span>Name</span><strong>{ratePlan.name}</strong></div>
            <div className="detail-field"><span>Status</span><strong><StatusBadge status={ratePlan.status} /></strong></div>
            <div className="detail-field"><span>Rate Seasons</span><strong className="tabular">{assignedSeasons.length}</strong></div>
          </div>
        </Card>
      )}

      {active === "room" && (
        <Card>
          {room ? (
            <RoomClassificationSummary room={room} />
          ) : (
            <EmptyState icon={BedDouble} title="No linked room" message="This rate plan is not linked to a room." />
          )}
        </Card>
      )}

      {active === "pricing" && (
        <Card padded={false}>
          <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Seasonal Pricing</h3>
            <Button variant="secondary" size="sm" icon={Settings2} onClick={() => setSeasonManagerOpen(true)}>Manage Rate Seasons</Button>
          </div>
          <div style={{ padding: 20 }}>
            <p className="master-manager__hint" style={{ marginBottom: 16 }}>
              Rate Seasons are reusable master templates (Standard, Peak, Weekend, Festival, Holiday, Event Season) — attach
              or remove them from the Edit form's Seasonal Pricing section. Default pricing shown here is master
              configuration only; historical and live pricing will be tracked from Phase 3 onward.
            </p>
            {assignedSeasons.length === 0 ? (
              <EmptyState
                icon={CalendarRange}
                title="No Rate Seasons assigned"
                message="Edit this rate plan and attach one or more Rate Season templates."
                action={<Button variant="secondary" size="sm" icon={Pencil} onClick={() => setFormOpen(true)}>Edit Rate Plan</Button>}
              />
            ) : (
              <div className="detail-linked-list">
                {assignedSeasons.map((season) => (
                  <div key={season.id} className="detail-linked-item">
                    <span>
                      <Badge variant="info">{season.category}</Badge> {season.name}
                    </span>
                    <span className="table__cell-muted tabular">
                      {season.hasDefaultPricing
                        ? `Base ${formatCurrency(season.defaultBaseRate, season.currency)} · Weekend ${formatCurrency(season.defaultWeekendRate, season.currency)}`
                        : "No default pricing"}
                      {season.hasValidityRange && ` · ${formatDate(season.validFrom)} – ${formatDate(season.validTo)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {active === "occupancy" && (
        <Card>
          {room ? (
            <div className="detail-grid">
              <div className="detail-field"><span>Maximum Adults</span><strong className="tabular">{room.maxAdults}</strong></div>
              <div className="detail-field"><span>Maximum Children</span><strong className="tabular">{room.maxChildren}</strong></div>
              <div className="detail-field"><span>Maximum Infants</span><strong className="tabular">{room.maxInfants}</strong></div>
              <div className="detail-field"><span>Maximum Occupancy</span><strong className="tabular">{room.maxOccupancy}</strong></div>
              <div className="detail-field"><span>Base Occupancy</span><strong className="tabular">{room.baseOccupancy}</strong></div>
              <div className="detail-field"><span>Extra Adult Allowed</span><strong>{room.extraAdultAllowed ? "Yes" : "No"}</strong></div>
              <div className="detail-field"><span>Extra Child Allowed</span><strong>{room.extraChildAllowed ? "Yes" : "No"}</strong></div>
            </div>
          ) : (
            <EmptyState icon={UsersRound} title="No linked room" message="Occupancy rules come from the linked room." />
          )}
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
            <div className="detail-field"><span>Room ID</span><strong className="tabular">{ratePlan.roomId}</strong></div>
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
        roomLabel={room?.name}
        rooms={room ? [{ id: room.id, label: `${room.name} — ${property?.name || "Unknown Property"}` }] : []}
        allRooms={data.rooms}
        scopeRoomId={room?.id || ""}
      />

      <RateSeasonManager open={seasonManagerOpen} onClose={() => setSeasonManagerOpen(false)} />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeletePermanently}
        title="Delete Rate Plan Permanently"
        message={`"${ratePlan.name}" is archived. Permanently deleting it cannot be undone. Its Rate Season templates are shared master data and will not be affected.`}
        confirmLabel="Delete Permanently"
        danger
      />
    </div>
  );
}
