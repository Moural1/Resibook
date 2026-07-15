import "server-only";

import source from "@/content/acls-ebook-source.json";

export type AclsEbookRichText =
  | { kind: "text"; text: string; bold: boolean; red: boolean }
  | { kind: "image"; src: string };

export type AclsEbookSourceBlock =
  | { kind: "heading"; level: number; content: AclsEbookRichText[] }
  | { kind: "paragraph"; listStyle: "bullet" | "number" | null; content: AclsEbookRichText[] }
  | { kind: "image"; src: string }
  | { kind: "table"; rows: AclsEbookRichText[][][]; hasHeader: boolean };

export type AclsEbookSourceChapter = {
  slug: string;
  title: string;
  group: string;
  sourceLines: [number, number];
  sourcePages: [number, number];
  blocks: AclsEbookSourceBlock[];
};

const chapters = source.chapters as AclsEbookSourceChapter[];

export const ACLS_EBOOK_SOURCE_CHAPTERS = chapters.map(({ slug, title, group, sourcePages }) => ({
  slug,
  title,
  group,
  sourcePages,
}));

export function getAclsEbookSourceChapter(slug: string) {
  return chapters.find((chapter) => chapter.slug === slug);
}
