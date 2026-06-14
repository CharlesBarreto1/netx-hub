/**
 * Conteúdo inicial da wiki (base de conhecimento da equipe NetX). Inserido uma
 * vez quando a tabela está vazia (WikiService.onModuleInit). Depois é editável
 * pelo painel — re-seed NÃO sobrescreve edições.
 */
export interface SeedArticle {
  slug: string;
  title: string;
  category: string;
  orderIndex: number;
  content: string;
}

export const WIKI_SEED: SeedArticle[] = [
  {
    slug: 'visao-geral',
    title: 'Visão geral do Hub',
    category: 'Início',
    orderIndex: 1,
    content: `# Visão geral do NetX Hub

O Hub é a plataforma da **NetX (nós)** para licenciar e cobrar os provedores
(ISPs) que usam o NetX. Ele faz três coisas:

1. **Licenciamento** — assina diariamente um token (Ed25519) que cada instalação
   do NetX valida localmente. Sem token válido, o painel do ISP bloqueia.
2. **Cobrança** — gera faturas mensais por contrato ativo, recebe Pix (EFI) e
   controla inadimplência.
3. **Gestão** — cadastro de clientes (licenciados), instâncias e telemetria.

## Como as peças conversam

- O NetX do cliente faz **heartbeat diário** → o Hub assina um token de 7 dias.
- O token diz se a licença está \`ACTIVE\` ou \`BLOCKED\`. O NetX só confia na
  assinatura (chave pública embarcada); o Hub guarda a privada.
- Bloqueio nunca derruba a rede dos assinantes do ISP — só o painel de gestão.

> Detalhe técnico do lado do cliente: \`netx/docs/licensing.md\`.`,
  },
  {
    slug: 'cadastrar-cliente',
    title: 'Cadastrar e provisionar um cliente',
    category: 'Operação',
    orderIndex: 1,
    content: `# Cadastrar e provisionar um cliente

Passo a passo para colocar um novo ISP no ar:

1. **Cadastrar o licenciado** (Clientes → Novo cliente): nome, CNPJ/RUC,
   **preço por contrato** e **dia de vencimento**.
2. **Instalar o NetX** na VPS do cliente. O installer gera o \`NETX_INSTANCE_ID\`
   (fica em \`/etc/netx/.secrets\`).
3. **Vincular a instância** (detalhe do cliente → Instâncias → colar o
   \`NETX_INSTANCE_ID\` → Vincular). O Hub devolve a **license key** — ela
   aparece **uma única vez**, copie na hora.
4. Configurar no \`.env\` do cliente:
   \`\`\`
   NETX_HUB_URL=https://hub.seu-dominio
   NETX_LICENSE_KEY=<license key gerada>
   NETX_INSTANCE_ID=<o mesmo uuid>
   \`\`\`
5. **Criar acesso à central** (detalhe do cliente → Acesso à central): e-mail e
   senha que o ISP usará para ver faturas e pagar.

Pronto: no próximo heartbeat o cliente aparece com telemetria (versão, contratos
ativos, último contato).`,
  },
  {
    slug: 'faturamento',
    title: 'Faturamento e cobrança',
    category: 'Financeiro',
    orderIndex: 1,
    content: `# Faturamento e cobrança

- **Base de cálculo:** pico de contratos ativos no mês (telemetria do heartbeat)
  × **preço por contrato** do licenciado.
- **Geração:** automática no começo do mês (cron diário). Dá para gerar sob
  demanda no detalhe do cliente → Faturas → "Gerar fatura do mês".
- **Vencimento:** o \`billingDay\` do cliente.
- **Situações:** \`OPEN\` → \`PAID\` (pagou) ou \`OVERDUE\` (venceu + dias de graça).

## Dar baixa

- **Automática (Pix/EFI):** o webhook marca a fatura como paga sozinho.
- **Manual:** detalhe do cliente → Faturas → "Marcar paga" (quando o cliente
  pagou por fora).

> A graça antes de virar OVERDUE é \`LICENSE_GRACE_DAYS\` (padrão 2 dias).`,
  },
  {
    slug: 'bloqueio-desbloqueio',
    title: 'Bloqueio e desbloqueio',
    category: 'Financeiro',
    orderIndex: 2,
    content: `# Bloqueio e desbloqueio

O status que o cliente recebe no token é o **status efetivo**:

1. **Bloqueio manual (admin):** detalhe do cliente → Instâncias → "Bloquear".
   Tem prioridade — bloqueia independente de fatura.
2. **Inadimplência:** fatura vencida (além da graça) bloqueia automaticamente no
   próximo heartbeat — **a menos** que haja um desbloqueio em confiança vigente.

## Desbloqueio em confiança

O próprio cliente, na central, pode se desbloquear por um prazo curto
(\`TRUST_UNLOCK_DAYS\`, padrão 3) — limitado a \`TRUST_UNLOCK_MAX_PER_INVOICE\`
(padrão 1) por fatura em atraso. Serve para dar fôlego sem abrir suporte.

## Importante

O bloqueio trava **só o painel de gestão** do ISP. RADIUS/PPPoE dos assinantes
dele continuam funcionando — nunca derrubamos a rede por licença.`,
  },
  {
    slug: 'pagamento-pix-efi',
    title: 'Pagamento Pix (EFI)',
    category: 'Financeiro',
    orderIndex: 3,
    content: `# Pagamento Pix (EFI)

Pix imediato via EFI, com baixa automática por webhook.

## Configuração (\`.env\` do Hub)

\`\`\`
EFI_ENABLED=true
EFI_CLIENT_ID=...
EFI_CLIENT_SECRET=...
EFI_CERTIFICATE_BASE64=<.p12 em base64>
EFI_CERTIFICATE_PASSWORD=...
EFI_PIX_KEY=<chave Pix da NetX>
HUB_PUBLIC_URL=https://hub.seu-dominio
EFI_WEBHOOK_TOKEN=<aleatório>
\`\`\`

## Como funciona

1. Cliente clica "Pagar" na central → o Hub cria uma cobrança Pix e mostra
   copia-e-cola + QR (idempotente: reusa a cobrança vigente).
2. A EFI chama \`POST /v1/efi/webhook/pix/<EFI_WEBHOOK_TOKEN>\` quando paga.
3. O Hub acha a fatura pelo \`txid\` e marca como paga → o cliente sai do
   bloqueio no próximo heartbeat.

**Registre o webhook na EFI** apontando para essa URL (mTLS no proxy).
Com \`EFI_ENABLED=false\`, o "Pagar" orienta pagamento por fora + baixa manual.`,
  },
  {
    slug: 'backup',
    title: 'Backup e restauração',
    category: 'Operação',
    orderIndex: 2,
    content: `# Backup e restauração

Backup diário do Postgres do Hub via systemd timer.

- Script: \`deploy/backup/netx-hub-backup.sh\` (pg_dump validado + retenção +
  rclone off-site opcional).
- Dumps em \`/var/backups/netx-hub/auto\`.
- Off-site: configure \`rclone\` e \`HUB_BACKUP_REMOTE\` no \`.env\`.

## Rodar manual / testar
\`\`\`
sudo systemctl start netx-hub-backup.service
journalctl -u netx-hub-backup -n 50
\`\`\`

## Restaurar
\`\`\`
pg_restore --clean --if-exists -d "$DATABASE_URL" /var/backups/netx-hub/auto/netxhub-<stamp>.dump
\`\`\``,
  },
  {
    slug: 'chaves-licenca',
    title: 'Chaves de licença (segurança)',
    category: 'Operação',
    orderIndex: 3,
    content: `# Chaves de licença

O Hub assina tokens com uma **chave privada Ed25519**. O NetX valida com a
**pública** embarcada nele.

- Gerar par: \`npm run keygen\` → privada no \`.env\` (\`LICENSE_PRIVATE_KEY_B64\`),
  pública em \`netx/packages/shared/src/licensing/public-key.ts\`.
- **A privada nunca vai pro git.** Guarde em cofre. Se vazar, dá pra forjar
  licença — rotacione (gera par novo, atualiza o NetX dos clientes com
  \`sudo netx-update\`).
- License keys dos clientes ficam como **sha256** (a key em claro aparece só na
  criação). Perdeu? Use "Nova key" no detalhe da instância.

> DEV usa um par fixo guardado fora do repo; PROD usa um par próprio.`,
  },
  {
    slug: 'troubleshooting',
    title: 'Solução de problemas',
    category: 'Suporte',
    orderIndex: 1,
    content: `# Solução de problemas

### Cliente diz que o painel bloqueou "do nada"
- Veja em Instâncias se o status é \`BLOCKED\` (bloqueio manual) ou se há fatura
  \`OVERDUE\`. Inadimplência bloqueia automático.
- Solução rápida: o cliente pode usar "desbloquear em confiança" na central, ou
  você dá baixa/desbloqueia manual.

### Instância não aparece / sem telemetria
- O heartbeat é diário. Confira no cliente: \`NETX_HUB_URL\`,
  \`NETX_LICENSE_KEY\`, \`NETX_INSTANCE_ID\` no \`.env\` e se a VPS tem internet.
- Force no cliente: \`POST /v1/license/heartbeat\` (admin) ou reinicie o core.

### Pagou e não baixou
- Confira se o webhook da EFI está registrado e acessível
  (\`/v1/efi/webhook/pix/<token>\`). Em último caso, baixa manual em Faturas.

### "Licença inválida" no cliente
- A chave pública embarcada no NetX precisa casar com a privada do Hub. Se
  rotacionou a chave, rode \`sudo netx-update\` no cliente.`,
  },
];
