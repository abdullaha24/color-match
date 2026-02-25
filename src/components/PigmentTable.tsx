"use client";

import React, { useState } from "react";
import { FullProject } from "./ProjectDetail";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PigmentTableProps {
  project: FullProject;
  onUpdate: () => void;
}

export function PigmentTable({ project, onUpdate }: PigmentTableProps) {
  const [isAdding, setIsAdding] = useState(false);

  const totalQuantity = project.pigments.reduce((sum, p) => sum + p.quantity, 0);
  const isValidPercentage = totalQuantity > 0 || project.pigments.length === 0;

  const handleUpdate = async (id: string, field: "name" | "quantity", value: string) => {
    if (field === "quantity") {
      const qty = parseFloat(value);
      if (isNaN(qty) || qty < 0) return;
      await fetch(`/api/pigments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      onUpdate();
    } else {
      if (!value.trim()) return;
      await fetch(`/api/pigments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pigment?")) return;
    await fetch(`/api/pigments/${id}`, { method: "DELETE" });
    onUpdate();
  };

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await fetch("/api/pigments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, name: "New Pigment", quantity: 0 }),
      });
      onUpdate();
    } finally {
      setIsAdding(false);
    }
  };

  const displayPigments = [...project.pigments];
  // Pad with empty rows purely for UX visual requested in plan
  const emptyRowsNeeded = Math.max(0, 4 - displayPigments.length);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Pigment Mix</h3>
          {!isValidPercentage && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Total must be &gt; 0
            </span>
          )}
        </div>
        <Button onClick={handleAdd} disabled={isAdding} variant="secondary" size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Row
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
              <th className="px-6 py-3 w-12 text-center">#</th>
              <th className="px-6 py-3">Pigment Name</th>
              <th className="px-6 py-3 w-48">Quantity</th>
              <th className="px-6 py-3 w-32 text-right">Percentage</th>
              <th className="px-6 py-3 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayPigments.map((pigment, index) => {
              const percentage = totalQuantity > 0 ? (pigment.quantity / totalQuantity) * 100 : 0;
              return (
                <tr key={pigment.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-3 text-center text-sm text-gray-400">{index + 1}</td>
                  <td className="px-6 py-3">
                    <input
                      key={`name-${pigment.id}-${pigment.name}`}
                      className="w-full bg-transparent border-transparent focus:border-blue-500 focus:bg-white rounded px-2 py-1 text-sm transition-all"
                      defaultValue={pigment.name}
                      onBlur={(e) => {
                        if (e.target.value !== pigment.name) handleUpdate(pigment.id, "name", e.target.value);
                      }}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        key={`qty-${pigment.id}-${pigment.quantity}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 bg-transparent border-transparent focus:border-blue-500 focus:bg-white rounded px-2 py-1 text-sm transition-all"
                        defaultValue={pigment.quantity}
                        onBlur={(e) => {
                          if (parseFloat(e.target.value) !== pigment.quantity) handleUpdate(pigment.id, "quantity", e.target.value);
                        }}
                      />
                      <span className="text-gray-400 text-sm">units</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleDelete(pigment.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove pigment"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Empty UI rows */}
            {Array.from({ length: emptyRowsNeeded }).map((_, i) => (
              <tr key={`empty-${i}`} className="bg-gray-50/30">
                <td className="px-6 py-3 text-center text-sm text-gray-300">{displayPigments.length + i + 1}</td>
                <td className="px-6 py-3"><div className="h-6 w-full max-w-[200px] bg-gray-100 rounded opacity-50"></div></td>
                <td className="px-6 py-3"><div className="h-6 w-16 bg-gray-100 rounded opacity-50"></div></td>
                <td className="px-6 py-3 text-right text-sm text-gray-300">0.0%</td>
                <td className="px-6 py-3"></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-medium">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-right text-gray-900 border-t items-center justify-end border-gray-200">
                Total Mix:
              </td>
              <td className="px-6 py-4 text-gray-900 border-t border-gray-200">
                {totalQuantity.toFixed(2)} units
              </td>
              <td className="px-6 py-4 text-right pb-4 text-gray-900 border-t border-gray-200">
                {totalQuantity > 0 ? "100.0%" : "0.0%"}
              </td>
              <td className="border-t border-gray-200"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
