"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Tag } from "@/types";

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getTag = (type: string): Tag | undefined => {
    return card.tags.find((ct) => ct.tag.type === type)?.tag;
  };

  const categoryTag = getTag("CATEGORY");
  const priorityTag = getTag("PRIORITY");
  const statusTag = getTag("STATUS");
  const clientTag = getTag("CLIENT");

  const isPersonal = categoryTag?.name === "Personal";
  const borderColor = isPersonal ? "border-l-purple-500" : "border-l-orange-500";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    card.dateEnd &&
    new Date(card.dateEnd) < new Date() &&
    statusTag?.name !== "Done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] border-l-4 ${borderColor} p-4 hover:bg-[#242424] hover:border-[#333] cursor-grab active:cursor-grabbing group ${
        isDragging ? "shadow-2xl z-10" : ""
      }`}
      onClick={() => onEdit(card)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-100 text-base leading-snug">
          {card.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-sm shrink-0"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {card.description && (
        <p className="text-gray-400 text-sm mt-1.5 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {priorityTag && (
          <span
            className="text-xs px-2 py-1 rounded-md font-semibold text-white"
            style={{ backgroundColor: priorityTag.color || "#6B7280" }}
          >
            {priorityTag.name}
          </span>
        )}
        {statusTag && (
          <span
            className="text-xs px-2 py-1 rounded-md font-semibold text-white"
            style={{ backgroundColor: statusTag.color || "#6B7280" }}
          >
            {statusTag.name}
          </span>
        )}
        {clientTag && (
          <span className="text-xs px-2 py-1 rounded-md border border-[#3a3a3a] text-gray-400 font-medium">
            {clientTag.name}
          </span>
        )}
      </div>

      {card.dateEnd && (
        <div
          className={`text-sm mt-3 ${
            isOverdue ? "text-red-400 font-semibold" : "text-gray-500"
          }`}
        >
          {isOverdue ? "⚠ " : ""}Due: {formatDate(card.dateEnd)}
        </div>
      )}
    </div>
  );
}
