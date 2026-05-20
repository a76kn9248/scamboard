import { Metadata } from "next";
import UserProfileClient from "./client";

interface Props {
  params: Promise<{ nickname: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;

  return {
    title: `@${nickname} - SCAMBOARD`,
    description: `View ${nickname}'s profile on SCAMBOARD.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { nickname } = await params;
  return <UserProfileClient nickname={nickname} />;
}
