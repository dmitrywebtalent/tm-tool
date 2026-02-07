import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cards/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

// PUT /api/cards/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, dateEnd, tagIds } = body;

  if (title !== undefined && !title.trim()) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description || null;
  if (dateEnd !== undefined) updateData.dateEnd = dateEnd ? new Date(dateEnd) : null;

  // If tagIds provided, replace all tags
  if (tagIds !== undefined) {
    await prisma.cardTag.deleteMany({ where: { cardId: id } });
    await prisma.cardTag.createMany({
      data: tagIds.map((tagId: string) => ({ cardId: id, tagId })),
    });
  }

  const card = await prisma.card.update({
    where: { id },
    data: updateData,
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  return NextResponse.json(card);
}

// DELETE /api/cards/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.card.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

