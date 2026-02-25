import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    const body = await request.json();
    const { quantity, name } = body;
    
    // allow updating quantity or name
    const data: any = {};
    if (quantity !== undefined) data.quantity = Number(quantity);
    if (name !== undefined) data.name = name;

    const pigment = await prisma.pigment.update({
      where: { id },
      data
    });
    return NextResponse.json(pigment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update pigment" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await Promise.resolve(context.params);
    await prisma.pigment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete pigment" }, { status: 500 });
  }
}
