import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/api";
import { resolveThemeVariables, resolveTemplateKey } from "@/lib/theme-resolver";
import { TEMPLATES } from "@/lib/themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await getProperty(slug);
    return {
      title: { default: property.name, template: `%s | ${property.name}` },
      description: `${property.name} - ${property.city}. Reserve directamente al mejor precio.`,
      openGraph: {
        siteName: property.name,
        locale: "es_PE",
        type: "website",
      },
    };
  } catch {
    return { title: "Hotel" };
  }
}

export default async function HotelLayout({ params, children }: Props) {
  const { slug } = await params;

  // Reject slugs that look like file requests (e.g. favicon.ico)
  if (slug.includes(".")) {
    notFound();
  }

  let property;
  try {
    property = await getProperty(slug);
  } catch {
    notFound();
  }

  const templateKey = resolveTemplateKey(property.theme_template);
  const template = TEMPLATES[templateKey] || TEMPLATES.signature;
  const cssVars = resolveThemeVariables(property);

  return (
    <div
      style={cssVars}
      data-template={templateKey}
      className="min-h-screen flex flex-col bg-sand-50"
    >
      <link href={template.googleFontsUrl} rel="stylesheet" />
      <Header propertyName={property.name} logo={property.logo} template={templateKey} slug={slug} />
      <main className="flex-1">{children}</main>
      <Footer property={property} />
    </div>
  );
}
