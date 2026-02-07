export type TagType = "STATUS" | "PRIORITY" | "CLIENT" | "CATEGORY";

export interface Tag {
  id: string;
  name: string;
  type: TagType;
  color: string | null;
  position: number;
}

export interface CardTag {
  id: string;
  cardId: string;
  tagId: string;
  tag: Tag;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  dateCreated: string;
  dateEnd: string | null;
  position: number;
  tags: CardTag[];
  createdAt: string;
  updatedAt: string;
}

export type GroupByOption = TagType;

