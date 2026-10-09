"use client";

import React from "react";
import { ComponentProp } from "@/lib/types";
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
      <div className="flex items-center justify-between border-t border-[#232738] bg-[#0e1017] p-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-gray-600" />
          <span>No customizable variables detected in current component.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-[#232738] bg-[#0c0e15]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232738] bg-[#11131b] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="size-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-gray-200">
            Detected Component Props & Slots
          </span>
          <span className="rounded bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-800/40">
            {props.length} variables
          </span>
        </div>

        <button
          onClick={onResetProps}
          className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-indigo-300 transition-colors"
          title="Reset all props to defaults"
        >
          <RotateCcw className="size-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto max-h-56 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#0e1017] text-[11px] font-mono uppercase text-gray-400 border-b border-[#232738]/60">
            <tr>
              <th className="px-4 py-2 font-semibold">Prop</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Live Value (Edit)</th>
              <th className="px-4 py-2 font-semibold hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232738]/40 font-sans">
            {props.map((prop) => (
              <tr key={prop.name} className="hover:bg-[#141722]/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-indigo-300 whitespace-nowrap">
                  {prop.name}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-purple-300 whitespace-nowrap">
                  <span className="rounded bg-purple-950/40 px-1.5 py-0.5 border border-purple-800/30">
                    {prop.type}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={values[prop.name] ?? prop.default}
                    onChange={(e) => onPropChange(prop.name, e.target.value)}
                    placeholder={prop.default}
                    className="w-full min-w-[120px] rounded-lg border border-[#2b3044] bg-[#090a0f] px-2.5 py-1 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-400 hidden sm:table-cell">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
