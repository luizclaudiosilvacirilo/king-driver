# King Driver 👑🚗

Plataforma de mobilidade urbana em desenvolvimento, com experiência separada para **Passageiro**, **Motorista** e **Proprietário/Administração**.

## Status atual

O repositório já contém uma demonstração web funcional do fluxo principal do King Driver. A demo é propositalmente independente de serviços externos e serve para validar a experiência e a navegação antes da integração com backend e aplicativos móveis.

## Módulos planejados

- 👤 Passageiro: cadastro/login, origem e destino, categoria, solicitação e acompanhamento da corrida.
- 🚗 Motorista: cadastro, aprovação, disponibilidade, recebimento/aceite de corridas e ganhos.
- 🏢 Proprietário/Admin: indicadores, gestão de usuários e motoristas, corridas e operação.
- 📍 Localização: GPS, atualização de posição e acompanhamento da corrida.
- 🔄 Corridas em tempo real: estados de solicitação, aceite, chegada, início, conclusão e cancelamento.
- 💰 Valores: cálculo de estimativa, valor final, histórico e futura integração de pagamentos.
- 🔐 Segurança: autenticação, autorização por perfil e proteção de dados.

## Arquitetura alvo

```text
Aplicativos móveis (Android / iOS)
        │
        ├── Passageiro
        └── Motorista
                │
                ▼
        API / Backend King Driver
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
     Banco   Tempo real  Notificações
        │
        ▼
   Painel Admin
```

A arquitetura será evoluída por etapas, mantendo a demonstração atual preservada para não interromper o projeto.

## Próximas etapas técnicas

1. Estruturar os modelos de usuário, motorista, corrida e localização.
2. Definir autenticação e permissões por perfil.
3. Criar o contrato da API para corridas e usuários.
4. Preparar comunicação em tempo real para atualização de corridas e localização.
5. Preparar os aplicativos Android/iOS.
6. Integrar mapas/GPS, notificações e pagamentos.
7. Criar ambiente de produção, monitoramento e políticas de segurança.

## Importante

Esta versão ainda é **protótipo/demonstração**. Não deve ser usada para operar corridas reais, armazenar dados sensíveis ou processar pagamentos até que o backend, autenticação, segurança, banco de dados e integrações de produção sejam implementados e testados.

## Demonstração

O arquivo `index.html` contém a demo web atual do projeto.
