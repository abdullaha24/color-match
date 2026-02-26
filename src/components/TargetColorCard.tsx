"use client";

import React, { useState, useEffect } from "react";
import { FullProject } from "./ProjectDetail";
import { ColorSwatch } from "./ColorSwatch";
import { rgbToLab, labToRgb } from "../lib/color";
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
  const [inputMode, setInputMode] = useState<"rgb" | "lab">("rgb");
  const [labL, setLabL] = useState("");
  const [labA, setLabA] = useState("");
  const [labB, setLabB] = useState("");

  useEffect(() => {
    setName(project.name);
    setR(project.targetR.toString());
    setG(project.targetG.toString());
    setB(project.targetB.toString());
    setLabL(project.targetL.toFixed(2));
    setLabA(project.targetA.toFixed(2));
    setLabB(project.targetB_lab.toFixed(2));
    setInputMode("rgb");
  }, [project]);

  const handleModeSwitch = (mode: "rgb" | "lab") => {
    if (mode === "lab" && inputMode === "rgb") {
      const currentLab = rgbToLab({
        r: Math.min(255, Math.max(0, parseInt(r) || 0)),
        g: Math.min(255, Math.max(0, parseInt(g) || 0)),
        b: Math.min(255, Math.max(0, parseInt(b) || 0)),
      });
      setLabL(currentLab.L.toFixed(2));
      setLabA(currentLab.a.toFixed(2));
      setLabB(currentLab.b.toFixed(2));
    } else if (mode === "rgb" && inputMode === "lab") {
      const currentRgb = labToRgb({
        L: parseFloat(labL) || 0,
        a: parseFloat(labA) || 0,
        b: parseFloat(labB) || 0,
      });
      setR(currentRgb.r.toString());
      setG(currentRgb.g.toString());
      setB(currentRgb.b.toString());
    }
    setInputMode(mode);
  };

  const displayRgb =
    inputMode === "rgb"
      ? {
          r: Math.min(255, Math.max(0, parseInt(r) || 0)),
          g: Math.min(255, Math.max(0, parseInt(g) || 0)),
          b: Math.min(255, Math.max(0, parseInt(b) || 0)),
        }
      : labToRgb({
          L: parseFloat(labL) || 0,
          a: parseFloat(labA) || 0,
          b: parseFloat(labB) || 0,
        });

  const displayLab =
    inputMode === "lab"
      ? {
          L: parseFloat(labL) || 0,
          a: parseFloat(labA) || 0,
          b: parseFloat(labB) || 0,
        }
      : rgbToLab(displayRgb);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let bodyData: Record<string, unknown> = {
        name: name.trim() || "Untitled Project",
      };

      if (inputMode === "lab") {
        // Send LAB — API will compute RGB
        bodyData.targetL = parseFloat(labL) || 0;
        bodyData.targetA = parseFloat(labA) || 0;
        bodyData.targetB_lab = parseFloat(labB) || 0;
      } else {
        // Send RGB — API will compute LAB
        bodyData.targetR = parseInt(r, 10);
        bodyData.targetG = parseInt(g, 10);
        bodyData.targetB = parseInt(b, 10);
      }

      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
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
    (inputMode === "rgb" &&
      (r !== project.targetR.toString() ||
        g !== project.targetG.toString() ||
        b !== project.targetB.toString())) ||
    (inputMode === "lab" &&
      (labL !== project.targetL.toFixed(2) ||
        labA !== project.targetA.toFixed(2) ||
        labB !== project.targetB_lab.toFixed(2)));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-transparent px-0 focus:border-gray-300 focus:bg-white focus:px-3 -mx-3 h-12"
          />

          <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => handleModeSwitch("rgb")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  inputMode === "rgb"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                RGB
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("lab")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  inputMode === "lab"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                L*a*b*
              </button>
            </div>

            {inputMode === "rgb" ? (
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
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  type="number"
                  step="0.01"
                  label="L*"
                  value={labL}
                  onChange={(e) => setLabL(e.target.value)}
                  className="w-24"
                />
                <Input
                  type="number"
                  step="0.01"
                  label="a*"
                  value={labA}
                  onChange={(e) => setLabA(e.target.value)}
                  className="w-24"
                />
                <Input
                  type="number"
                  step="0.01"
                  label="b*"
                  value={labB}
                  onChange={(e) => setLabB(e.target.value)}
                  className="w-24"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-right text-sm">
              {inputMode === "rgb" ? (
                <>
                  <div className="font-medium text-gray-900">Computed L*a*b*</div>
                  <div className="text-gray-500 font-mono mt-1">
                    L: {displayLab.L.toFixed(1)} <br />
                    a: {displayLab.a.toFixed(1)} <br />
                    b: {displayLab.b.toFixed(1)}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium text-gray-900">Computed RGB</div>
                  <div className="text-gray-500 font-mono mt-1">
                    R: {displayRgb.r} <br />
                    G: {displayRgb.g} <br />
                    B: {displayRgb.b}
                  </div>
                </>
              )}
            </div>
            <ColorSwatch
              r={displayRgb.r}
              g={displayRgb.g}
              b={displayRgb.b}
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
