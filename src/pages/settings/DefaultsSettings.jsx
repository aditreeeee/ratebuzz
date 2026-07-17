import React from "react";
import { PropertiesSettings } from "./PropertiesSettings.jsx";
import { RoomsSettings } from "./RoomsSettings.jsx";
import { RatePlansSettings } from "./RatePlansSettings.jsx";

export function DefaultsSettings() {
  return (
    <div className="defaults-stack">
      <PropertiesSettings />
      <RoomsSettings />
      <RatePlansSettings />
    </div>
  );
}
