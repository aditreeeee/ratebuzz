import React, { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { TagChips } from "../../components/ui/TagChips.jsx";
import { ConnectionStatus } from "../../components/ui/ConnectionStatus.jsx";
import { useData } from "../../context/DataContext.jsx";
import { validatePropertyIdFormat, lookupPropertyById } from "../../lib/propertyLookupService.js";

export function PropertyIdLookup() {
  const { properties } = useData();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const handleLookup = (e) => {
    e.preventDefault();
    const validation = validatePropertyIdFormat(query);
    if (!validation.valid) {
      setResult({ state: "invalid", message: validation.message });
      return;
    }
    setResult(lookupPropertyById(properties, query));
  };

  return (
    <Card className="lookup-card">
      <div className="lookup-card__header">
        <div>
          <h3 className="lookup-card__title">Property ID Lookup</h3>
          <p className="lookup-card__subtitle">
            Look up a property by its unique ID to auto-populate its details.
          </p>
        </div>
        <ConnectionStatus />
      </div>

      <form onSubmit={handleLookup} className="lookup-card__form">
        <Input
          icon={Search}
          placeholder="e.g. PROP-1001"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="secondary" size="md">Lookup</Button>
      </form>

      {result?.state === "invalid" && (
        <div className="lookup-result lookup-result--error">
          <AlertTriangle size={16} strokeWidth={2} />
          <span>Invalid Format — {result.message}</span>
        </div>
      )}

      {result?.state === "not-found" && (
        <div className="lookup-result lookup-result--error">
          <XCircle size={16} strokeWidth={2} />
          <span>Property Not Found.</span>
        </div>
      )}

      {result?.state === "duplicate" && (
        <div className="lookup-result lookup-result--warning">
          <AlertTriangle size={16} strokeWidth={2} />
          <span>Duplicate Property ID — {result.matches.length} records share this ID. Data integrity should be reviewed.</span>
        </div>
      )}

      {result?.state === "found" && (
        <div className="lookup-result lookup-result--success">
          <CheckCircle2 size={16} strokeWidth={2} />
          <div className="lookup-result__details">
            <div className="lookup-result__row">
              <span className="tabular lookup-result__id">{result.property.id}</span>
              <StatusBadge status={result.property.status} />
            </div>
            <span className="lookup-result__name">{result.property.name}</span>
            <span className="lookup-result__meta">
              {result.property.brand} &middot; {result.property.city}, {result.property.country} &middot; {result.property.starRating}★ &middot; {result.property.currency}
            </span>
            <TagChips tags={result.property.tags} />
          </div>
        </div>
      )}
    </Card>
  );
}
