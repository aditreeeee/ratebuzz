import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ icon: IconEl = Inbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <IconEl size={28} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
