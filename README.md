# King Driver 👑🚗

Plataforma de mobilidade urbana em desenvolvimento, com experiência separada para **Passageiro**, **Motorista** e **Proprietário/Administração**.

## Acesso público atual

O site público oficial desta versão está publicado em **https://king-driver.netlify.app**.

## Estado atual

A demo web continua preservada, e a interface principal já está preparada para usar o backend Supabase configurado no projeto: autenticação, perfis, solicitação/aceite de corridas, presença do motorista e atualização de localização.

## Estrutura principal

```text
king-driver/
├── api/
│   └── health.js
├── docs/
│   └── ARQUITETURA.md
├── js/
│   ├── auth.js
│   ├── config.js
│   ├── king-driver.js
│   └── ride.js
├── supabase/
│   ├── config.toml
│   └── migrations/
├── auth.html
├── index.html
├── vercel.json
├── netlify.toml
├── _redirects
└── .env.example
```

## Banco de dados

O schema inclui perfis, motoristas, veículos, corridas, ofertas, localização, eventos, pagamentos e avaliações. As tabelas expostas usam **Row Level Security (RLS)** e políticas por usuário/administrador.

## Fluxo da corrida

```text
requested → searching → accepted → arriving → in_progress → completed
                         └──────────────→ cancelled
```

## Fluxo atual da interface

- Cadastro e login com Supabase Auth.
- Perfil de passageiro ou motorista.
- Passageiro cria corrida com origem, destino, categoria e valor ofertado.
- Motorista aprovado pode ficar online e descobrir corridas solicitadas.
- Aceite de corrida protegido por função SQL.
- Motorista avança a corrida por `arriving`, `in_progress` e `completed`.
- Passageiro pode cancelar nos estados permitidos.
- Localização do motorista é atualizada pelo GPS do dispositivo quando disponível.

## Segurança

- Não versionar `.env` nem chaves privadas.
- A chave secreta/service-role do Supabase é exclusivamente server-side.
- RLS deve permanecer habilitado nas tabelas expostas.
- Ações críticas da corrida usam funções SQL protegidas.
- Motoristas precisam estar aprovados/verificados para aceitar corridas.

## Observação

A publicação web e o acesso público são uma etapa de teste do produto. Para operação comercial real ainda são necessários validação ponta a ponta, mapas/GPS, notificações, pagamentos, antifraude e controles de produção.
