"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableTagProps {
  value: string;
  onSave: (newValue: string) => void;
  onRemove: () => void;
  className?: string;
}

export default function EditableTag({
  value,
  onSave,
  onRemove,
  className = "",
}: EditableTagProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <span
        className={`flex items-center gap-1.5 bg-[#060B16] border border-blue-500/60 rounded-lg px-2 py-1.5 ${className}`}
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="bg-transparent text-sm text-white outline-none min-w-[80px]"
        />
        <button
          onClick={commit}
          className="text-emerald-400 hover:text-emerald-300"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
          className="text-gray-500 hover:text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span
      className={`group flex items-center gap-2 bg-[#060B16] border border-slate-800 text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:border-slate-700 transition ${className}`}
    >
      {value}
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-blue-400 transition"
        aria-label={`Edit ${value}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
        aria-label={`Remove ${value}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}
