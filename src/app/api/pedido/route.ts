import { validarPedido } from "@/lib/pedido";
import { checkoutDisponivel, criarPedido, ErroPedido, limitarPedidos } from "@/lib/pedidos-servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cabecalhos = { "Cache-Control": "no-store" };
const limiteCorpo = 16_384;

export async function GET() {
  return Response.json({ disponivel: await checkoutDisponivel() }, { headers: cabecalhos });
}

async function lerCorpo(request: Request): Promise<unknown> {
  const informado = Number(request.headers.get("content-length") ?? 0);
  if (informado > limiteCorpo) throw new ErroPedido("Os dados enviados ultrapassam o limite permitido.", 413);
  if (!request.body) throw new ErroPedido("Envie os dados do pedido.", 400);
  const leitor = request.body.getReader();
  const blocos: Uint8Array[] = [];
  let tamanho = 0;
  try {
    while (true) {
      const { done, value } = await leitor.read();
      if (done) break;
      tamanho += value.byteLength;
      if (tamanho > limiteCorpo) { await leitor.cancel(); throw new ErroPedido("Os dados enviados ultrapassam o limite permitido.", 413); }
      blocos.push(value);
    }
    return JSON.parse(Buffer.concat(blocos).toString("utf8"));
  } catch (erro) {
    if (erro instanceof ErroPedido) throw erro;
    throw new ErroPedido("Não conseguimos ler os dados do pedido. Tente novamente.", 400);
  } finally { leitor.releaseLock(); }
}

export async function POST(request: Request) {
  try {
    const origem = request.headers.get("origin");
    if (!origem || origem !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new ErroPedido("Abra o checkout no site da FAREJA para continuar.", 403);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") throw new ErroPedido("Formato do pedido inválido.", 415);
    const validacao = validarPedido(await lerCorpo(request));
    if (!validacao.ok) throw new ErroPedido(validacao.erro, 400);
    // Telefone normalizado limita notificações repetidas sem armazenar IP do tutor.
    await limitarPedidos(validacao.valor.cliente.whatsapp);
    const pedido = await criarPedido(validacao.valor);
    return Response.json({ ok: true, pedido }, { headers: cabecalhos });
  } catch (erro) {
    const conhecido = erro instanceof ErroPedido;
    return Response.json({ ok: false, erro: conhecido ? erro.message : "Não conseguimos confirmar seu pedido agora. Tente novamente; a mesma tentativa não cria um pedido duplicado." }, { status: conhecido ? erro.status : 503, headers: cabecalhos });
  }
}
