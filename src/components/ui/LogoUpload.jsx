import React, { useRef } from "react";
import { ImagePlus, X, Building2 } from "lucide-react";

export function LogoUpload({ value, onChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="logo-upload">
      <div className="logo-upload__preview">
        {value ? <img src={value} alt="Property logo preview" /> : <Building2 size={22} strokeWidth={1.75} />}
      </div>
      <div className="logo-upload__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus size={14} strokeWidth={2} /> {value ? "Replace Logo" : "Upload Logo"}
        </button>
        {value && (
          <button type="button" className="logo-upload__remove" onClick={() => onChange("")} aria-label="Remove logo">
            <X size={14} strokeWidth={2} />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} hidden />
      </div>
      <span className="field__hint">Preview only — not uploaded anywhere yet.</span>
    </div>
  );
}
