import { notFound } from "next/navigation";
import { AclsEbook, type AclsEbookChapter } from "@/components/acls-ebook";
import { getPublishedAclsEbookDocument } from "@/lib/acls-ebook-source";

export const metadata = {
  title: "eBook ACLS | Resibook",
  description: "Leitor digital ACLS para estudo clínico no Resibook.",
};

export default async function AclsEbookPage({
  searchParams,
}: {
  searchParams: Promise<{ capitulo?: string | string[]; pagina?: string | string[] }>;
}) {
  const query = await searchParams;
  const document = await getPublishedAclsEbookDocument();
  const requestedSlug = Array.isArray(query.capitulo) ? query.capitulo[0] : query.capitulo;
  const requestedPage = Array.isArray(query.pagina) ? query.pagina[0] : query.pagina;
  const sourceChapter = requestedSlug ? document.chapters.find((chapter) => chapter.slug === requestedSlug) : undefined;

  if (requestedSlug && !sourceChapter) notFound();

  const chapters: AclsEbookChapter[] = document.chapters.map((chapter) => ({
    slug: chapter.slug,
    label: chapter.title,
    group: chapter.group,
    pages: chapter.sourcePages,
  }));

  return (
    <AclsEbook
      chapters={chapters}
      sourceChapter={sourceChapter}
      initialLastPage={requestedPage === "ultima"}
    />
  );
}
