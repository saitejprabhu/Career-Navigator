"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableRowProps {
  icon?: React.ReactNode;
  value: string;
  onSave: (newValue: string) => void;
  onRemove: () => void;
}

export default function EditableRow({
  icon,
  value,
  onSave,
  onRemove,
}: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  return (
    <div className="group flex items-center justify-between gap-4 bg-[#060B16] border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-500">
          {icon}
        </div>
        {editing ? (
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
            className="flex-1 bg-transparent text-sm text-white outline-none border-b border-blue-500/60"
          />
        ) : (
          <p className="text-sm text-slate-300 break-words">{value}</p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        {editing ? (
          <>
            <button
              onClick={commit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
              aria-label="Edit item"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"
              aria-label="Remove item"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
