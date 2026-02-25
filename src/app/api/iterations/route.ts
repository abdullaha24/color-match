import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, pigmentAdded, quantityAdded, resultR, resultG, resultB } = body;

    // Validate
    if (!projectId || !pigmentAdded || quantityAdded === undefined || resultR === undefined || resultG === undefined || resultB === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current project to check iterations count
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { iterations: true, pigments: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const iterationNum = project.iterations.length + 1;

    // Use a transaction since we are creating an iteration AND updating/creating a pigment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create iteration
      const iteration = await tx.iteration.create({
        data: {
          projectId,
          iterationNum,
          pigmentAdded,
          quantityAdded: Number(quantityAdded),
          resultR: Number(resultR),
          resultG: Number(resultG),
          resultB: Number(resultB),
        }
      });

      // 2. Update Pigment table
      const existingPigment = project.pigments.find(p => p.name.toLowerCase() === pigmentAdded.toLowerCase());
      if (existingPigment) {
        await tx.pigment.update({
          where: { id: existingPigment.id },
          data: {
            quantity: existingPigment.quantity + Number(quantityAdded)
          }
        });
      } else {
        await tx.pigment.create({
          data: {
            projectId,
            name: pigmentAdded,
            quantity: Number(quantityAdded),
          }
        });
      }

      return iteration;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add iteration" }, { status: 500 });
  }
}
