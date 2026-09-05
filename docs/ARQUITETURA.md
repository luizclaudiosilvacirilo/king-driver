# King Driver — Arquitetura

## Objetivo
Transformar a demonstração atual em uma plataforma de mobilidade urbana multiusuário, com aplicativo para passageiro, aplicativo para motorista e painel administrativo.

## Módulos principais

### Passageiro
- Cadastro e autenticação
- Origem e destino
- Escolha de categoria
- Solicitação de corrida
- Acompanhamento do motorista
- Histórico de viagens
- Avaliação

### Motorista
- Cadastro e onboarding
- Status online/offline
- Localização em tempo real
- Recebimento de solicitações
- Aceite/recusa
- Início e finalização da corrida
- Ganhos e histórico

### Operação/Admin
- Usuários e motoristas
- Corridas em andamento e concluídas
- Tarifas e categorias
- Indicadores operacionais
- Bloqueios e suporte

## Estados da corrida
`requested → searching → accepted → arriving → in_progress → completed`

Estados alternativos: `cancelled`, `expired` e `disputed`.

## Dados essenciais
- User
- DriverProfile
- Vehicle
- Ride
- RideOffer
- LocationUpdate
- Payment
- Rating

## Segurança
Credenciais não devem ser armazenadas no aplicativo em texto puro. Tokens de sessão devem ter expiração, renovação e revogação. Dados sensíveis e chaves privadas nunca devem ser enviados ao repositório.

## Evolução técnica
1. Definir contratos de API e modelos de dados.
2. Implementar autenticação e autorização por papel.
3. Implementar criação e ciclo de vida da corrida.
4. Adicionar localização e atualização em tempo real.
5. Integrar notificações.
6. Integrar pagamentos após a base operacional estar estável.
7. Criar aplicativo móvel e painel administrativo.
8. Adicionar testes, observabilidade e controles de segurança.

## Status atual
A raiz do projeto ainda contém uma demo web estática funcional. Esta arquitetura documenta a migração gradual para um sistema real sem remover a demo existente.
