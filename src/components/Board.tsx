"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
  const [preselectedTagId, setPreselectedTagId] = useState<
    string | undefined
  >();
  const [showTagManager, setShowTagManager] = useState(false);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const dragOriginTagId = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

  const getGroups = useCallback(() => {
    const groupTags = tags
      .filter((t) => t.type === groupBy)
      .sort((a, b) => a.position - b.position);

    const groups: { tag: Tag; cards: Card[] }[] = groupTags.map((tag) => ({
      tag,
      cards: cards
        .filter((card) => card.tags.some((ct) => ct.tag.id === tag.id))
        .sort((a, b) => a.position - b.position),
    }));

    const taggedCardIds = new Set(
      groups.flatMap((g) => g.cards.map((c) => c.id))
    );
    const untaggedCards = cards
      .filter((c) => !taggedCardIds.has(c.id))
      .sort((a, b) => a.position - b.position);
    if (untaggedCards.length > 0) {
      groups.push({
        tag: {
          id: "__untagged__",
          name: "Untagged",
          type: groupBy,
          color: "#4B5563",
          position: 999,
        },
        cards: untaggedCards,
      });
    }

    return groups;
  }, [cards, tags, groupBy]);

  const findColumnById = useCallback(
    (id: string) => {
      const groups = getGroups();
      const col = groups.find((g) => g.tag.id === id);
      if (col) return col;
      for (const g of groups) {
        if (g.cards.some((c) => c.id === id)) return g;
      }
      return null;
    },
    [getGroups]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card || null);
    if (card) {
      const originalTag = card.tags.find((ct) => ct.tag.type === groupBy);
      dragOriginTagId.current = originalTag?.tag.id || "__untagged__";
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumnById(active.id as string);
    const overColumn = findColumnById(over.id as string);

    if (
      !activeColumn ||
      !overColumn ||
      activeColumn.tag.id === overColumn.tag.id
    )
      return;

    setCards((prev) => {
      const movingCard = prev.find((c) => c.id === active.id);
      if (!movingCard) return prev;

      const updatedCard = {
        ...movingCard,
        tags: [
          ...movingCard.tags.filter((ct) => ct.tag.type !== groupBy),
          ...(overColumn.tag.id !== "__untagged__"
            ? [
                {
                  id: `temp-${overColumn.tag.id}`,
                  cardId: movingCard.id,
                  tagId: overColumn.tag.id,
                  tag: overColumn.tag,
                },
              ]
            : []),
        ],
      };

      return prev.map((c) => (c.id === active.id ? updatedCard : c));
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const originTagId = dragOriginTagId.current;

    setActiveCard(null);
    dragOriginTagId.current = null;

    if (!over) {
      await fetchCards();
      return;
    }

    const groups = getGroups();
    const currentColumn = groups.find((g) =>
      g.cards.some((c) => c.id === active.id)
    );
    const overColumn = findColumnById(over.id as string);

    if (!currentColumn || !overColumn) {
      await fetchCards();
      return;
    }

    const isSameColumn = originTagId === currentColumn.tag.id;

    if (isSameColumn) {
      const oldIndex = currentColumn.cards.findIndex(
        (c) => c.id === active.id
      );
      const newIndex = currentColumn.cards.findIndex(
        (c) => c.id === over.id
      );
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reorderedCards = arrayMove(
        currentColumn.cards,
        oldIndex,
        newIndex
      );
      const reorderedIds = reorderedCards.map((c) => c.id);

      setCards((prev) =>
        prev.map((card) => {
          const pos = reorderedIds.indexOf(card.id);
          if (pos !== -1) return { ...card, position: pos };
          return card;
        })
      );

      await fetch("/api/cards/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: reorderedIds }),
      });
    } else {
      const fromTagId =
        originTagId !== "__untagged__" ? originTagId : null;
      const toTagId =
        currentColumn.tag.id !== "__untagged__"
          ? currentColumn.tag.id
          : null;

      const targetCards = currentColumn.cards;
      const overIdx = targetCards.findIndex((c) => c.id === over.id);
      const insertIdx =
        over.id === currentColumn.tag.id || overIdx === -1
          ? targetCards.length - 1
          : overIdx;

      const withoutActive = targetCards.filter(
        (c) => c.id !== active.id
      );
      const movedCard = targetCards.find((c) => c.id === active.id);
      if (!movedCard) {
        await fetchCards();
        return;
      }
      withoutActive.splice(insertIdx, 0, movedCard);
      const reorderedIds = withoutActive.map((c) => c.id);

      await fetch("/api/cards/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardIds: reorderedIds,
          moveCardId: active.id as string,
          fromTagId,
          toTagId,
        }),
      });

      await fetchCards();
    }
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
    if (!confirm("Delete this tag? It will be removed from all cards."))
      return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    await Promise.all([fetchTags(), fetchCards()]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  const groups = getGroups();

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Everyday Task
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Group by:</span>
            <div className="flex gap-1">
              {GROUP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGroupBy(opt.value)}
                  className={`text-sm px-4 py-1.5 rounded-lg font-medium ${
                    groupBy === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-[#252525] text-gray-400 hover:bg-[#303030] hover:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-[#333]" />

          <button
            onClick={() => setShowTagManager(true)}
            className="text-sm px-4 py-1.5 rounded-lg font-medium bg-[#252525] text-gray-400 hover:bg-[#303030] hover:text-gray-300"
          >
            🏷 Tags
          </button>
          <button
            onClick={() => {
              setEditingCard(null);
              setPreselectedTagId(undefined);
              setShowCardModal(true);
            }}
            className="text-sm px-4 py-1.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-500"
          >
            + New Card
          </button>
        </div>
      </header>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
          <div className="flex gap-5 h-full">
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

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="rotate-2 opacity-90 w-[300px]">
              <div
                className={`bg-[#2a2a2a] rounded-xl shadow-2xl border-l-4 p-4 ${
                  activeCard.tags.find((ct) => ct.tag.type === "CATEGORY")
                    ?.tag.name === "Personal"
                    ? "border-l-purple-500"
                    : "border-l-orange-500"
                }`}
              >
                <h3 className="font-semibold text-gray-100 text-base">
                  {activeCard.title}
                </h3>
                {activeCard.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {activeCard.description}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
