export type AclsEbookVisualCategory = "Fluxogramas" | "Avaliações" | "Farmacologia";

export type AclsEbookVisual = {
  id: string;
  title: string;
  category: AclsEbookVisualCategory;
  src: string;
  width: number;
  height: number;
  chapterSlugs: string[];
};

export const ACLS_EBOOK_VISUALS: AclsEbookVisual[] = [
  { id: "visual-01", title: "Checklist de habilidades de SBV adulto", category: "Avaliações", src: "/acls-ebook/visuals/visual-01.png", width: 698, height: 778, chapterSlugs: ["fundamentos-abordagem"] },
  { id: "visual-02", title: "Checklist de manejo de via aérea", category: "Avaliações", src: "/acls-ebook/visuals/visual-02.png", width: 818, height: 802, chapterSlugs: ["parada-respiratoria-via-aerea"] },
  { id: "visual-03", title: "Megacode — cenários 1, 3 e 8", category: "Avaliações", src: "/acls-ebook/visuals/visual-03.png", width: 676, height: 808, chapterSlugs: ["equipes-alto-desempenho", "bradicardias", "ritmos-de-parada"] },
  { id: "visual-04", title: "Megacode — cenários 2 e 5", category: "Avaliações", src: "/acls-ebook/visuals/visual-04.png", width: 647, height: 784, chapterSlugs: ["equipes-alto-desempenho", "bradicardias", "ritmos-de-parada"] },
  { id: "visual-05", title: "Megacode — cenários 4, 7 e 10", category: "Avaliações", src: "/acls-ebook/visuals/visual-05.png", width: 735, height: 792, chapterSlugs: ["equipes-alto-desempenho", "taquiarritmias", "ritmos-de-parada"] },
  { id: "visual-06", title: "Megacode — cenários 6 e 11", category: "Avaliações", src: "/acls-ebook/visuals/visual-06.png", width: 709, height: 842, chapterSlugs: ["equipes-alto-desempenho", "bradicardias", "ritmos-de-parada"] },
  { id: "visual-07", title: "Megacode — cenário 9", category: "Avaliações", src: "/acls-ebook/visuals/visual-07.png", width: 676, height: 811, chapterSlugs: ["equipes-alto-desempenho", "taquiarritmias", "ritmos-de-parada"] },
  { id: "visual-08", title: "Megacode — cenário 12", category: "Avaliações", src: "/acls-ebook/visuals/visual-08.png", width: 715, height: 805, chapterSlugs: ["equipes-alto-desempenho", "bradicardias", "ritmos-de-parada"] },
  { id: "visual-09", title: "Algoritmo de PCR em adultos — prancha 1", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-09.png", width: 910, height: 835, chapterSlugs: ["ritmos-de-parada"] },
  { id: "visual-10", title: "Algoritmo de PCR em adultos — prancha 2", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-10.png", width: 874, height: 861, chapterSlugs: ["ritmos-de-parada"] },
  { id: "visual-11", title: "Algoritmo de bradicardia com pulso", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-11.png", width: 1062, height: 802, chapterSlugs: ["bradicardias"] },
  { id: "visual-12", title: "Algoritmo de taquicardia com pulso", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-12.png", width: 1160, height: 789, chapterSlugs: ["taquiarritmias"] },
  { id: "visual-13", title: "Algoritmo de cuidados pós-PCR", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-13.png", width: 962, height: 789, chapterSlugs: ["cuidados-pos-pcr"] },
  { id: "visual-14", title: "Algoritmo de PCR em adultos — visão ampliada", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-14.png", width: 1040, height: 816, chapterSlugs: ["ritmos-de-parada"] },
  { id: "visual-15", title: "Algoritmo de PCR associada à gestação", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-15.png", width: 1254, height: 792, chapterSlugs: ["pcr-gestacao"] },
  { id: "visual-16", title: "Algoritmo de PCR em paciente com DAVE", category: "Fluxogramas", src: "/acls-ebook/visuals/visual-16.png", width: 1118, height: 801, chapterSlugs: ["pcr-dave"] },
  { id: "visual-17", title: "Farmacologia do SAVC — adenosina", category: "Farmacologia", src: "/acls-ebook/visuals/visual-17.png", width: 1867, height: 857, chapterSlugs: ["taquiarritmias"] },
  { id: "visual-18", title: "Farmacologia do SAVC — amiodarona e atropina", category: "Farmacologia", src: "/acls-ebook/visuals/visual-18.png", width: 1846, height: 833, chapterSlugs: ["bradicardias", "taquiarritmias", "ritmos-de-parada"] },
  { id: "visual-19", title: "Farmacologia do SAVC — dopamina, epinefrina e lidocaína", category: "Farmacologia", src: "/acls-ebook/visuals/visual-19.png", width: 1816, height: 857, chapterSlugs: ["bradicardias", "taquiarritmias", "ritmos-de-parada"] },
  { id: "visual-20", title: "Farmacologia do SAVC — lidocaína e magnésio", category: "Farmacologia", src: "/acls-ebook/visuals/visual-20.png", width: 1843, height: 595, chapterSlugs: ["taquiarritmias", "ritmos-de-parada"] },
];
