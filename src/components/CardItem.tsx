"use client";

import { Card, Tag } from "@/types";

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardItem({ card, onEdit, onDelete }: CardItemProps) {
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
      className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor} p-3 hover:shadow-md transition-shadow cursor-pointer group`}
      onClick={() => onEdit(card)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {card.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs shrink-0"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {card.description && (
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {priorityTag && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
            style={{ backgroundColor: priorityTag.color || "#6B7280" }}
          >
            {priorityTag.name}
          </span>
        )}
        {statusTag && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
            style={{ backgroundColor: statusTag.color || "#6B7280" }}
          >
            {statusTag.name}
          </span>
        )}
        {clientTag && (
          <span className="text-xs px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
            {clientTag.name}
          </span>
        )}
      </div>

      {card.dateEnd && (
        <div
          className={`text-xs mt-2 ${
            isOverdue ? "text-red-500 font-medium" : "text-gray-400"
          }`}
        >
          {isOverdue ? "⚠ " : ""}Due: {formatDate(card.dateEnd)}
        </div>
      )}
    </div>
  );
}

