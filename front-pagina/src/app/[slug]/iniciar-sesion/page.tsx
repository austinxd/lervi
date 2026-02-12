import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicie sesión con su documento para ver sus reservas.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { slug } = await params;
  return <LoginClient slug={slug} />;
}
