"use client";
import React, { useState, useRef, useEffect } from "react";

interface PigmentComboboxProps {
  existingPigments: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (name: string, isNew: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PigmentCombobox({
  existingPigments,
  value,
  onChange,
  onSelect,
  placeholder = "Select or type...",
  className = "",
  disabled = false,
}: PigmentComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = existingPigments.filter((p) =>
    p.toLowerCase().includes(value.toLowerCase())
  );
  const isExactMatch = existingPigments.some(
    (p) => p.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />

      {isOpen && !disabled && (value || existingPigments.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filtered.map((p) => (
            <button
              key={p}
              type="button"
              className="w-full text-left select-none relative py-2 px-3 hover:bg-blue-600 hover:text-white transition-colors"
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus
                onChange(p);
                setIsOpen(false);
                onSelect(p, false);
              }}
            >
              {p}
            </button>
          ))}

          {value.trim() && !isExactMatch && (
            <button
              type="button"
              className="w-full text-left select-none relative py-2 px-3 text-blue-600 hover:bg-blue-50 focus:bg-blue-50 border-t border-gray-100 font-medium transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(value.trim());
                setIsOpen(false);
                onSelect(value.trim(), true);
              }}
            >
              + Add "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
