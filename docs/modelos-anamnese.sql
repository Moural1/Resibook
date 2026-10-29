-- Modelos de anamnese em "Modelos" (antiga Exames / Evolução).
-- Rode no SQL Editor do Supabase. Só insere; não altera nem apaga nada.
-- Se rodar de novo, não duplica (confere pelo título).

insert into public.exam_templates (categoria, titulo, sexo, source_file, conteudo)
select 'ANAMNESE', 'ANAMNESE COMPLETA — HOMEM', 'MASCULINO', 'Modelo Resibook', $modelo$QP:

HMA: Paciente comparece

HPP:
-Comorbidades:
-Em uso:
-Cirurgias prévias:
-Internações:
-Alergia medicamentosa:

HF:

HS:
-Etilismo:
-Tabagismo:
-Alimentação:
-Atividade física:

Exame físico:
BEG / Hidratado / Acianótico / Afebril / Anictérico
-COONG:
-ACV:   / FC:   bpm / PA:   mmHg
-AR:   / FR:   irpm / SpO2:   %
-ABD:
-MMII:
-Pele e anexos:

HD:

CD:
-$modelo$
where not exists (select 1 from public.exam_templates where titulo = 'ANAMNESE COMPLETA — HOMEM');

insert into public.exam_templates (categoria, titulo, sexo, source_file, conteudo)
select 'ANAMNESE', 'ANAMNESE COMPLETA — MULHER', 'FEMININO', 'Modelo Resibook', $modelo$QP:

HMA: Paciente comparece

HPP:
-Comorbidades:
-Em uso:
-Cirurgias prévias:
-Internações:
-Alergia medicamentosa:

HGO:
-DUM:
-G  P  A
-Método contraceptivo:

HF:

HS:
-Etilismo:
-Tabagismo:
-Alimentação:
-Atividade física:

Exame físico:
BEG / Hidratada / Acianótica / Afebril / Anictérica
-COONG:
-ACV:   / FC:   bpm / PA:   mmHg
-AR:   / FR:   irpm / SpO2:   %
-ABD:
-MMII:
-Pele e anexos:

HD:

CD:
-$modelo$
where not exists (select 1 from public.exam_templates where titulo = 'ANAMNESE COMPLETA — MULHER');

select id, categoria, titulo from public.exam_templates order by categoria, titulo;
