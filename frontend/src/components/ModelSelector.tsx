"use client";

import { ModelInfo } from "@/lib/api";

interface ModelSelectorProps {
  models: ModelInfo[];
  selected: string;
  onChange: (model: string) => void;
}

export default function ModelSelector({ models, selected, onChange }: ModelSelectorProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#1a1a1a] border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-500 cursor-pointer"
    >
      {models.map((m) => (
        <option key={m.name} value={m.name} disabled={!m.available}>
          {m.label} {m.available ? "" : "(not pulled)"}
        </option>
      ))}
    </select>
  );
}
