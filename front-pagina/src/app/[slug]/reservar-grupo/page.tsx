import type { Metadata } from "next";
import { getOrganizationInfo } from "@/lib/api";
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
  const org = await getOrganizationInfo(slug);
  const defaultCountry = org.properties?.[0]?.country || "PE";
  return <GroupBookingClient slug={slug} defaultCountry={defaultCountry} />;
}
