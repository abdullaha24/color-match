import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        pigments: {
          orderBy: { createdAt: 'asc' }
        },
        iterations: {
          orderBy: { iterationNum: 'asc' }
        }
      }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Lazy backfill: populate LAB from RGB for old projects
    if (
      project.targetL === 0 &&
      project.targetA === 0 &&
      project.targetB_lab === 0 &&
      (project.targetR !== 0 || project.targetG !== 0 || project.targetB !== 0)
    ) {
      const { rgbToLab } = await import("../../../../lib/color");
      const lab = rgbToLab({
        r: project.targetR,
        g: project.targetG,
        b: project.targetB,
      });
      await prisma.project.update({
        where: { id },
        data: { targetL: lab.L, targetA: lab.a, targetB_lab: lab.b },
      });
      project.targetL = lab.L;
      project.targetA = lab.a;
      project.targetB_lab = lab.b;
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const body = await request.json();
    const { name, targetR, targetG, targetB, targetL, targetA, targetB_lab } =
      body;

    const { rgbToLab, labToRgb } = await import("../../../../lib/color");

    const hasRgb =
      targetR !== undefined && targetG !== undefined && targetB !== undefined;
    const hasLab =
      targetL !== undefined &&
      targetA !== undefined &&
      targetB_lab !== undefined;

    // Build the update data object
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;

    if (hasLab) {
      // LAB provided — authoritative, compute RGB
      data.targetL = Number(targetL);
      data.targetA = Number(targetA);
      data.targetB_lab = Number(targetB_lab);
      const rgb = labToRgb({
        L: Number(targetL),
        a: Number(targetA),
        b: Number(targetB_lab),
      });
      data.targetR = rgb.r;
      data.targetG = rgb.g;
      data.targetB = rgb.b;
    } else if (hasRgb) {
      // RGB provided — convert to LAB, store both
      data.targetR = Number(targetR);
      data.targetG = Number(targetG);
      data.targetB = Number(targetB);
      const lab = rgbToLab({
        r: Number(targetR),
        g: Number(targetG),
        b: Number(targetB),
      });
      data.targetL = lab.L;
      data.targetA = lab.a;
      data.targetB_lab = lab.b;
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
