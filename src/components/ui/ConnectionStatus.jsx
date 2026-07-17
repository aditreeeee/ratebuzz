import React from "react";
import { PlugZap } from "lucide-react";

export function ConnectionStatus({ label = "eGlobe Solutions Property Database" }) {
  return (
    <div className="connection-status">
      <span className="connection-status__dot" />
      <PlugZap size={13} strokeWidth={2} />
      <span>{label}: <strong>Not Connected</strong> — will connect via ASP.NET API</span>
    </div>
  );
}
