import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import LessonView from "./lesson-view";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!lesson) notFound();

  return <LessonView lesson={lesson} />;
}