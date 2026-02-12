import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Pago de reserva",
  description: "Suba su comprobante de pago para confirmar su reserva.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PaymentPage({ params }: Props) {
  const { slug } = await params;
  return <PaymentClient slug={slug} />;
}
