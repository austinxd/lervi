import type { Metadata } from "next";
import ReservationDetailClient from "./ReservationDetailClient";

export const metadata: Metadata = {
  title: "Detalle de Reserva",
  description: "Detalle y estado de su reserva.",
};

interface Props {
  params: Promise<{ slug: string; code: string }>;
}

export default async function ReservationDetailPage({ params }: Props) {
  const { slug, code } = await params;
  return <ReservationDetailClient slug={slug} code={code} />;
}
