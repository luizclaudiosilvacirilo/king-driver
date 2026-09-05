# King Driver 👑🚗

Plataforma de mobilidade urbana em desenvolvimento, com experiência separada para **Passageiro**, **Motorista** e **Proprietário/Administração**.

## Estado atual

A demo web continua preservada, mas o repositório agora também contém a primeira camada da estrutura real do produto: schema PostgreSQL/Supabase versionado, autenticação por perfis, RLS, ciclo de vida de corridas, ofertas, localização, pagamentos, avaliações e um endpoint inicial de saúde da API.

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
│       ├── 001_profiles.sql
│       ├── 002_core_tables.sql
│       ├── 002_profile_auth_trigger_and_permissions.sql
│       └── 003_secure_ride_actions.sql
├── auth.html
├── index.html
├── vercel.json
└── .env.example
```

## Banco de dados real

O schema inclui:

- `profiles` — identidade e papel do usuário.
- `driver_profiles` — habilitação/status do motorista.
- `vehicles` — veículos cadastrados.
- `rides` — corridas e ciclo de vida.
- `ride_offers` — ofertas para motoristas.
- `driver_locations` — última posição do motorista.
- `ride_events` — histórico de eventos.
- `payments` — estado financeiro da corrida.
- `ratings` — avaliações entre participantes.

As tabelas expostas usam **Row Level Security (RLS)** e políticas por usuário/administrador. As mudanças do banco ficam versionadas em `supabase/migrations/`.

## Fluxo da corrida

```text
requested → searching → accepted → arriving → in_progress → completed
                         └──────────────→ cancelled
```

Também existem estados para `expired` e `disputed`.

## API

`api/health.js` fornece o primeiro endpoint de saúde para o backend hospedado. Os próximos endpoints serão adicionados por domínio, mantendo credenciais privadas exclusivamente no ambiente do servidor.

## Desenvolvimento e deploy

As migrations do Supabase devem ser aplicadas através do fluxo versionado de migrations. O projeto pode ser conectado a um ambiente Supabase e, posteriormente, automatizado com CI/CD.

## Segurança

- Não versionar `.env` nem chaves privadas.
- A `SUPABASE_SERVICE_ROLE_KEY` é exclusivamente server-side.
- RLS deve permanecer habilitado nas tabelas expostas.
- Ações críticas da corrida usam funções SQL protegidas em vez de permitir alterações arbitrárias de status pelo cliente.

## Próximas etapas

1. Conectar o projeto a uma instância Supabase real.
2. Validar e aplicar as migrations em ambiente de desenvolvimento.
3. Completar API de autenticação e corridas.
4. Implementar tempo real para ofertas e localização.
5. Integrar mapas/GPS e notificações push.
6. Integrar pagamentos.
7. Transformar a interface em aplicativos Android/iOS e painel administrativo.
8. Adicionar testes, observabilidade, antifraude e controles de produção.

## Importante

A estrutura real já está no repositório, mas **ainda não deve ser usada para operar corridas reais** até que o banco remoto, autenticação, mapas/GPS, pagamentos, notificações, testes e controles de produção sejam configurados e validados.
