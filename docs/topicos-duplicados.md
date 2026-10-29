# Tópicos duplicados

Pedido do dono do projeto (29/10/2026): deixar apenas um tópico por tema.

Fica sempre a versão mais completa. Do tópico removido, as pegadinhas, as tags
e a fonte são somadas ao que fica; o restante já está coberto pelo texto mantido.
Cada removido é copiado antes para `topicos_medicos_removidos` (backup, sem
acesso pela API), então dá para recuperar.

| Fica | Sai |
|---|---|
| Apendicite Aguda (#55) | Apendicite aguda (#16) |
| Declaração de Óbito, Atestados e Laudos (#139) | Declaração de óbito, atestados e laudos (#29) |
| Diabetes na Gestação (#60) | Diabetes na gestação (#21) |
| Gestação ectópica (#23) | Gestação Ectópica (#62) |
| Hemorragia Pós-Parto (#61) | Hemorragia pós-parto (#22) |
| Meningites e Encefalites (#51) | Meningites e encefalites (#15) |
| Pancreatite Aguda (#56) | Pancreatite aguda (#17) |
| Pneumonia Adquirida na Comunidade (#39) | Pneumonia adquirida na comunidade (#9) |
| Reanimação Neonatal (#65) | Reanimação neonatal (#27) |
| Síndromes Hipertensivas na Gestação (#59) | Síndromes hipertensivas na gestação (#20) |
| Infecção do Trato Urinário (ITU) (#42) | Infecção do Trato Urinário (#10) |
| Dor Torácica Coronariana (#35) | Dor torácica coronariana / SCA (#6) |
| Convulsão Febril e Emergência Convulsiva (#131) | Convulsão na Emergência e Convulsão Febril (#64) |
| Convulsão Febril e Emergência Convulsiva (#131) | Convulsão febril (#26) |
| Classificação dos Estudos Epidemiológicos (#211) | Estudos Epidemiológicos (#143) |
| Atenção Primária à Saúde e Estratégia Saúde da Família (#208) | Atenção Primária à Saúde (#138) |
| Bronquiolite e Coqueluche (#123) | Bronquiolite (#25) |

## Como rodar

Supabase → **SQL Editor → New query → colar → Run**. O resultado esperado é
202 tópicos restantes e 17 no backup. Rodar de novo não muda nada.

```sql
create table if not exists public.topicos_medicos_removidos (like public.topicos_medicos);
alter table public.topicos_medicos_removidos
  add column if not exists mantido_id bigint,
  add column if not exists removido_em timestamptz not null default now();
alter table public.topicos_medicos_removidos enable row level security;

do $$
declare
  par record;
  removido public.topicos_medicos%rowtype;
  total int := 0;
begin
  for par in
    select * from (values
    (55, 16),
    (139, 29),
    (60, 21),
    (23, 62),
    (61, 22),
    (51, 15),
    (56, 17),
    (39, 9),
    (65, 27),
    (59, 20),
    (42, 10),
    (35, 6),
    (131, 64),
    (131, 26),
    (211, 143),
    (208, 138),
    (123, 25)
    ) as v(mantido, removido)
  loop
    select * into removido from public.topicos_medicos where id = par.removido;
    if not found then continue; end if;
    if not exists (select 1 from public.topicos_medicos where id = par.mantido) then
      raise exception 'Tópico % não encontrado. Nada foi alterado.', par.mantido;
    end if;

    insert into public.topicos_medicos_removidos
      select t.*, par.mantido, now() from public.topicos_medicos t where t.id = par.removido;

    update public.topicos_medicos k set
      pegadinhas = case
        when coalesce(btrim(removido.pegadinhas), '') = ''
          or position(btrim(removido.pegadinhas) in coalesce(k.pegadinhas, '')) > 0 then k.pegadinhas
        when coalesce(btrim(k.pegadinhas), '') = '' then removido.pegadinhas
        else k.pegadinhas || E'\n' || removido.pegadinhas
      end,
      tags = (
        select string_agg(tag, ', ' order by primeira)
        from (
          select lower(btrim(x)) as tag, min(ord) as primeira
          from unnest(string_to_array(coalesce(k.tags, '') || ',' || coalesce(removido.tags, ''), ',')) with ordinality as u(x, ord)
          where btrim(x) <> ''
          group by lower(btrim(x))
        ) tags_unicas
      ),
      fonte = case
        when coalesce(removido.fonte, '') = '' or position(removido.fonte in coalesce(k.fonte, '')) > 0 then k.fonte
        else coalesce(nullif(k.fonte, '') || ' · ', '') || removido.fonte
      end,
      atualizado_em = now()
    where k.id = par.mantido;

    delete from public.topicos_medicos where id = par.removido;
    total := total + 1;
  end loop;
  raise notice 'Tópicos unificados: %', total;
end
$$;

select count(*) as topicos_restantes from public.topicos_medicos;
select count(*) as guardados_no_backup from public.topicos_medicos_removidos;
```
