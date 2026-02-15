import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganizationInfo } from "@/lib/api";
import { resolveThemeVariables, resolveTemplateKey } from "@/lib/theme-resolver";
import { TEMPLATES } from "@/lib/themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventInit from "@/components/EventInit";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const org = await getOrganizationInfo(slug);
    return {
      title: { default: org.name, template: `%s | ${org.name}` },
      description: `${org.name} - Reserve directamente al mejor precio.`,
      openGraph: {
        siteName: org.name,
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

  let org;
  try {
    org = await getOrganizationInfo(slug);
  } catch {
    notFound();
  }

  const templateKey = resolveTemplateKey(org.theme_template);
  const template = TEMPLATES[templateKey] || TEMPLATES.signature;
  const cssVars = resolveThemeVariables(org);

  return (
    <div
      style={cssVars}
      data-template={templateKey}
      className={`min-h-screen flex flex-col ${templateKey === "premium" ? "bg-white" : "bg-sand-50"}`}
    >
      <link href={template.googleFontsUrl} rel="stylesheet" />
      <EventInit slug={slug} />
      <Header propertyName={org.name} logo={org.logo} template={templateKey} slug={slug} />
      <main className="flex-1">{children}</main>
      <Footer org={org} template={templateKey} />
    </div>
  );
}
