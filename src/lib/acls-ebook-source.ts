import "server-only";

import source from "@/content/acls-ebook-source.json";
import { createClient } from "@/lib/supabase/server";
import {
  discardLegacyAclsEbookLayoutHints,
  sanitizeAclsEbookDocumentImages,
  validateAclsEbookDocument,
  type AclsEbookDocument,
  type AclsEbookSourceChapter,
} from "@/lib/acls-ebook-schema";

export type { AclsEbookDocument, AclsEbookRichText, AclsEbookSourceBlock, AclsEbookSourceChapter } from "@/lib/acls-ebook-schema";

const bundledDocument = sanitizeAclsEbookDocumentImages({
  schemaVersion: 1,
  chapters: source.chapters as AclsEbookSourceChapter[],
});

const chapters = bundledDocument.chapters;

export const BUNDLED_ACLS_EBOOK_DOCUMENT: AclsEbookDocument = bundledDocument;

export const ACLS_EBOOK_SOURCE_CHAPTERS = chapters.map(({ slug, title, group, sourcePages }) => ({
  slug,
  title,
  group,
  sourcePages,
}));

export function getAclsEbookSourceChapter(slug: string) {
  return chapters.find((chapter) => chapter.slug === slug);
}

export async function getPublishedAclsEbookDocument() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("acls_ebook_publications")
      .select("content")
      .eq("document_key", "acls")
      .maybeSingle();
    if (error || !data?.content) return BUNDLED_ACLS_EBOOK_DOCUMENT;
    const validation = validateAclsEbookDocument(data.content);
    return validation.valid
      ? sanitizeAclsEbookDocumentImages(discardLegacyAclsEbookLayoutHints(validation.document))
      : BUNDLED_ACLS_EBOOK_DOCUMENT;
  } catch {
    return BUNDLED_ACLS_EBOOK_DOCUMENT;
  }
}
