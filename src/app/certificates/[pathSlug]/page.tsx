import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { CertificateClient } from "@/components/certificate-client";

export function generateStaticParams() {
  return buildCurriculumIndex().paths.map((p) => ({ pathSlug: p.slug }));
}

interface PageProps {
  params: Promise<{ pathSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pathSlug } = await params;
  const path = buildCurriculumIndex().paths.find((p) => p.slug === pathSlug);
  return {
    title: path ? `${path.title} Certificate — Learn Everything` : "Certificate — Learn Everything",
  };
}

export default async function CertificatePage({ params }: PageProps) {
  const { pathSlug } = await params;
  const index = buildCurriculumIndex();
  const path = index.paths.find((p) => p.slug === pathSlug);
  if (!path || path.taskSlugs.length === 0) notFound();

  return (
    <CertificateClient
      pathSlug={path.slug}
      pathTitle={path.title}
      role={path.role}
      taskSlugs={path.taskSlugs}
    />
  );
}
