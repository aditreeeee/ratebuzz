import React, { useState } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { StatusBadge } from "../../components/ui/Badge.jsx";
import { useData } from "../../context/DataContext.jsx";
import { validatePropertyIdFormat, lookupPropertyById } from "../../lib/propertyLookupService.js";

export function PropertyIdLookup() {
  const { properties } = useData();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(undefined); // undefined = not searched yet

  const handleLookup = (e) => {
    e.preventDefault();
    const validation = validatePropertyIdFormat(query);
    if (!validation.valid) {
      setResult({ error: validation.message });
      return;
    }
    const match = lookupPropertyById(properties, query);
    setResult(match ? { property: match } : { notFound: true });
  };

  return (
    <Card className="lookup-card">
      <div className="lookup-card__header">
        <h3 className="lookup-card__title">Property ID Lookup</h3>
        <p className="lookup-card__subtitle">
          Look up a property by its unique ID. This will connect directly to the eGlobe Solutions
          database via the ASP.NET API in a future release.
        </p>
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

      {result?.error && (
        <div className="lookup-result lookup-result--error">
          <XCircle size={16} strokeWidth={2} />
          <span>{result.error}</span>
        </div>
      )}

      {result?.notFound && (
        <div className="lookup-result lookup-result--error">
          <XCircle size={16} strokeWidth={2} />
          <span>Property Not Found.</span>
        </div>
      )}

      {result?.property && (
        <div className="lookup-result lookup-result--success">
          <CheckCircle2 size={16} strokeWidth={2} />
          <div className="lookup-result__details">
            <div className="lookup-result__row">
              <span className="tabular lookup-result__id">{result.property.id}</span>
              <StatusBadge status={result.property.status} />
            </div>
            <span className="lookup-result__name">{result.property.name}</span>
            <span className="lookup-result__meta">{result.property.city}, {result.property.country}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
