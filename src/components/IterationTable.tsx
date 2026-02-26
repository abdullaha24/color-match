"use client";

import React, { useState } from "react";
import { FullProject } from "./ProjectDetail";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { PigmentCombobox } from "./PigmentCombobox";
import { ColorSwatch } from "./ColorSwatch";
import { rgbToLab, deltaE } from "../lib/color";
import { Input } from "./ui/input";

interface IterationTableProps {
  project: FullProject;
  onUpdate: () => void;
}

export function IterationTable({ project, onUpdate }: IterationTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // New Iteration form state local to the bottom row
  const [newPigment, setNewPigment] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newR, setNewR] = useState("");
  const [newG, setNewG] = useState("");
  const [newB, setNewB] = useState("");

  const targetLab = {
    L: project.targetL,
    a: project.targetA,
    b: project.targetB_lab,
  };

  const handleAddIteration = async () => {
    if (!newPigment || !newQty || !newR || !newG || !newB) {
      alert("Please fill all fields for the new iteration.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/iterations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          pigmentAdded: newPigment,
          quantityAdded: parseFloat(newQty),
          resultR: parseInt(newR, 10),
          resultG: parseInt(newG, 10),
          resultB: parseInt(newB, 10),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Failed to save iteration: " + (err.error || res.statusText));
        return;
      }
      setNewPigment("");
      setNewQty("");
      setNewR("");
      setNewG("");
      setNewB("");
      onUpdate();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this iteration?")) return;
    await fetch(`/api/iterations/${id}`, { method: "DELETE" });
    onUpdate();
  };

  const existingPigmentNames = Array.from(new Set(project.pigments.map(p => p.name)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-900">Iterations</h3>
        <p className="text-sm text-gray-500">Log pigment additions and measure the color match.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
              <th className="px-4 py-3 text-center">N</th>
              <th className="px-4 py-3">Pigment Added</th>
              <th className="px-4 py-3">Qty Added</th>
              <th className="px-4 py-3">Result RGB</th>
              <th className="px-4 py-3 text-center">Color</th>
              <th className="px-4 py-3">L* a* b*</th>
              <th className="px-4 py-3">ΔL* Δa* Δb*</th>
              <th className="px-4 py-3">ΔE</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {project.iterations.map((iteration) => {
              const iterationLab = rgbToLab({
                r: iteration.resultR,
                g: iteration.resultG,
                b: iteration.resultB,
              });
              const delta = deltaE(targetLab, iterationLab);
              const isMatch = delta.dE <= 2;

              return (
                <tr key={iteration.id} className={`transition-colors group ${isMatch ? "bg-green-50/40" : "hover:bg-gray-50/50"}`}>
                  <td className="px-4 py-3 text-center font-medium text-gray-500">{iteration.iterationNum}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{iteration.pigmentAdded}</td>
                  <td className="px-4 py-3 text-gray-600">+{iteration.quantityAdded}</td>
                  <td className="px-4 py-3 tracking-tight font-mono text-gray-500 text-xs">
                    {iteration.resultR}, {iteration.resultG}, {iteration.resultB}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ColorSwatch r={iteration.resultR} g={iteration.resultG} b={iteration.resultB} />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs tracking-tight">
                    {iterationLab.L.toFixed(1)}, {iterationLab.a.toFixed(1)}, {iterationLab.b.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs tracking-tight">
                    <span className={delta.dL < 0 ? 'text-red-500' : 'text-blue-500'}>{delta.dL > 0 ? '+' : ''}{delta.dL.toFixed(1)}</span>,{' '}
                    <span className={delta.da < 0 ? 'text-red-500' : 'text-blue-500'}>{delta.da > 0 ? '+' : ''}{delta.da.toFixed(1)}</span>,{' '}
                    <span className={delta.db < 0 ? 'text-red-500' : 'text-blue-500'}>{delta.db > 0 ? '+' : ''}{delta.db.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isMatch ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-800"
                    }`}>
                      {delta.dE.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(iteration.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove iteration"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Empty padding rows if no iterations yet */}
            {project.iterations.length < 3 && Array.from({ length: 3 - project.iterations.length }).map((_, i) => (
              <tr key={`empty-iter-${i}`} className="bg-gray-50/20">
                <td className="px-4 py-4 text-center text-gray-300">{project.iterations.length + i + 1}</td>
                <td colSpan={8}></td>
              </tr>
            ))}

            {/* Add new Iteration row inline */}
            <tr className="bg-blue-50/30 border-t-2 border-blue-100">
              <td className="px-4 py-3 text-center text-blue-300 font-medium">New</td>
              <td className="px-4 py-3">
                <PigmentCombobox
                  existingPigments={existingPigmentNames}
                  value={newPigment}
                  onChange={(val) => setNewPigment(val)}
                  onSelect={(name) => setNewPigment(name)}
                  placeholder="Select pigment..."
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Qty"
                  className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                />
              </td>
              <td className="px-4 py-3" colSpan={3}>
                <div className="flex bg-white items-center p-1 rounded-md border border-gray-200">
                  <input
                    type="number" min="0" max="255" placeholder="R"
                    className="w-12 px-1 py-1 text-center bg-transparent border-r focus:outline-none focus:bg-blue-50"
                    value={newR} onChange={(e) => setNewR(e.target.value)}
                  />
                  <input
                    type="number" min="0" max="255" placeholder="G"
                    className="w-12 px-1 py-1 text-center bg-transparent border-r focus:outline-none focus:bg-blue-50"
                    value={newG} onChange={(e) => setNewG(e.target.value)}
                  />
                  <input
                    type="number" min="0" max="255" placeholder="B"
                    className="w-12 px-1 py-1 text-center bg-transparent focus:outline-none focus:bg-blue-50"
                    value={newB} onChange={(e) => setNewB(e.target.value)}
                  />
                </div>
              </td>
              <td className="px-4 py-3 text-right" colSpan={3}>
                <div className="flex justify-end pr-4">
                  <Button onClick={handleAddIteration} disabled={isAdding} size="sm" className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" /> Save Step
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
