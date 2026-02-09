import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/cards/reorder - Reorder cards and optionally move between columns
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { cardIds, moveCardId, fromTagId, toTagId } = body as {
    cardIds: string[];
    moveCardId?: string;
    fromTagId?: string;
    toTagId?: string;
  };

  if (!cardIds || !Array.isArray(cardIds)) {
    return NextResponse.json({ error: "cardIds array is required" }, { status: 400 });
  }

  // If moving between columns, swap the tag
  if (moveCardId && fromTagId && toTagId && fromTagId !== toTagId) {
    // Remove old tag
    await prisma.cardTag.deleteMany({
      where: { cardId: moveCardId, tagId: fromTagId },
    });
    // Add new tag (ignore if already exists)
    await prisma.cardTag.upsert({
      where: {
        cardId_tagId: { cardId: moveCardId, tagId: toTagId },
      },
      create: { cardId: moveCardId, tagId: toTagId },
      update: {},
    });
  }

  // Update positions in order
  await Promise.all(
    cardIds.map((id, index) =>
      prisma.card.update({
        where: { id },
        data: { position: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
