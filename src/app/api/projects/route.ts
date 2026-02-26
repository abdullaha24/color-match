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
    const { name, targetR, targetG, targetB, targetL, targetA, targetB_lab } =
      body;

    const { rgbToLab, labToRgb } = await import("../../../lib/color");

    const hasRgb =
      targetR !== undefined && targetG !== undefined && targetB !== undefined;
    const hasLab =
      targetL !== undefined &&
      targetA !== undefined &&
      targetB_lab !== undefined;

    if (!hasRgb && !hasLab) {
      return NextResponse.json(
        { error: "Provide either RGB or L*a*b* values" },
        { status: 400 },
      );
    }

    let finalR: number, finalG: number, finalB: number;
    let finalL: number, finalA: number, finalBLab: number;

    if (hasLab) {
      // LAB provided — use as-is, compute RGB for display
      finalL = Number(targetL);
      finalA = Number(targetA);
      finalBLab = Number(targetB_lab);
      const rgb = labToRgb({ L: finalL, a: finalA, b: finalBLab });
      finalR = rgb.r;
      finalG = rgb.g;
      finalB = rgb.b;
    } else {
      // RGB provided — convert to LAB (authoritative), keep original RGB
      finalR = Number(targetR);
      finalG = Number(targetG);
      finalB = Number(targetB);
      const lab = rgbToLab({ r: finalR, g: finalG, b: finalB });
      finalL = lab.L;
      finalA = lab.a;
      finalBLab = lab.b;
    }

    const project = await prisma.project.create({
      data: {
        name: name || "Untitled Project",
        targetR: finalR,
        targetG: finalG,
        targetB: finalB,
        targetL: finalL,
        targetA: finalA,
        targetB_lab: finalBLab,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
