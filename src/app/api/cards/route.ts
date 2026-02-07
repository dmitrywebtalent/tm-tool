import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cards - Get all cards with tags
export async function GET() {
  const cards = await prisma.card.findMany({
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(cards);
}

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, dateEnd, tagIds } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const maxPos = await prisma.card.aggregate({ _max: { position: true } });
  const nextPosition = (maxPos._max.position ?? -1) + 1;

  const card = await prisma.card.create({
    data: {
      title: title.trim(),
      description: description || null,
      dateEnd: dateEnd ? new Date(dateEnd) : null,
      position: nextPosition,
      tags: {
        create: (tagIds || []).map((tagId: string) => ({ tagId })),
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return NextResponse.json(card, { status: 201 });
}

