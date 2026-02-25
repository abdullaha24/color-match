"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Beaker, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { Input } from "./ui/input";
import { ColorSwatch } from "./ColorSwatch";

interface Project {
  id: string;
  name: string;
  targetR: number;
  targetG: number;
  targetB: number;
  createdAt: string;
  _count: {
    pigments: number;
    iterations: number;
  };
}

export function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [newName, setNewName] = useState("");
  const [r, setR] = useState("255");
  const [g, setG] = useState("255");
  const [b, setB] = useState("255");
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim() || "Untitled Project",
          targetR: parseInt(r, 10),
          targetG: parseInt(g, 10),
          targetB: parseInt(b, 10),
        }),
      });
      if (res.ok) {
        const newProj = await res.json();
        setIsModalOpen(false);
        router.push(`/project/${newProj.id}`);
      }
    } catch (error) {
      console.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Color Match</h1>
          <p className="mt-1 text-sm text-gray-500">Track and iterate physical pigment mixes to match your target color.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm shrink-0">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Beaker className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating a new project with your target color values.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 pr-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ColorSwatch 
                  r={project.targetR} 
                  g={project.targetG} 
                  b={project.targetB} 
                  className="w-10 h-10 shadow-inner rounded-xl ring-1 ring-black/5" 
                />
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>{project._count.iterations} <span className="text-gray-400">iters</span></span>
                  <span>{project._count.pigments} <span className="text-gray-400">pigments</span></span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Project">
        <form onSubmit={handleCreateProject} className="space-y-6">
          <Input
            label="Project Name"
            placeholder="e.g., Ocean Blue Target"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">Target Color (RGB)</label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="R"
                value={r}
                onChange={(e) => setR(e.target.value)}
                required
              />
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="G"
                value={g}
                onChange={(e) => setG(e.target.value)}
                required
              />
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="B"
                value={b}
                onChange={(e) => setB(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
