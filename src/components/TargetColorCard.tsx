"use client";

import React, { useState, useEffect } from "react";
import { FullProject } from "./ProjectDetail";
import { ColorSwatch } from "./ColorSwatch";
import { rgbToLab } from "../lib/color";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface TargetColorCardProps {
  project: FullProject;
  onUpdate: () => void;
}

export function TargetColorCard({ project, onUpdate }: TargetColorCardProps) {
  const [name, setName] = useState(project.name);
  const [r, setR] = useState(project.targetR.toString());
  const [g, setG] = useState(project.targetG.toString());
  const [b, setB] = useState(project.targetB.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(project.name);
    setR(project.targetR.toString());
    setG(project.targetG.toString());
    setB(project.targetB.toString());
  }, [project]);

  const lab = rgbToLab({
    r: Math.min(255, Math.max(0, parseInt(r) || 0)),
    g: Math.min(255, Math.max(0, parseInt(g) || 0)),
    b: Math.min(255, Math.max(0, parseInt(b) || 0)),
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Untitled Project",
          targetR: parseInt(r, 10),
          targetG: parseInt(g, 10),
          targetB: parseInt(b, 10),
        }),
      });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    name !== project.name ||
    r !== project.targetR.toString() ||
    g !== project.targetG.toString() ||
    b !== project.targetB.toString();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-transparent px-0 focus:border-gray-300 focus:bg-white focus:px-3 -mx-3 h-12"
          />

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="number"
                min="0"
                max="255"
                label="R"
                value={r}
                onChange={(e) => setR(e.target.value)}
                className="w-20"
              />
              <Input
                type="number"
                min="0"
                max="255"
                label="G"
                value={g}
                onChange={(e) => setG(e.target.value)}
                className="w-20"
              />
              <Input
                type="number"
                min="0"
                max="255"
                label="B"
                value={b}
                onChange={(e) => setB(e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">Computed L*a*b*</div>
              <div className="text-gray-500 font-mono mt-1">
                L: {lab.L.toFixed(1)} <br />
                a: {lab.a.toFixed(1)} <br />
                b: {lab.b.toFixed(1)}
              </div>
            </div>
            <ColorSwatch
              r={parseInt(r) || 0}
              g={parseInt(g) || 0}
              b={parseInt(b) || 0}
              className="w-16 h-16 rounded-xl"
            />
          </div>

          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
