import type { Metadata } from "next";
import BookingClient from "./BookingClient";

export const metadata: Metadata = {
  title: "Completar reserva",
  description: "Complete su reserva y reciba su codigo de confirmacion.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params;
  return <BookingClient slug={slug} />;
}
