import { notFound } from "next/navigation";
import { AclsEbook, type AclsEbookChapter } from "@/components/acls-ebook";
import { ACLS_NAVIGATION } from "@/lib/acls-navigation";
import { getAclsProtocol } from "@/lib/acls-protocols";

export const metadata = {
  title: "eBook ACLS | Resibook",
  description: "Protocolos ACLS em formato de eBook interativo para estudo e consulta rápida.",
};

export default async function AclsEbookPage({
  searchParams,
}: {
  searchParams: Promise<{ capitulo?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedSlug = Array.isArray(query.capitulo) ? query.capitulo[0] : query.capitulo;
  const protocol = requestedSlug ? getAclsProtocol(requestedSlug) : undefined;

  if (requestedSlug && !protocol) notFound();

  const chapters: AclsEbookChapter[] = ACLS_NAVIGATION
    .filter((item) => item.available && item.slug)
    .map((item) => ({ slug: item.slug, label: item.label, group: item.group }));

  return <AclsEbook chapters={chapters} protocol={protocol} />;
}
