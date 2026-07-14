import { notFound } from "next/navigation";
import { AclsProtocolView, AclsShell } from "@/components/acls-protocol";
import { ACLS_PROTOCOLS, getAclsProtocol } from "@/lib/acls-protocols";

export function generateStaticParams() {
  return ACLS_PROTOCOLS.map((protocol) => ({ slug: protocol.slug }));
}

export default async function AclsProtocolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const protocol = getAclsProtocol(slug);

  if (!protocol) notFound();

  return (
    <AclsShell>
      <AclsProtocolView protocol={protocol} />
    </AclsShell>
  );
}
