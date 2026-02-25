import { ProjectDetail } from "../../../components/ProjectDetail";

export default async function ProjectPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <ProjectDetail projectId={id} />
    </main>
  );
}
