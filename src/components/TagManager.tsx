"use client";

import { useState } from "react";
import { Tag, TagType } from "@/types";

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (data: { name: string; type: TagType; color: string }) => void;
  onUpdateTag: (id: string, data: { name?: string; color?: string }) => void;
  onDeleteTag: (id: string) => void;
  onClose: () => void;
}

const TAG_TYPES: { value: TagType; label: string }[] = [
  { value: "STATUS", label: "Status" },
  { value: "PRIORITY", label: "Priority" },
  { value: "CATEGORY", label: "Category" },
  { value: "CLIENT", label: "Client" },
];

export default function TagManager({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onClose,
}: TagManagerProps) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TagType>("STATUS");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateTag({ name: newName.trim(), type: newType, color: newColor });
    setNewName("");
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color || "#6B7280");
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateTag(id, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const tagsByType = TAG_TYPES.map((type) => ({
    ...type,
    tags: tags.filter((t) => t.type === type.value),
  }));

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#2a2a2a] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-gray-100">Manage Tags</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-5 border-b border-[#2a2a2a] bg-[#151515] flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[120px]">
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-[#252525] border border-[#333] rounded-xl px-3 py-2 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tag name..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as TagType)}
              className="bg-[#252525] border border-[#333] rounded-xl px-3 py-2 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TAG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              Color
            </label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-[#333] cursor-pointer bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40"
          >
            Add
          </button>
        </form>

        <div className="p-5 space-y-5">
          {tagsByType.map(
            (group) =>
              group.tags.length > 0 && (
                <div key={group.value}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#222] group"
                      >
                        {editingId === tag.id ? (
                          <>
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-7 h-7 rounded border border-[#333] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 bg-[#252525] border border-[#333] rounded-lg px-3 py-1.5 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(tag.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => saveEdit(tag.id)}
                              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-sm text-gray-500 hover:text-gray-300 font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: tag.color || "#6B7280",
                              }}
                            />
                            <span className="flex-1 text-base text-gray-200">
                              {tag.name}
                            </span>
                            <button
                              onClick={() => startEdit(tag)}
                              className="opacity-0 group-hover:opacity-100 text-sm text-gray-500 hover:text-indigo-400 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteTag(tag.id)}
                              className="opacity-0 group-hover:opacity-100 text-sm text-gray-500 hover:text-red-400 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
