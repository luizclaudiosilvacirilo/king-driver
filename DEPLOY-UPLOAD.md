# King Driver — publicação por upload

O projeto está preparado para hospedagem estática por upload, sem depender da integração GitHub↔Vercel.

## Conteúdo a publicar

Envie a pasta raiz inteira do repositório. Os arquivos principais são `index.html`, `auth.html`, `admin.html`, `js/`, `api/`, `supabase/`, `_redirects` e `netlify.toml`.

## Hospedagem

Use um serviço que aceite **Upload/Drag-and-Drop** de uma pasta estática. O diretório de publicação é a própria raiz (`.`); não existe etapa de build.

## Importante

- O navegador usa somente a chave pública do Supabase em `js/config.js`.
- Não coloque senha, service-role key, token privado ou credenciais bancárias no projeto.
- O backend Supabase continua responsável por autenticação, RLS e operações protegidas.
- Depois do upload, teste `/`, `/login`, `/cadastro` e `/admin.html`.

## Estado

Preparado em setembro de 2026 para publicação estática simples. A publicação real ainda precisa ser executada em uma conta de hospedagem autorizada.
