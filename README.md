# FAREJA · Box funcional do pet

Site, quiz de diagnóstico, app do tutor e painel do funil. Next.js 16 (App Router) + Tailwind 4.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Site da marca (landing, planos, FAQ) |
| `/quiz` | Avaliação gratuita em 5 passos. Aceita `?plano=mensal` ou `?plano=trimestral` |
| `/mapa` | O Mapa do pet: índice, plano de 7 dias e box indicado. Botão "Salvar em PDF" |
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
(`/app#acesso=...`), que carrega perfil e status da caixa dentro do próprio endereço.
Para atualizar a entrega de um cliente, gere um link novo em `/painel` e envie pelo WhatsApp.

## O que o funil conta

- **Começaram**: passaram do passo 1 do quiz.
- **Fizeram o quiz**: enviaram nome e WhatsApp (contatos únicos).
- **Quiseram o box**: clicaram em "Quero o box" no resultado, no Mapa ou no app. Esse botão abre o
  WhatsApp com o pedido pronto; ainda não há checkout com pagamento online.

## Onde editar

- Preços, cupom, FAQ, depoimentos: `src/lib/config.ts`
- Pontuação, suplementos e planos de 7 dias: `src/lib/diagnostico.ts`

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```
