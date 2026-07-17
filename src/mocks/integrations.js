export const INTEGRATION_DEFINITIONS = [
  {
    key: "egloveLookup",
    name: "eGlobe Property Lookup",
    description: "Direct connection to the eGlobe Solutions property master database for real-time ID lookups.",
    fields: ["apiBaseUrl", "apiKey", "environment"],
  },
  {
    key: "aspnetApi",
    name: "ASP.NET API",
    description: "Primary backend service layer (.NET 8+) that will serve all portal data.",
    fields: ["apiBaseUrl", "clientId", "clientSecret", "environment"],
  },
  {
    key: "sqlServer",
    name: "SQL Server",
    description: "Microsoft SQL Server 2022 instance backing property, room, and rate plan records.",
    fields: ["apiBaseUrl", "username", "password", "environment"],
  },
  {
    key: "hms",
    name: "HMS",
    description: "Hotel Management System integration for inventory and reservation sync.",
    fields: ["apiBaseUrl", "apiKey", "accessToken", "environment"],
  },
  {
    key: "otaProviders",
    name: "OTA Providers",
    description: "Online travel agency channel connections (Booking.com, Expedia, Agoda, etc.).",
    fields: ["apiBaseUrl", "clientId", "clientSecret", "accessToken", "environment"],
  },
  {
    key: "channelManager",
    name: "Channel Manager",
    description: "Centralized channel manager for distributing rates and availability.",
    fields: ["apiBaseUrl", "apiKey", "username", "password", "environment"],
  },
];

export const FIELD_LABELS = {
  apiBaseUrl: "API Base URL",
  apiKey: "API Key",
  clientId: "Client ID",
  clientSecret: "Client Secret",
  accessToken: "Access Token",
  username: "Username",
  password: "Password",
  environment: "Environment",
};

export const ENVIRONMENTS = ["Sandbox", "Staging", "Production"];
