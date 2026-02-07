"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Tag, TagType, GroupByOption } from "@/types";
import BoardColumn from "./BoardColumn";
import CardModal from "./CardModal";
import TagManager from "./TagManager";

const GROUP_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: "STATUS", label: "Status" },
  { value: "PRIORITY", label: "Priority" },
  { value: "CATEGORY", label: "Personal / Job" },
  { value: "CLIENT", label: "Client" },
];

export default function Board() {
  const [cards, setCards] = useState<Card[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [groupBy, setGroupBy] = useState<GroupByOption>("STATUS");
  const [loading, setLoading] = useState(true);

  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [preselectedTagId, setPreselectedTagId] = useState<string | undefined>();
  const [showTagManager, setShowTagManager] = useState(false);

  const fetchCards = useCallback(async () => {
    const res = await fetch("/api/cards");
    const data = await res.json();
    setCards(data);
  }, []);

  const fetchTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchCards(), fetchTags()]).then(() => setLoading(false));
  }, [fetchCards, fetchTags]);

  const groupedCards = () => {
    const groupTags = tags
      .filter((t) => t.type === groupBy)
      .sort((a, b) => a.position - b.position);

    const groups: { tag: Tag; cards: Card[] }[] = groupTags.map((tag) => ({
      tag,
      cards: cards.filter((card) =>
        card.tags.some((ct) => ct.tag.id === tag.id)
      ),
    }));

    const taggedCardIds = new Set(
      groups.flatMap((g) => g.cards.map((c) => c.id))
    );
    const untaggedCards = cards.filter((c) => !taggedCardIds.has(c.id));
    if (untaggedCards.length > 0) {
      groups.push({
        tag: {
          id: "__untagged__",
          name: "Untagged",
          type: groupBy,
          color: "#9CA3AF",
          position: 999,
        },
        cards: untaggedCards,
      });
    }

    return groups;
  };

  const handleSaveCard = async (data: {
    title: string;
    description: string;
    dateEnd: string;
    tagIds: string[];
  }) => {
    if (editingCard) {
      await fetch(`/api/cards/${editingCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await fetchCards();
    setShowCardModal(false);
    setEditingCard(null);
    setPreselectedTagId(undefined);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this card?")) return;
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    await fetchCards();
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setPreselectedTagId(undefined);
    setShowCardModal(true);
  };

  const handleQuickAdd = (tagId: string) => {
    setEditingCard(null);
    setPreselectedTagId(tagId);
    setShowCardModal(true);
  };

  const handleCreateTag = async (data: {
    name: string;
    type: TagType;
    color: string;
  }) => {
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchTags();
  };

  const handleUpdateTag = async (
    id: string,
    data: { name?: string; color?: string }
  ) => {
    await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await Promise.all([fetchTags(), fetchCards()]);
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Delete this tag? It will be removed from all cards.")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    await Promise.all([fetchTags(), fetchCards()]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  const groups = groupedCards();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-gray-800">📋 TM Tool</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Group by:</span>
            <div className="flex gap-1">
              {GROUP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGroupBy(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    groupBy === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          <button
            onClick={() => setShowTagManager(true)}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            🏷 Tags
          </button>
          <button
            onClick={() => {
              setEditingCard(null);
              setPreselectedTagId(undefined);
              setShowCardModal(true);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + New Card
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full">
          {groups.map((group) => (
            <BoardColumn
              key={group.tag.id}
              tag={group.tag}
              cards={group.cards}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      </div>

      {showCardModal && (
        <CardModal
          card={editingCard}
          tags={tags}
          preselectedTagId={preselectedTagId}
          onSave={handleSaveCard}
          onClose={() => {
            setShowCardModal(false);
            setEditingCard(null);
            setPreselectedTagId(undefined);
          }}
        />
      )}

      {showTagManager && (
        <TagManager
          tags={tags}
          onCreateTag={handleCreateTag}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
          onClose={() => setShowTagManager(false)}
        />
      )}
    </div>
  );
}

