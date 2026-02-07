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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Manage Tags</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-4 border-b bg-gray-50 flex flex-wrap gap-2 items-end"
        >
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tag name..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as TagType)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TAG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Color
            </label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </form>

        <div className="p-4 space-y-4">
          {tagsByType.map(
            (group) =>
              group.tags.length > 0 && (
                <div key={group.value}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group"
                      >
                        {editingId === tag.id ? (
                          <>
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-6 h-6 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(tag.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => saveEdit(tag.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: tag.color || "#6B7280",
                              }}
                            />
                            <span className="flex-1 text-sm text-gray-700">
                              {tag.name}
                            </span>
                            <button
                              onClick={() => startEdit(tag)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-blue-600 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteTag(tag.id)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-all"
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

