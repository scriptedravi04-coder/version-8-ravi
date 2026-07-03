import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { INDIAN_CITIES, CITY_TO_STATE, VALID_NICHES } from '../../lib/constants';

export function Autocomplete({ items, value, onChange, placeholder, className, onSelectItem, label }) {
  const [search, setSearch] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  // Update internal search if external value changes
  useEffect(() => {
    if (value !== undefined) {
      setSearch(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = items.filter(n => n.toLowerCase().startsWith(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{label}</label>}
      <input
        className={cn("w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none font-mono", className)}
        placeholder={placeholder}
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setShowDropdown(true);
          if (onChange) onChange(e.target.value);
        }}
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && search && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[#7C5CFF]/30 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <button
                key={item}
                type="button"
                className="w-full text-left px-4 py-3 text-[var(--text-primary)] hover:bg-[#7C5CFF]/20"
                onClick={() => {
                  setSearch(item);
                  setShowDropdown(false);
                  if (onChange) onChange(item);
                  if (onSelectItem) onSelectItem(item);
                }}
              >
                {item}
              </button>
            ))
          ) : (
            <div className="p-4 text-[var(--text-secondary)] text-sm">No match found</div>
          )}
        </div>
      )}
    </div>
  );
}

export function LocationAutocomplete(props) {
  return <Autocomplete items={INDIAN_CITIES} {...props} />;
}

export function CategoryAutocomplete(props) {
  return <Autocomplete items={VALID_NICHES} {...props} />;
}
