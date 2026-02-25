import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    const body = await request.json();
    const { resultR, resultG, resultB } = body;
    
    const iteration = await prisma.iteration.update({
      where: { id },
      data: {
        ...(resultR !== undefined && { resultR: Number(resultR) }),
        ...(resultG !== undefined && { resultG: Number(resultG) }),
        ...(resultB !== undefined && { resultB: Number(resultB) }),
      }
    });
    return NextResponse.json(iteration);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update iteration" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    await prisma.iteration.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete iteration" }, { status: 500 });
  }
}
