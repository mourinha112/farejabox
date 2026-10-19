import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeImport = createRequire(import.meta.url);

// Carrega os módulos TS reais isoladamente; rede e credenciais são sempre falsas.
function ambiente({ banco = true, evolution = false, falhaMensagem = false, autorizado = true, falhaBanco = false } = {}) {
  const registros = new Map();
  const indices = new Map();
  const chamadas = [];
  const env = banco ? { KV_REST_API_URL: "https://redis.test", KV_REST_API_TOKEN: "teste" } : {};
  if (evolution) Object.assign(env, { EVOLUTION_API_URL: "https://evolution.test", EVOLUTION_API_KEY: "chave-teste", EVOLUTION_INSTANCE: "fareja teste" });
  const cache = new Map();
  const fakeFetch = async (url, opcoes = {}) => {
    chamadas.push({ url, opcoes });
    if (String(url).startsWith("https://evolution.test/")) {
      if (falhaMensagem) throw new Error("Timeout simulado após aceite possível");
      assert.ok([...registros.keys()].some((chave) => chave.includes(":pedido:FJ-")), "grava antes do envio");
      return Response.json({ key: { id: "mensagem-teste" }, status: "PENDING" });
    }
    assert.equal(url, "https://redis.test", "nenhuma chamada externa permitida nos testes");
    if (falhaBanco) throw new Error("Banco offline simulado");
    const args = JSON.parse(opcoes.body);
    let resultado;
    if (args[0] === "PING") resultado = "PONG";
    else if (args[0] === "ZRANGE") resultado = indices.get(args[1]) || [];
    else if (args[0] === "MGET") resultado = args.slice(1).map((chave) => registros.get(chave) ?? null);
    else if (args[0] === "EVAL") {
      const [, script, n, ...resto] = args;
      const chaves = resto.slice(0, n);
      const valores = resto.slice(n);
      if (script.includes("local existente")) {
        if (registros.has(chaves[0])) resultado = [0, registros.get(registros.get(chaves[0]))];
        else {
          registros.set(chaves[1], valores[0]);
          registros.set(chaves[0], chaves[1]);
          indices.set(chaves[2], [valores[2], ...(indices.get(chaves[2]) || [])]);
          resultado = [1, valores[0]];
        }
      } else if (script.includes("redis.call('INCR'")) {
        resultado = Number(registros.get(chaves[0]) || 0) + 1;
        registros.set(chaves[0], resultado);
      } else {
        const pedido = JSON.parse(registros.get(chaves[0]));
        if (script.includes("pedido.recibo.notificacao = 'enviada'")) {
          pedido.recibo.notificacao = "enviada";
          pedido.notificacaoDetalhe.mensagemId = valores[0];
          pedido.notificacaoDetalhe.concluidaEm = valores[1];
          resultado = 1;
        } else if (pedido.notificacaoDetalhe || pedido.recibo.notificacao !== "pendente") resultado = 0;
        else { pedido.notificacaoDetalhe = { iniciadaEm: valores[0] }; resultado = 1; }
        registros.set(chaves[0], JSON.stringify(pedido));
      }
    } else throw new Error(`Comando não previsto no teste: ${args[0]}`);
    return Response.json({ result: resultado });
  };
  function carregar(arquivo) {
    const absoluto = path.resolve(__dirname, "..", arquivo);
    if (cache.has(absoluto)) return cache.get(absoluto).exports;
    const modulo = { exports: {} };
    cache.set(absoluto, modulo);
    const js = ts.transpileModule(fs.readFileSync(absoluto, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const importar = (nome) => {
      if (nome === "server-only") return {};
      if (nome === "./sessao") return { logado: async () => autorizado };
      if (nome.startsWith("node:")) return nodeImport(nome);
      const destino = nome.startsWith("@/") ? path.resolve(__dirname, "../src", nome.slice(2)) : path.resolve(path.dirname(absoluto), nome);
      return carregar(`${destino}.ts`);
    };
    vm.runInNewContext(js, { module: modulo, exports: modulo.exports, require: importar, process: { env }, fetch: fakeFetch, Response, Request, URL, Buffer, AbortSignal, console: { warn() {} }, TextDecoder, Uint8Array }, { filename: absoluto });
    return modulo.exports;
  }
  return { carregar, registros, chamadas };
}

function entrada(alteracoes = {}) {
  return {
    chaveIdempotencia: "11111111-1111-4111-8111-111111111111", plano: "mensal",
    cliente: { nome: "Tutor de teste", email: "tutor@example.test", whatsapp: "(21) 98613-1173" },
    endereco: { cep: "22041-001", logradouro: "Rua de teste", numero: "10", complemento: "", bairro: "Copacabana", cidade: "Rio de Janeiro", uf: "RJ" },
    respostas: { especie: "cachorro", nomePet: "Pingo", porte: "pequeno", fase: "adulto", foco: "pelagem", frequencia: "as-vezes", alimentacao: "racao", atividade: "media", mastigacao: "moderado", tutor: "", whatsapp: "" },
    metodoPagamento: "pix", notificarWhatsApp: false,
    ...alteracoes,
  };
}

test("valida contato, perfil, CEP/UF e normaliza DDI sem confiar em preço enviado", () => {
  const { validarPedido } = ambiente().carregar("src/lib/pedido.ts");
  const valido = validarPedido({ ...entrada(), totalCentavos: 1 });
  assert.equal(valido.ok, true);
  assert.equal(valido.valor.cliente.whatsapp, "5521986131173");
  assert.equal(valido.valor.respostas.whatsapp, "21986131173");
  assert.equal(valido.valor.totalCentavos, undefined);
  for (const dado of [null, [], entrada({ plano: "gratis" }), entrada({ chaveIdempotencia: "qualquer" }), entrada({ cliente: { ...entrada().cliente, whatsapp: "20999999999" } }), entrada({ cliente: { ...entrada().cliente, email: "sem-email" } }), entrada({ endereco: { ...entrada().endereco, uf: "XX" } }), entrada({ endereco: { ...entrada().endereco, cep: "00000000" } }), entrada({ respostas: { ...entrada().respostas, especie: "outro" } })]) assert.equal(validarPedido(dado).ok, false);
});

test("preços recalculados: mensal169 e trimestre507, frete zero, sem PII no recibo", async () => {
  const a = ambiente();
  const { validarPedido } = a.carregar("src/lib/pedido.ts");
  const { criarPedido } = a.carregar("src/lib/pedidos-servidor.ts");
  for (const [plano, total, chave] of [["mensal", 16900, "11111111-1111-4111-8111-111111111111"], ["trimestral", 50700, "22222222-2222-4222-8222-222222222222"]]) {
    const p = await criarPedido(validarPedido(entrada({ plano, chaveIdempotencia: chave })).valor);
    assert.equal(p.totalCentavos, total);
    assert.equal(p.freteCentavos, 0);
    assert.equal(p.status, "aguardando_pagamento");
    assert.equal(p.pagamento.status, "aguardando_integracao");
    assert.equal(p.cliente, undefined);
    assert.equal(p.endereco, undefined);
  }
});

test("duas requisições simultâneas criam apenas um pedido e uma notificação", async () => {
  const a = ambiente({ evolution: true });
  const dado = a.carregar("src/lib/pedido.ts").validarPedido(entrada({ notificarWhatsApp: true })).valor;
  const { criarPedido } = a.carregar("src/lib/pedidos-servidor.ts");
  const [um, dois] = await Promise.all([criarPedido(dado), criarPedido(dado)]);
  assert.equal(um.id, dois.id);
  const tres = await criarPedido(dado);
  assert.equal(tres.notificacao, "enviada");
  assert.equal(a.chamadas.filter((c) => c.url.startsWith("https://evolution.test/")).length, 1);
  const envio = a.chamadas.find((c) => c.url.startsWith("https://evolution.test/"));
  assert.equal(envio.opcoes.headers.apikey, "chave-teste");
  assert.equal(JSON.parse(envio.opcoes.body).number, "5521986131173");
  assert.match(JSON.parse(envio.opcoes.body).text, /aguardando pagamento/);
  assert.equal(a.registros.size, 2);
  await assert.rejects(() => criarPedido({ ...dado, metodoPagamento: "cartao" }), (erro) => erro.status === 409);
});

test("falha ambígua da Evolution preserva pedido e não reenvia em retry", async () => {
  const a = ambiente({ evolution: true, falhaMensagem: true });
  const dado = a.carregar("src/lib/pedido.ts").validarPedido(entrada({ notificarWhatsApp: true })).valor;
  const { criarPedido } = a.carregar("src/lib/pedidos-servidor.ts");
  const um = await criarPedido(dado);
  const dois = await criarPedido(dado);
  assert.equal(um.id, dois.id);
  assert.equal(dois.notificacao, "pendente");
  assert.equal(a.chamadas.filter((c) => c.url.startsWith("https://evolution.test/")).length, 1);
});

test("sem consentimento não envia; sem configuração mantém pedido sem fingir envio", async () => {
  for (const [evolution, consentimento, status] of [[true, false, "nao_solicitada"], [false, true, "nao_configurada"]]) {
    const a = ambiente({ evolution });
    const dado = a.carregar("src/lib/pedido.ts").validarPedido(entrada({ notificarWhatsApp: consentimento })).valor;
    const pedido = await a.carregar("src/lib/pedidos-servidor.ts").criarPedido(dado);
    assert.equal(pedido.notificacao, status);
    assert.equal(a.chamadas.some((c) => c.url.startsWith("https://evolution.test/")), false);
  }
});

function requisicao(body, origem = "https://fareja.test", headers = {}) {
  return new Request("https://fareja.test/api/pedido", { method: "POST", headers: { "Content-Type": "application/json", Origin: origem, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
}

test("rota rejeita origem externa, corpo excessivo e dados inválidos antes de gravar", async () => {
  const a = ambiente();
  const { POST } = a.carregar("src/app/api/pedido/route.ts");
  assert.equal((await POST(requisicao(entrada(), "https://outro.test"))).status, 403);
  assert.equal((await POST(requisicao("x".repeat(17_000)))).status, 413);
  assert.equal((await POST(requisicao("{"))).status, 400);
  assert.equal((await POST(requisicao({})) ).status, 400);
  assert.equal(a.chamadas.length, 0);
});

test("sem banco não confirma pedido nem dispara mensagem, disponibilidade false", async () => {
  for (const opcoes of [{ banco: false, evolution: true }, { banco: true, falhaBanco: true, evolution: true }]) {
    const a = ambiente(opcoes);
    const { POST, GET } = a.carregar("src/app/api/pedido/route.ts");
    const resposta = await POST(requisicao(entrada({ notificarWhatsApp: true })));
    assert.equal(resposta.status, 503);
    assert.equal((await resposta.json()).ok, false);
    assert.equal((await (await GET()).json()).disponivel, false);
    assert.equal(a.chamadas.some((c) => c.url.startsWith("https://evolution.test/")), false);
  }
});

test("listagem administrativa bloqueia acesso sem sessão", async () => {
  const a = ambiente({ autorizado: false });
  const { listarPedidosRecentes } = a.carregar("src/lib/pedidos-servidor.ts");
  await assert.rejects(listarPedidosRecentes, (erro) => erro.status === 401);
  assert.equal(a.chamadas.length, 0);
});
