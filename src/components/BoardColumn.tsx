"use client";

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
  return (
    <div className="bg-gray-50 rounded-xl p-3 min-w-[280px] max-w-[320px] flex-shrink-0 flex flex-col max-h-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color || "#6B7280" }}
          />
          <h2 className="font-semibold text-gray-700 text-sm">{tag.name}</h2>
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      {/* Quick add button */}
      <button
        onClick={() => onQuickAdd(tag.id)}
        className="mt-2 w-full text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
      >
        + Add card
      </button>
    </div>
  );
}

