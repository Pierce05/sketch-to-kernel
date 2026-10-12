"use client";

import React from "react";
import { ComponentProp } from "@/lib/types";
import { isColorProp, resolveToHex } from "@/lib/color-utils";
import { Sliders, RotateCcw } from "lucide-react";

interface PropsTableProps {
  props: ComponentProp[];
  values: Record<string, string>;
  onPropChange: (name: string, value: string) => void;
  onResetProps: () => void;
}

export function PropsTable({
  props,
  values,
  onPropChange,
  onResetProps,
}: PropsTableProps) {
  if (!props || props.length === 0) {
    return (
      <div className="flex items-center justify-between border-t-2 border-[#18181b] bg-[#f6f5f0] p-4 text-xs text-[#71717a]">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-[#71717a]" />
          <span>No customizable variables detected in current component.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t-2 border-[#18181b] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="size-3.5 text-[#2724d1]" />
          <span className="text-xs font-bold font-mono text-[#18181b]">
            Component Props &amp; Live Slots
          </span>
          <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-[#2724d1] border border-[#2724d1]">
            {props.length} variables
          </span>
        </div>

        <button
          onClick={onResetProps}
          className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#52525b] hover:text-[#2724d1] transition-colors"
          title="Reset all props to defaults"
        >
          <RotateCcw className="size-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto max-h-56 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#f8f7f2] text-[11px] font-mono uppercase text-[#52525b] border-b border-[#18181b]/30">
            <tr>
              <th className="px-4 py-2 font-bold">Prop</th>
              <th className="px-3 py-2 font-bold">Type</th>
              <th className="px-3 py-2 font-bold">Live Value (Edit)</th>
              <th className="px-4 py-2 font-bold hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18181b]/10 font-sans">
            {props.map((prop) => {
              const isColor = isColorProp(prop.name, prop.type);
              const currentVal = values[prop.name] ?? prop.default;
              const colorHex = isColor ? resolveToHex(currentVal, "#2724d1") : "#2724d1";

              return (
                <tr key={prop.name} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-[#2724d1] whitespace-nowrap">
                    {prop.name}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#7c3aed] whitespace-nowrap">
                    <span className="rounded bg-purple-50 px-1.5 py-0.5 border border-purple-200">
                      {prop.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {isColor && (
                        <label
                          className="relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-[#18181b] overflow-hidden shadow-xs hover:scale-105 transition-transform"
                          title="Pick color"
                        >
                          <input
                            type="color"
                            value={colorHex}
                            onChange={(e) => onPropChange(prop.name, e.target.value)}
                            className="absolute -inset-2 size-10 cursor-pointer opacity-0"
                          />
                          <span
                            className="size-full rounded-sm"
                            style={{ backgroundColor: colorHex }}
                          />
                        </label>
                      )}
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => onPropChange(prop.name, e.target.value)}
                        placeholder={prop.default}
                        className="w-full min-w-[120px] rounded-lg border-2 border-[#18181b] bg-[#fcfbf9] px-2.5 py-1 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#2724d1] focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[#52525b] hidden sm:table-cell">
                    {prop.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
