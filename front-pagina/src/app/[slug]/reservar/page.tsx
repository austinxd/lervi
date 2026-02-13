import type { Metadata } from "next";
import { getOrganizationInfo } from "@/lib/api";
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
  const org = await getOrganizationInfo(slug);
  const defaultCountry = org.properties?.[0]?.country || "PE";
  return <BookingClient slug={slug} defaultCountry={defaultCountry} />;
}
