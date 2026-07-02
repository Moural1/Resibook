# Backups do ResiBook

O ResiBook usa duas camadas de proteção:

1. Backups administrados pelo Supabase, conforme o plano do projeto.
2. Backup lógico semanal criptografado pelo GitHub Actions.

O workflow nunca grava SQL no repositório. Ele gera os arquivos em um runner
temporário, criptografa o pacote e envia somente `resibook-backup.enc` como
artefato com retenção de 30 dias.

## Configuração inicial

No GitHub, abra `Settings > Secrets and variables > Actions` e crie:

- `SUPABASE_DB_URL`: connection string do Session pooler exibida em
  `Supabase > Connect`, incluindo a senha do banco.
- `BACKUP_ENCRYPTION_PASSWORD`: senha aleatória com pelo menos 24 caracteres,
  diferente de todas as outras senhas do sistema.

Guarde `BACKUP_ENCRYPTION_PASSWORD` em um gerenciador de senhas fora do GitHub.
Sem ela, o conteúdo dos backups não pode ser recuperado.

Depois do merge, abra `Actions > Backup semanal criptografado` e execute
`Run workflow` uma vez. Confirme que a execução ficou verde e que o artefato
foi criado. A execução automática ocorre aos domingos, 06:00 UTC (03:00 em
Brasília).

## Como verificar um backup

Baixe o artefato de uma execução e extraia o ZIP gerado pelo GitHub. Em um
terminal com OpenSSL:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 \
  -in resibook-backup.enc \
  -out resibook-backup.tar.gz

mkdir resibook-backup
tar -xzf resibook-backup.tar.gz -C resibook-backup
cd resibook-backup
sha256sum -c <(grep '  backup/' manifest.txt | sed 's#  backup/#  #')
```

O pacote contém `roles.sql`, `schema.sql`, `data.sql` e `manifest.txt`.

## Restauração segura

Nunca teste restauração diretamente no banco de produção. Crie primeiro um
projeto Supabase vazio e use a connection string dele:

```bash
psql "$NEW_DB_URL" --file roles.sql
psql "$NEW_DB_URL" --single-transaction --variable ON_ERROR_STOP=1 --file schema.sql
psql "$NEW_DB_URL" --single-transaction --variable ON_ERROR_STOP=1 --file data.sql
```

Esse backup lógico protege o banco da aplicação. Objetos do Supabase Storage e
configurações externas não fazem parte dele. Atualmente o ResiBook não armazena
arquivos clínicos no Storage, mas essa política deve ser revista se uploads
forem adicionados.

Faça um teste de restauração a cada três meses. Um backup só é confiável depois
que sua restauração foi validada.

Referências oficiais:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/deployment/ci/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

