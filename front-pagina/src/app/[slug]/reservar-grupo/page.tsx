import type { Metadata } from "next";
import GroupBookingClient from "./GroupBookingClient";

export const metadata: Metadata = {
  title: "Reserva grupal",
  description: "Complete su reserva grupal con multiples habitaciones.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GroupBookingPage({ params }: Props) {
  const { slug } = await params;
  return <GroupBookingClient slug={slug} />;
}
