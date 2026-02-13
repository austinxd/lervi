import type { Metadata } from "next";
import { getOrganizationInfo } from "@/lib/api";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Iniciar sesion",
  description: "Inicie sesion o cree su cuenta.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { slug } = await params;
  const org = await getOrganizationInfo(slug);
  const defaultCountry = org.properties?.[0]?.country || "PE";
  return <LoginClient slug={slug} defaultCountry={defaultCountry} />;
}
