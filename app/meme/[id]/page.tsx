"use client";

import { use } from "react";
import Navigation from "@/components/Navigation";
import MemeEditor from "@/components/MemeEditor";
import { useRouter } from "next/navigation";

export default function MemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const handleSave = () => {
    router.push("/gallery");
  };

  return (
    <>
      <Navigation />
      <MemeEditor memeId={id} onSave={handleSave} />
    </>
  );
}
