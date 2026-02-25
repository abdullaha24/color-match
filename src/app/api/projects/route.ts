import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { pigments: true, iterations: true }
        }
      }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, targetR, targetG, targetB } = body;
    
    if (targetR === undefined || targetG === undefined || targetB === undefined) {
      return NextResponse.json({ error: "Missing RGB values" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name || "Untitled Project",
        targetR: Number(targetR),
        targetG: Number(targetG),
        targetB: Number(targetB),
      }
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
