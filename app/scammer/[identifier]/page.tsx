import { Metadata } from "next";
import ScammerProfileClient from "./client";

interface Props {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifier } = await params;
  const decodedIdentifier = decodeURIComponent(identifier);

  return {
    title: `${decodedIdentifier} - SCAMBOARD`,
    description: `Community reports and confirms for ${decodedIdentifier} on SCAMBOARD.`,
    openGraph: {
      title: `SCAMBOARD: ${decodedIdentifier}`,
      description: `This account has been reported as a scammer by the community.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `SCAMBOARD: ${decodedIdentifier}`,
      description: `This account has been reported as a scammer by the community.`,
    },
  };
}

export default async function ScammerProfilePage({ params }: Props) {
  const { identifier } = await params;
  return <ScammerProfileClient identifier={decodeURIComponent(identifier)} />;
}
