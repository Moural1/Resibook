import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const flashcards = [
      {
        source_file: "flashcards-1-organizados-melhor (1).pdf",
        source_group: "flashcards_1",
        card_number: 1,
        frente: "ITU de repetição + piúria estéril",
        verso: "Tuberculose urogenital (BAAR em urina seriada)",
        tags: ["nefro", "infecto"],
      },
      {
        source_file: "flashcards-1-organizados-melhor (1).pdf",
        source_group: "flashcards_1",
        card_number: 2,
        frente: "Mecanismo da HPN",
        verso: "Mutação PIGA → ausência CD55/CD59",
        tags: ["hematologia"],
      },
      {
        source_file: "flashcards-1-organizados-melhor (1).pdf",
        source_group: "flashcards_1",
        card_number: 3,
        frente: "Tríade artrite gonocócica",
        verso: "Tenossinovite + dermatite + artrite migratória\nCeft + Doxiciclina",
        tags: ["infecto", "reumato"],
      },
      {
        source_file: "flashcards-1-organizados-melhor (1).pdf",
        source_group: "flashcards_1",
        card_number: 4,
        frente: "Padrão de Wellens",
        verso: "CATE (proibido teste ergométrico)\nOndas T bifásicas em V1,V2,V3",
        tags: ["cardio", "ecg"],
      },
      {
        source_file: "flashcards-1-organizados-melhor (1).pdf",
        source_group: "flashcards_1",
        card_number: 5,
        frente: "PEP HIV",
        verso: "Iniciar imediato (até 72h, não esperar exame)",
        tags: ["infecto", "hiv"],
      },
      {
        source_file: "flashcards-2-organizados-melhor.pdf",
        source_group: "flashcards_2",
        card_number: 1,
        frente: "DPOC com indicação de terapia tripla. Quais medicações e quando indicar / eosinófilos?",
        verso: "LABA + LAMA + CI/ICS\nbroncodilatador duplo + corticoide inalatório",
        tags: ["pneumo"],
      },
      {
        source_file: "flashcards-2-organizados-melhor.pdf",
        source_group: "flashcards_2",
        card_number: 3,
        frente: "Descolamento prematuro de placenta: como reconhecer e qual conduta se feto vivo ou morto?",
        verso: "DPP = diagnóstico clínico.\nUSG tem baixa sensibilidade; US normal não exclui DPP.\nFeto vivo com sofrimento: via mais rápida.\nFeto morto + mãe estável: parto vaginal.",
        tags: ["go", "obstetricia"],
      },
      {
        source_file: "flashcards-2-organizados-melhor.pdf",
        source_group: "flashcards_2",
        card_number: 5,
        frente: "Paciente com déficit neurológico focal transitório sugestivo de AIT: qual conduta inicial e quando usar dupla antiagregação?",
        verso: "AIT é urgência neurológica.\nGlicemia capilar + TC de crânio sem contraste.\nApós excluir sangramento, iniciar prevenção secundária.\nAAS + clopidogrel por curto período em AIT de alto risco/AVC minor, após neuroimagem.",
        tags: ["neuro"],
      },
    ];

    const prescriptions = [
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Abscesso cutâneo",
        categoria: "plantao",
        conteudo:
          "USO ORAL\n1) Cefalexina 500mg — 28 comprimidos\nTomar 01 comp de 06/06 horas por 7 dias.\n2) Paracetamol 500 — 15 cp\nTomar 01 cp de 6/6 hrs se dor ou febre.",
        orientacoes: "Compressa de água morna no local por 10 a 15 min, 4 vezes por dia.",
      },
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Aftas / estomatite aftosa",
        categoria: "plantao",
        conteudo:
          "USO TÓPICO ORAL\n1) Omcilon A Orobase — 01 bisnaga\nAplicar uma fina camada sobre a lesão de 08/08 horas por 07 dias.",
        orientacoes: null,
      },
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Alergia a tinta de cabelo",
        categoria: "plantao",
        conteudo:
          "USO ORAL\n1) Prometazina 25mg — 01 caixa\nTomar 01 cp de 8/8 horas por 07 dias.\n2) Prednisona 20mg — 01 caixa\nTomar 01 cp de 12/12 horas por 05 dias.\n3) Cefalexina 500mg — 01 caixa\nTomar 01 cp de 6/6h por 7 dias.",
        orientacoes: "Usar shampoo suave sem perfume enquanto houver lesões.",
      },
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Anemia ferropriva",
        categoria: "plantao",
        conteudo:
          "Solicitar cinética do ferro.\nSem repercussão na hemoglobina: sulfato ferroso 40mg 01 comp antes do almoço por 3 meses.\nSe repercussão na hemoglobina: sulfato ferroso 40mg 02 comp antes do almoço e 02 comp antes do jantar por 3 meses.",
        orientacoes: null,
      },
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Amigdalite",
        categoria: "plantao",
        conteudo:
          "USO ORAL\n1) Amoxicilina+clavulanato 500+125mg — 30 comp\nTomar 01 comprimido de 08/08 horas por 10 dias.\n2) Ibuprofeno 600mg — 15 comp\nTomar 01 comprimido de 08/08 horas por 05 dias.\n3) Benalet pastilha — 1 caixa\nDissolver lentamente uma pastilha na boca de até 03/03 horas, se necessário.",
        orientacoes: null,
      },
      {
        source_file: "PRESCRIÇÕES .pdf",
        doenca: "Artrite gotosa",
        categoria: "plantao",
        conteudo:
          "USO ORAL\n1) Naproxeno sódico 250mg — 30 comp\nTomar 02 comprimidos de 12/12 horas por 3 dias; depois 01 comprimido de 08/08 horas por mais 05 dias.\n2) Dipirona 500mg — 01 caixa\nTomar 02 comprimidos de até 06/06 horas se dor ou febre.\n3) Omeprazol 20mg — 10 comp\nTomar 01 comprimido pela manhã, em jejum, por 10 dias.\nAlternativa: colchicina 0,5mg conforme esquema do material.",
        orientacoes: "Colocar gelo local durante 15 minutos de 04/04 horas. Manter alopurinol. Pode causar diarreia.",
      },
    ];

    const exams = [
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "conduta",
        titulo: "Conduta - manejo sintomático agora",
        conteudo:
          "- Manejo sintomático agora\n- Prescrevo sintomáticos\n- Alta do PA com orientações médicas e seguimento ambulatorial em PSF\n- Oriento paciente a retornar em caso de novas queixas ou intercorrências",
        sexo: null,
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "motivo_exames",
        titulo: "Dor abdominal crônica",
        conteudo:
          "1) US abdominal total\nMotivo: dor abdominal (CID10: R10)",
        sexo: null,
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "motivo_exames",
        titulo: "Dor lombar",
        conteudo:
          "1) RX coluna lombar\nMotivo: dor lombar (CID10: M545)",
        sexo: null,
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "rotina",
        titulo: "Rotina laboratorial",
        conteudo:
          "Hemograma\nGlicemia jejum\nHb glicada\nColesterol total e frações\nTriglicérides\nCreatinina\nUreia\nÁcido úrico\nSódio\nPotássio\nTSH\nT4L\nEAS\nEPF\nMotivo: rotina (CID10: Z10)",
        sexo: null,
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "exame_fisico",
        titulo: "Exame físico mulher",
        conteudo:
          "Mulher BEG, BOTE, corada, hidratada, anictérica, acianótica, afebril.\nACV: BNRNF em 2T sem sopros; pulsos cheios e simétricos; TEC < 2s.\nAR: MV+ sem ruídos adventícios; eupneica sem esforço respiratório.\nABD: flácido, normotimpânico, RHA+, indolor à palpação superficial e profunda, sem defesas.\nMMII: sem edemas, panturrilhas livres.\nECG 15; pupilas isocóricas e fotorreativas; sem déficits neurológicos focais; sem sinais de meningismo; força preservada.",
        sexo: "feminino",
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "exame_fisico",
        titulo: "Exame físico homem",
        conteudo:
          "Homem BEG, BOTE, corado, hidratado, anictérico, acianótico, afebril.\nACV: BNRNF em 2T sem sopros; pulsos cheios e simétricos; TEC < 2s.\nAR: MV+ sem ruídos adventícios; eupneico sem esforço respiratório.\nABD: flácido, normotimpânico, RHA+, indolor à palpação superficial e profunda, sem defesas.\nMMII: sem edemas, panturrilhas livres.\nECG 15; pupilas isocóricas e fotorreativas; sem déficits neurológicos focais; sem sinais de meningismo; força preservada.",
        sexo: "masculino",
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "sistemas",
        titulo: "Sistemas - osteoarticular",
        conteudo:
          "Mobilidade ativa e passiva das articulações preservadas, sem dor ou crepitações. Ausência de sinais flogísticos ou deformidades articulares.",
        sexo: null,
      },
      {
        source_file: "EXAMES _ EVOLUÇÃO (NOVA TELA)  .pdf",
        categoria: "sistemas",
        titulo: "Sistemas - membros",
        conteudo:
          "Ausência de edema, lesões de pele, sinais de insuficiência venosa ou arterial. Panturrilhas livres.",
        sexo: null,
      },
    ];

    const { error: flashcardsError } = await supabase
      .from("flashcards")
      .insert(flashcards);

    if (flashcardsError) {
      return NextResponse.json({ error: flashcardsError.message }, { status: 500 });
    }

    const { error: prescriptionsError } = await supabase
      .from("prescription_templates")
      .insert(prescriptions);

    if (prescriptionsError) {
      return NextResponse.json({ error: prescriptionsError.message }, { status: 500 });
    }

    const { error: examsError } = await supabase
      .from("exam_templates")
      .insert(exams);

    if (examsError) {
      return NextResponse.json({ error: examsError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      counts: {
        flashcards: flashcards.length,
        prescriptions: prescriptions.length,
        exams: exams.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "erro inesperado no seed" },
      { status: 500 }
    );
  }
}