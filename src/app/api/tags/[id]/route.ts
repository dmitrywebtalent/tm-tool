import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/tags/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, color } = body;

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (color !== undefined) updateData.color = color || null;

  const tag = await prisma.tag.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(tag);
}

// DELETE /api/tags/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.tag.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

