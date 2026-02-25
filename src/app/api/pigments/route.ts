import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, name, quantity } = body;

    if (!projectId || !name || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pigment = await prisma.pigment.create({
      data: {
        projectId,
        name,
        quantity: Number(quantity),
      }
    });
    return NextResponse.json(pigment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add pigment" }, { status: 500 });
  }
}
