# FAREJA · Box funcional do pet

Site, perfil do pet, app do tutor e painel do funil. Next.js 16 (App Router) + Tailwind 4.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Site da marca (landing, planos, FAQ) |
| `/quiz` | Perfil gratuito em quatro etapas, com prévia personalizada antes de pedir nome e WhatsApp |
| `/assinar?plano=mensal` ou `/assinar?plano=trimestral` | Caminho para quem escolheu um plano: quatro etapas para a seleção, prévia e contato para concluir pelo WhatsApp |
| `/mapa` | O Mapa do pet: índice, plano de 7 dias e sugestão de box. Botão "Salvar em PDF" |
| `/app` | App do tutor: caixa do mês, saúde, check-in semanal, perfil |
| `/admin` | Painel do funil: quantos começaram, concluíram e quiseram o box + lista de leads |
| `/painel` | Gera o link de acesso do tutor com status da caixa (exige login do `/admin`) |

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sim | WhatsApp da FAREJA, só dígitos com DDI. Ex.: `5521999999999` |
| `ADMIN_PASSWORD` | Sim | Senha do `/admin`, mínimo 8 caracteres |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Sim, para o funil | Preenchidas pela Vercel ao conectar um Upstash Redis em **Storage** |
| `NEXT_PUBLIC_SITE_URL` | Não | Endereço público do site |
| `LEAD_WEBHOOK_URL` | Não | Webhook que recebe cada lead do quiz (n8n, Make, CRM) |

Depois de criar ou mudar variáveis, faça um novo deploy.

## Como funciona o acesso do tutor

Os dados do app ficam no aparelho do tutor. O acesso em outro aparelho é pelo **link pessoal**
(`/app#acesso=...`), que carrega perfil, plano escolhido e status da caixa dentro do próprio endereço.
Para atualizar a entrega de um cliente, gere um link novo em `/painel` e envie pelo WhatsApp.
Ao refazer o perfil do mesmo pet com o mesmo WhatsApp, o histórico e a assinatura deste aparelho são preservados.

## Prévia e assinatura

O perfil é apresentado depois das quatro etapas, antes da coleta de nome e WhatsApp. O contato é pedido
para quem quer continuar com o cupom, acompanhamento ou assinatura. A seleção exibida é uma sugestão
baseada nas respostas, validada pela equipe FAREJA durante o atendimento.

A assinatura só é concluída no atendimento pelo WhatsApp, após confirmação da seleção, pagamento e
eventual frete. Abrir o WhatsApp apenas prepara a mensagem: a pessoa precisa enviá-la. O site não
confirma compra nem ativa assinatura ao salvar o contato.

## O que o funil conta

- **Começaram**: passaram da primeira etapa do perfil.
- **Prévia**: chegaram ao perfil personalizado antes de informar contato; o evento não contém dados pessoais.
- **Fizeram o quiz**: enviaram nome e WhatsApp (contatos únicos).
- **Quiseram o box**: clicaram no botão de assinatura no resultado, no Mapa ou no app. Esse botão abre o
  WhatsApp com a mensagem pronta; o evento representa interesse, não uma compra concluída.

## Onde editar

- Preços, cupom, FAQ, depoimentos: `src/lib/config.ts`
- Pontuação, suplementos e planos de 7 dias: `src/lib/diagnostico.ts`

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```
