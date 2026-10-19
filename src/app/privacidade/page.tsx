import type { Metadata } from "next";
import { PaginaTexto } from "@/components/PaginaTexto";

export const metadata: Metadata = { title: "Privacidade" };

export default function Privacidade() {
  return (
    <PaginaTexto titulo="Privacidade">
      <p>
        Esta página explica, de forma direta, quais dados a FAREJA coleta na avaliação e no app do tutor e o que fazemos
        com eles, conforme a Lei Geral de Proteção de Dados (LGPD).
      </p>
      <h2>O que coletamos</h2>
      <p>
        Na avaliação: seu nome, seu WhatsApp e as respostas sobre o seu pet (espécie, porte, fase, rotina e queixa
        principal). No app: os check-ins e marcações que você registra.
      </p>
      <h2>Para que usamos</h2>
      <p>
        Para montar o perfil do pet, escolher o box, falar com você pelo WhatsApp sobre o resultado e o acompanhamento, e
        entregar a sua assinatura. Não vendemos seus dados.
      </p>
      <h2>Onde ficam</h2>
      <p>
        O perfil do pet, os check-ins e o histórico do app ficam salvos no seu próprio aparelho. O seu link de acesso
        carrega os dados do perfil dentro do próprio endereço: trate ele como pessoal e não compartilhe.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, e pode parar de receber
        mensagens quando quiser. É só pedir pelo nosso WhatsApp.
      </p>
    </PaginaTexto>
  );
}
