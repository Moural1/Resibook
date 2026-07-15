import { notFound } from "next/navigation";
import { AclsEbook, type AclsEbookChapter } from "@/components/acls-ebook";
import { ACLS_NAVIGATION } from "@/lib/acls-navigation";
import {
  ACLS_EBOOK_SOURCE_CHAPTERS,
  getAclsEbookSourceChapter,
} from "@/lib/acls-ebook-source";
import { getAclsProtocol } from "@/lib/acls-protocols";

export const metadata = {
  title: "eBook ACLS | Resibook",
  description: "Protocolos ACLS em formato de eBook interativo para estudo e consulta rápida.",
};

export default async function AclsEbookPage({
  searchParams,
}: {
  searchParams: Promise<{ capitulo?: string | string[]; edicao?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedSlug = Array.isArray(query.capitulo) ? query.capitulo[0] : query.capitulo;
  const requestedEdition = Array.isArray(query.edicao) ? query.edicao[0] : query.edicao;
  const sourceChapter = requestedSlug && requestedEdition === "anotacoes"
    ? getAclsEbookSourceChapter(requestedSlug)
    : undefined;
  const protocol = requestedSlug && requestedEdition !== "anotacoes"
    ? getAclsProtocol(requestedSlug)
    : undefined;

  if (requestedSlug && !protocol && !sourceChapter) notFound();

  const protocolChapters: AclsEbookChapter[] = ACLS_NAVIGATION
    .filter((item) => item.available && item.slug)
    .map((item) => ({
      slug: item.slug,
      label: item.label,
      group: `Protocolos rápidos · ${item.group}`,
      edition: "protocolos",
    }));

  const sourceChapters: AclsEbookChapter[] = ACLS_EBOOK_SOURCE_CHAPTERS.map((chapter) => ({
    slug: chapter.slug,
    label: chapter.title,
    group: `Ebook integral · ${chapter.group}`,
    edition: "anotacoes",
    pages: chapter.sourcePages,
  }));

  const chapters = [...protocolChapters, ...sourceChapters];

  return <AclsEbook chapters={chapters} protocol={protocol} sourceChapter={sourceChapter} />;
}
