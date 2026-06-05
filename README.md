# ResiBook

Sistema clínico web para organização de pacientes, prescrições, evoluções, exames, tópicos médicos, flashcards e CIDs.

O ResiBook foi criado para uso médico em rotina de plantão, estudo e acompanhamento clínico, com foco em rapidez, organização e acesso responsivo pelo computador e celular.

---

## Funcionalidades principais

### Autenticação

- Login por e-mail e senha via Supabase Auth.
- Logout integrado.
- Interface protegida por fluxo de autenticação.
- Acesso otimizado para uso em produção via Vercel.

---

### Dashboard

- Visão geral do sistema.
- Acesso rápido aos principais módulos.
- Layout responsivo.
- Integração com contagens reais do banco.

---

### Pacientes

- Cadastro de pacientes.
- Edição de pacientes.
- Exclusão de pacientes.
- Busca por nome, queixa, diagnóstico, especialidade, telefone e observações.
- Filtros por sexo e especialidade.
- Botão para copiar resumo clínico.
- Botão para abrir prontuário individual.

---

### Prontuário individual

Rota:

```txt
/pacientes/[id]