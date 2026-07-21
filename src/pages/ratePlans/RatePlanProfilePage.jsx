import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag, MapPin, Pencil, Copy, Archive, RotateCcw, Trash2, Plus,
  LayoutGrid, BedDouble, CalendarRange, UtensilsCrossed, Ban, UsersRound,
  Percent, StickyNote, History, TrendingUp,
} from "lucide-react";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Textarea } from "../../components/ui/Input.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { RoomClassificationSummary } from "../../components/ui/RoomClassificationSummary.jsx";
import { formatDate, formatCurrency } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { mealPlanLabel } from "../../mocks/ratePlans.js";
import { classifyPeriodStatus, getCurrentActivePeriod, nextPeriodId } from "../../lib/pricingPeriods.js";
import { RatePlanForm } from "./RatePlanForm.jsx";
import { PricingPeriodForm } from "./PricingPeriodForm.jsx";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "room", label: "Room Information", icon: BedDouble },
  { key: "pricing", label: "Pricing Periods", icon: CalendarRange },
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
  const [periodFormOpen, setPeriodFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [confirmDeletePeriod, setConfirmDeletePeriod] = useState(null);

  const ratePlan = data.ratePlans.find((rp) => rp.id === id);
  const room = ratePlan ? data.rooms.find((r) => r.id === ratePlan.roomId) : null;
  const property = room ? data.properties.find((p) => p.id === room.propertyId) : null;
  const currency = property?.currency || "USD";

  const periods = ratePlan?.pricingPeriods || [];
  const currentPeriod = useMemo(() => getCurrentActivePeriod(periods), [periods]);
  const nextScheduled = useMemo(
    () => periods.filter((p) => classifyPeriodStatus(p) === "Scheduled").sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))[0],
    [periods]
  );

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

  const savePeriods = (nextPeriods, message) => {
    data.updateRatePlan({ ...ratePlan, pricingPeriods: nextPeriods });
    if (message) toast.success(message);
  };

  const openAddPeriod = () => { setEditingPeriod(null); setPeriodFormOpen(true); };
  const openEditPeriod = (p) => { setEditingPeriod(p); setPeriodFormOpen(true); };

  const handlePeriodSubmit = (form) => {
    if (editingPeriod) {
      savePeriods(periods.map((p) => (p.id === editingPeriod.id ? { ...p, ...form } : p)), "Pricing period updated.");
    } else {
      const created = { ...form, id: nextPeriodId(periods) };
      savePeriods([created, ...periods], `Pricing period ${created.id} added.`);
    }
    setPeriodFormOpen(false);
  };

  const handleDuplicatePeriod = (p) => {
    const copy = { ...p, id: nextPeriodId(periods) };
    savePeriods([copy, ...periods], `Duplicated as ${copy.id}.`);
  };

  const handleToggleArchivePeriod = (p) => {
    savePeriods(
      periods.map((x) => (x.id === p.id ? { ...x, archived: !x.archived } : x)),
      p.archived ? "Pricing period restored." : "Pricing period archived."
    );
  };

  const handleDeletePeriod = () => {
    savePeriods(periods.filter((p) => p.id !== confirmDeletePeriod.id), "Pricing period deleted.");
    setConfirmDeletePeriod(null);
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
          <div className="current-price-card__label"><TrendingUp size={14} strokeWidth={2} /> Current Active Price</div>
          {currentPeriod ? (
            <>
              <div className="current-price-card__row">
                <div className="current-price-card__stat"><span>Base</span><strong>{formatCurrency(currentPeriod.baseRate, currentPeriod.currency)}</strong></div>
                <div className="current-price-card__stat"><span>Weekend</span><strong>{formatCurrency(currentPeriod.weekendRate, currentPeriod.currency)}</strong></div>
                <div className="current-price-card__stat"><span>Extra Adult</span><strong>{formatCurrency(currentPeriod.extraAdultRate, currentPeriod.currency)}</strong></div>
                <div className="current-price-card__stat"><span>Child</span><strong>{formatCurrency(currentPeriod.childRate, currentPeriod.currency)}</strong></div>
              </div>
              <p className="current-price-card__range">Effective {formatDate(currentPeriod.effectiveFrom)} &ndash; {formatDate(currentPeriod.effectiveTo)}</p>
            </>
          ) : (
            <p className="current-price-card__empty">
              No pricing period is currently active.
              {nextScheduled && ` Next period "${formatDate(nextScheduled.effectiveFrom)}" is scheduled.`}
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
            <div className="detail-field"><span>Pricing Periods</span><strong className="tabular">{periods.length}</strong></div>
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
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Pricing Periods</h3>
            {permissions.canCreateRatePlan && (
              <Button variant="secondary" size="sm" icon={Plus} onClick={openAddPeriod}>Add Pricing Period</Button>
            )}
          </div>
          <div style={{ padding: 20 }}>
            <Table
              columns={[
                { key: "from", label: "Effective From" },
                { key: "to", label: "Effective To" },
                { key: "base", label: "Base Rate" },
                { key: "weekend", label: "Weekend Rate" },
                { key: "child", label: "Child Rate" },
                { key: "extraAdult", label: "Extra Adult Rate" },
                { key: "status", label: "Status" },
                { key: "actions", label: "" },
              ]}
              data={periods}
              rowKey={(row) => row.id}
              emptyState={
                <EmptyState
                  icon={CalendarRange}
                  title="No pricing periods yet"
                  message="Add a pricing period to define rates for a date range."
                  action={permissions.canCreateRatePlan && <Button variant="secondary" size="sm" icon={Plus} onClick={openAddPeriod}>Add Pricing Period</Button>}
                />
              }
              renderRow={(p) => (
                <tr key={p.id}>
                  <td className="tabular">{formatDate(p.effectiveFrom)}</td>
                  <td className="tabular">{formatDate(p.effectiveTo)}</td>
                  <td className="tabular">{formatCurrency(p.baseRate, p.currency)}</td>
                  <td className="tabular">{formatCurrency(p.weekendRate, p.currency)}</td>
                  <td className="tabular">{formatCurrency(p.childRate, p.currency)}</td>
                  <td className="tabular">{formatCurrency(p.extraAdultRate, p.currency)}</td>
                  <td><StatusBadge status={classifyPeriodStatus(p)} /></td>
                  <td>
                    <div className="table__actions">
                      <button className="table__action-btn" title="Edit" onClick={() => openEditPeriod(p)}><Pencil size={15} strokeWidth={2} /></button>
                      <button className="table__action-btn" title="Duplicate" onClick={() => handleDuplicatePeriod(p)}><Copy size={15} strokeWidth={2} /></button>
                      <button className="table__action-btn" title={p.archived ? "Restore" : "Archive"} onClick={() => handleToggleArchivePeriod(p)}>
                        {p.archived ? <RotateCcw size={15} strokeWidth={2} /> : <Archive size={15} strokeWidth={2} />}
                      </button>
                      {permissions.canDeleteRatePlanPermanently && (
                        <button className="table__action-btn table__action-btn--danger" title="Delete" onClick={() => setConfirmDeletePeriod(p)}><Trash2 size={15} strokeWidth={2} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            />
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

      <PricingPeriodForm
        open={periodFormOpen}
        onClose={() => setPeriodFormOpen(false)}
        onSubmit={handlePeriodSubmit}
        initial={editingPeriod}
        defaultCurrency={currency}
      />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeletePermanently}
        title="Delete Rate Plan Permanently"
        message={`"${ratePlan.name}" is archived. Permanently deleting it will also remove its pricing periods. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
      />

      <ConfirmModal
        open={!!confirmDeletePeriod}
        onClose={() => setConfirmDeletePeriod(null)}
        onConfirm={handleDeletePeriod}
        title="Delete Pricing Period"
        message={`Delete the pricing period effective ${formatDate(confirmDeletePeriod?.effectiveFrom)} – ${formatDate(confirmDeletePeriod?.effectiveTo)}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
