# FAREJA · Box funcional do pet

Site, perfil do pet, app do tutor e painel do funil. Next.js 16 (App Router) + Tailwind 4.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Site da marca (landing, planos, FAQ) |
| `/quiz` | Perfil gratuito em quatro etapas, com prévia personalizada antes de pedir nome e WhatsApp |
| `/assinar?plano=mensal` ou `/assinar?plano=trimestral` | Caminho para quem escolheu um plano: quatro etapas para a seleção, prévia e checkout |
| `/checkout?plano=mensal` ou `/checkout?plano=trimestral` | Contato, entrega, preferência de pagamento e confirmação de registro do pedido |
| `/mapa` | O Mapa do pet: índice, plano de 7 dias e sugestão de box. Botão "Salvar em PDF" |
| `/app` | App do tutor: caixa do mês, saúde, check-in semanal, perfil |
| `/admin` | Painel protegido com funil, leads e pedidos do checkout |
| `/painel` | Gera o link de acesso do tutor com status da caixa (exige login do `/admin`) |

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Não | Substitui o WhatsApp comercial padrão da FAREJA (`5521986131173`), só dígitos com DDI |
| `ADMIN_PASSWORD` | Sim | Senha do `/admin`, mínimo 8 caracteres |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Sim, para funil e pedidos | Preenchidas pela Vercel ao conectar um Upstash Redis em **Storage**; também aceita `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` |
| `NEXT_PUBLIC_SITE_URL` | Não | Endereço público do site |
| `LEAD_WEBHOOK_URL` | Não | Webhook que recebe cada lead do quiz (n8n, Make, CRM) |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` | Não | URL HTTPS, chave e instância conectada da Evolution v2; confirmação opcional do pedido no WhatsApp |

Depois de criar ou mudar variáveis, faça um novo deploy.

## Como funciona o acesso do tutor

Os dados do app ficam no aparelho do tutor. O acesso em outro aparelho é pelo **link pessoal**
(`/app#acesso=...`), que carrega perfil, plano escolhido e status da caixa dentro do próprio endereço.
Para atualizar a entrega de um cliente, gere um link novo em `/painel` e envie pelo WhatsApp.
Ao refazer o perfil do mesmo pet com o mesmo WhatsApp, o histórico e a assinatura deste aparelho são preservados.

## Prévia e assinatura

O perfil é apresentado depois das quatro etapas, antes da coleta de nome e WhatsApp. O contato é pedido
para quem quer continuar com o acompanhamento ou assinatura. A seleção exibida é uma sugestão
baseada nas respostas, validada pela equipe FAREJA antes do envio.

O checkout registra o pedido no servidor depois da revisão dos dados. A assinatura continua aguardando
pagamento; salvar contato ou registrar o pedido não efetua cobrança nem ativa a assinatura.

## Checkout e integrações

O plano mensal custa R$169; o trimestral custa R$507 (três caixas a R$169). O servidor calcula o total a
partir de `config.ts`, sem aceitar preços enviados pelo navegador. Ambos atendem ao limite de frete
grátis vigente. O checkout não aplica desconto de cupom sem uma regra de desconto definida.

`POST /api/pedido` valida plano, perfil do pet, contato, CEP, endereço, preferência de pagamento e
consentimento para WhatsApp. Os pedidos são gravados de forma atômica no Redis, com UUID de
idempotência: reenviar a mesma tentativa devolve o mesmo recibo; alterar o conteúdo da tentativa
retorna conflito. A resposta pública não contém endereço, telefone ou e-mail. A consulta administrativa
`listarPedidosRecentes()` exige a sessão do `/admin`. `GET /api/pedido` verifica se o banco responde.
Sem banco disponível, o checkout não apresenta um pedido como registrado.

Pix e cartão são, por enquanto, **preferências**. Nenhum número de cartão é solicitado, nenhum QR Code
de pagamento é inventado e nenhum pedido é marcado como pago. O recibo fica em `aguardando_pagamento`,
com pagamento `aguardando_integracao`. Para ativar cobranças, a futura API de pagamento deverá criar a
cobrança a partir do pedido no servidor, validar seus webhooks e somente então confirmar o pagamento.
O ponto inicial do adaptador é `prepararPagamento()` em `src/lib/pedidos-servidor.ts`; a criação real de
uma sessão de pagamento deverá acontecer após a gravação idempotente, e não durante o cálculo do recibo.

A Evolution é opcional e usa `POST /message/sendText/{instance}`, com cabeçalho `apikey` e corpo
`number`, `text` e `linkPreview`, conforme o [contrato oficial da API](https://github.com/evolution-foundation/evolution-api/blob/main/src/api/dto/sendMessage.dto.ts).
A mensagem informa **pedido registrado, aguardando pagamento**, somente após gravação e quando o tutor
autoriza o envio. `enviada` significa aceita pela API com um ID, sem comprovar entrega/leitura.
Não configurar as três variáveis mantém o pedido válido com notificação `nao_configurada`.

Uma trava persistente evita mensagens duplicadas em retentativas, inclusive após timeouts ambíguos.
Falhas de WhatsApp não apagam pedidos. Nesses casos a notificação fica `pendente`: a equipe deve
conferir o provedor antes de um eventual reenvio manual. Não há reenvio automático nem fila nesta versão.
As credenciais permanecem no servidor. Não reutilize chaves de teste em produção.

Verificação do backend, sem banco externo ou envio real: `node --test tests/pedido.test.mjs`.

## O que o funil conta

- **Começaram**: passaram da primeira etapa do perfil.
- **Prévia**: chegaram ao perfil personalizado antes de informar contato; o evento não contém dados pessoais.
- **Fizeram o quiz**: enviaram nome e WhatsApp (contatos únicos).
- **Quiseram o box**: clicaram no botão de assinatura no resultado, no Mapa ou no app. O evento
  representa interesse, não pagamento confirmado; o registro do pedido acontece no checkout.

## Onde editar

- Preços, FAQ, depoimentos: `src/lib/config.ts`
- Pontuação, suplementos e planos de 7 dias: `src/lib/diagnostico.ts`

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```
