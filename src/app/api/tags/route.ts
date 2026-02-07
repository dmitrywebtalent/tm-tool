import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tags - Get all tags, optionally filtered by type
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  const where = type
    ? { type: type as "STATUS" | "PRIORITY" | "CLIENT" | "CATEGORY" }
    : {};

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { position: "asc" },
  });

  return NextResponse.json(tags);
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type, color } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  const maxPos = await prisma.tag.aggregate({
    where: { type },
    _max: { position: true },
  });
  const nextPosition = (maxPos._max.position ?? -1) + 1;

  const tag = await prisma.tag.create({
    data: {
      name: name.trim(),
      type,
      color: color || null,
      position: nextPosition,
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

