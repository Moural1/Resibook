"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CLINICAL_CASE_SESSION_EVENT, loadClinicalCaseSession } from "@/lib/clinical-case-session";
import { QUADRO_EVENT, apagarQuadro, atualizarCaso, carregarQuadro, salvarQuadro } from "@/lib/shift/quadro";

/* Mantém o paciente do quadro em dia com o caso ativo e garante que o quadro
   pertence à conta logada: outra conta no mesmo aparelho começa do zero. */
export default function QuadroSync() {
  useEffect(() => {
    let usuario: string | null = null;
    let ativo = true;

    function sincronizarCaso() {
      const caso = loadClinicalCaseSession();
      if (!caso?.quadroId) return;
      const quadro = carregarQuadro();
      const paciente = quadro.pacientes.find((p) => p.id === caso.quadroId);
      if (!paciente) return;
      if (JSON.stringify({ ...caso, updatedAt: "" }) === JSON.stringify({ ...paciente.caso, updatedAt: "" })) return;
      salvarQuadro(atualizarCaso(quadro, paciente.id, caso));
    }

    function conferirDono() {
      if (!usuario) return;
      const quadro = carregarQuadro();
      if (quadro.dono && quadro.dono !== usuario) apagarQuadro();
      else if (!quadro.dono && quadro.pacientes.length) salvarQuadro({ ...quadro, dono: usuario });
    }

    void createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!ativo) return;
        usuario = data.session?.user.id ?? null;
        conferirDono();
      });

    sincronizarCaso();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, sincronizarCaso);
    window.addEventListener(QUADRO_EVENT, conferirDono);
    return () => {
      ativo = false;
      window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, sincronizarCaso);
      window.removeEventListener(QUADRO_EVENT, conferirDono);
    };
  }, []);

  return null;
}
