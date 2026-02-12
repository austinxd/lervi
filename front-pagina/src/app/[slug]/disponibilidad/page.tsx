import type { Metadata } from "next";
import AvailabilityClient from "./AvailabilityClient";

export const metadata: Metadata = {
  title: "Disponibilidad",
  description: "Busque disponibilidad y precios para su estadia.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AvailabilityPage({ params }: Props) {
  const { slug } = await params;
  return <AvailabilityClient slug={slug} />;
}
