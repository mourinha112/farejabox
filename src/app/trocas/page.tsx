import type { Metadata } from "next";
import { PaginaTexto } from "@/components/PaginaTexto";

export const metadata: Metadata = { title: "Trocas e cancelamento" };

export default function Trocas() {
  return (
    <PaginaTexto titulo="Trocas e cancelamento">
      <h2>Cancelamento</h2>
      <p>
        Você pode cancelar a assinatura quando quiser, <strong>sem multa</strong>. Avise pelo WhatsApp antes da próxima
        cobrança e nenhuma caixa nova é gerada.
      </p>
      <h2>Arrependimento</h2>
      <p>
        Em compras pela internet você tem <strong>7 dias corridos</strong> a partir do recebimento para desistir, como
        prevê o Código de Defesa do Consumidor. Fale com a gente e combinamos a devolução e o reembolso.
      </p>
      <h2>Caixa com problema</h2>
      <p>
        Chegou avariada, com item faltando ou fora da validade? Mande uma foto pelo WhatsApp e a gente resolve com
        reenvio ou reembolso.
      </p>
      <h2>Seu pet não se adaptou</h2>
      <p>
        Conte no app ou no WhatsApp o que ele não curtiu. A próxima caixa é ajustada. Se notar qualquer reação, suspenda
        o uso e procure um veterinário.
      </p>
    </PaginaTexto>
  );
}
