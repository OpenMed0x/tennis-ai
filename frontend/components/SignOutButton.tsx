"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "./LocaleProvider";

export default function SignOutButton() {
  const router = useRouter();
  const t = useT();
  return (
    <button
      className="p-2 text-sm text-ink/80 underline-offset-2 hover:text-ink hover:underline"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {t("signOut")}
    </button>
  );
}
