import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AREAS_FLUXOS, encontrarArea } from "@/lib/fluxos";
import RevisaoRelampago from "./revisao-relampago";

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return AREAS_FLUXOS.map((area) => ({ area: area.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = encontrarArea((await params).area);
  return { title: area ? `Revisão relâmpago · ${area.nome}` : "Revisão relâmpago" };
}

export default async function RelampagoPage({ params }: Props) {
  const area = encontrarArea((await params).area);
  if (!area) notFound();
  return <RevisaoRelampago areaId={area.id} />;
}
