"use client";

import { useState, useEffect } from "react";
import { Card, Tag, TagType } from "@/types";

interface CardModalProps {
  card: Card | null;
  tags: Tag[];
  preselectedTagId?: string;
  onSave: (data: {
    title: string;
    description: string;
    dateEnd: string;
    tagIds: string[];
  }) => void;
  onClose: () => void;
}

export default function CardModal({
  card,
  tags,
  preselectedTagId,
  onSave,
  onClose,
}: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setDateEnd(
        card.dateEnd ? new Date(card.dateEnd).toISOString().split("T")[0] : ""
      );
      setSelectedTagIds(card.tags.map((ct) => ct.tag.id));
    } else if (preselectedTagId) {
      setSelectedTagIds([preselectedTagId]);
    }
  }, [card, preselectedTagId]);

  const tagsByType = tags.reduce(
    (acc, tag) => {
      if (!acc[tag.type]) acc[tag.type] = [];
      acc[tag.type].push(tag);
      return acc;
    },
    {} as Record<TagType, Tag[]>
  );

  const toggleTag = (tagId: string, tagType: TagType) => {
    if (tagType !== "CLIENT") {
      const otherTagsOfType = tags
        .filter((t) => t.type === tagType)
        .map((t) => t.id);
      const withoutType = selectedTagIds.filter(
        (id) => !otherTagsOfType.includes(id)
      );
      if (selectedTagIds.includes(tagId)) {
        setSelectedTagIds(withoutType);
      } else {
        setSelectedTagIds([...withoutType, tagId]);
      }
    } else {
      if (selectedTagIds.includes(tagId)) {
        setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
      } else {
        setSelectedTagIds([...selectedTagIds, tagId]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, dateEnd, tagIds: selectedTagIds });
  };

  const typeLabels: Record<TagType, string> = {
    STATUS: "Status",
    PRIORITY: "Priority",
    CATEGORY: "Category",
    CLIENT: "Client",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {card ? "Edit Card" : "New Card"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Card title..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add a description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(["CATEGORY", "STATUS", "PRIORITY", "CLIENT"] as TagType[]).map(
              (type) =>
                tagsByType[type] && (
                  <div key={type}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {typeLabels[type]}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tagsByType[type].map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id, type)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              isSelected
                                ? "text-white border-transparent shadow-sm"
                                : "text-gray-600 border-gray-300 hover:border-gray-400"
                            }`}
                            style={
                              isSelected
                                ? { backgroundColor: tag.color || "#6B7280" }
                                : {}
                            }
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {card ? "Save Changes" : "Create Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

