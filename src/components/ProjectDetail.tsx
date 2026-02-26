"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { TargetColorCard } from "./TargetColorCard";
import { PigmentTable } from "./PigmentTable";
import { IterationTable } from "./IterationTable";

// Define strict types for the full nested object
export interface Pigment {
  id: string;
  name: string;
  quantity: number;
}

export interface Iteration {
  id: string;
  iterationNum: number;
  pigmentAdded: string;
  quantityAdded: number;
  resultR: number;
  resultG: number;
  resultB: number;
  createdAt: string;
}

export interface FullProject {
  id: string;
  name: string;
  targetR: number;
  targetG: number;
  targetB: number;
  targetL: number;
  targetA: number;
  targetB_lab: number;
  pigments: Pigment[];
  iterations: Iteration[];
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<FullProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (res.ok) {
        setProject(await res.json());
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <button 
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>
      </div>

      {/* Section A — Header & Target Color */}
      <TargetColorCard project={project} onUpdate={fetchProject} />

      {/* Section B — Pigment Mix Table */}
      <PigmentTable project={project} onUpdate={fetchProject} />

      {/* Section C — Iterations Table */}
      <IterationTable project={project} onUpdate={fetchProject} />
    </div>
  );
}
