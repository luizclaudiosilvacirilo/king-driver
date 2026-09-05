# King Driver 👑🚗

Plataforma de mobilidade urbana em desenvolvimento, com experiência separada para **Passageiro**, **Motorista** e **Proprietário/Administração**.

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
│       ├── 001_profiles.sql
│       ├── 002_core_tables.sql
│       ├── 002_profile_auth_trigger_and_permissions.sql
│       ├── 003_secure_ride_actions.sql
│       ├── 004_runtime_realtime_and_driver_presence.sql
│       └── 005_driver_ride_visibility_and_approval.sql
├── auth.html
├── index.html
├── vercel.json
└── .env.example
```

## Banco de dados

O schema inclui:

- `profiles` — identidade e papel do usuário.
- `driver_profiles` — habilitação/status do motorista.
- `vehicles` — veículos cadastrados.
- `rides` — corridas e ciclo de vida.
- `ride_offers` — ofertas para motoristas.
- `driver_locations` — última posição e presença online do motorista.
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

## Fluxo atual da interface

- Cadastro e login com Supabase Auth.
- Perfil de passageiro ou motorista.
- Passageiro cria corrida com origem, destino, categoria e valor ofertado.
- Motorista aprovado pode ficar online e descobrir corridas solicitadas.
- Aceite de corrida protegido por função SQL.
- Motorista avança a corrida por `arriving`, `in_progress` e `completed`.
- Passageiro pode cancelar nos estados permitidos.
- Localização do motorista é atualizada pelo GPS do dispositivo quando disponível.

## API

`api/health.js` fornece o primeiro endpoint de saúde para o backend hospedado. Os próximos endpoints serão adicionados por domínio, mantendo credenciais privadas exclusivamente no ambiente do servidor.

## Desenvolvimento e deploy

As migrations do Supabase devem ser aplicadas através do fluxo versionado de migrations. O projeto pode ser conectado a um ambiente Supabase e, posteriormente, automatizado com CI/CD.

## Segurança

- Não versionar `.env` nem chaves privadas.
- A chave secreta/service-role do Supabase é exclusivamente server-side.
- RLS deve permanecer habilitado nas tabelas expostas.
- Ações críticas da corrida usam funções SQL protegidas em vez de permitir alterações arbitrárias de status pelo cliente.
- Motoristas precisam estar aprovados/verificados para aceitar corridas.

## Próximas etapas

1. Conectar o projeto a uma instância Supabase real.
2. Validar e aplicar as migrations em ambiente de desenvolvimento.
3. Testar ponta a ponta cadastro → corrida → aceite → conclusão.
4. Implementar tempo real completo para ofertas e localização.
5. Integrar mapas/GPS e notificações push.
6. Integrar pagamentos.
7. Transformar a interface em aplicativos Android/iOS e painel administrativo.
8. Adicionar testes, observabilidade, antifraude e controles de produção.

## Importante

A estrutura real e o fluxo inicial já estão no repositório, mas **ainda não deve ser usada para operar corridas reais** até que o banco remoto, autenticação, mapas/GPS, pagamentos, notificações, testes e controles de produção sejam configurados e validados.