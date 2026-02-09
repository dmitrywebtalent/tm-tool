"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Card, Tag } from "@/types";
import CardItem from "./CardItem";

interface BoardColumnProps {
  tag: Tag;
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onQuickAdd: (tagId: string) => void;
}

export default function BoardColumn({
  tag,
  cards,
  onEditCard,
  onDeleteCard,
  onQuickAdd,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: tag.id });

  return (
    <div
      className="rounded-xl p-4 min-w-[300px] max-w-[340px] flex-shrink-0 flex flex-col max-h-full border border-[#222]"
      style={{
        backgroundColor: `color-mix(in srgb, ${tag.color || "#6B7280"} 6%, #161616)`,
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color || "#6B7280" }}
          />
          <h2 className="font-semibold text-gray-200 text-base">{tag.name}</h2>
          <span className="text-sm text-gray-500 bg-[#252525] rounded-full px-2.5 py-0.5 font-medium">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards list */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-[40px]"
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Quick add button */}
      <button
        onClick={() => onQuickAdd(tag.id)}
        className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-300 hover:bg-[#222] rounded-lg px-3 py-2.5 font-medium"
      >
        + Add card
      </button>
    </div>
  );
}
