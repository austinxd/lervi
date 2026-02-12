import type { Metadata } from "next";
import ReservationsClient from "./ReservationsClient";

export const metadata: Metadata = {
  title: "Mis Reservas",
  description: "Consulte el estado de sus reservas.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReservationsPage({ params }: Props) {
  const { slug } = await params;
  return <ReservationsClient slug={slug} />;
}
