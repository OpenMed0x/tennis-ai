import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 邮箱验证链接点击后回到这里，换取会话
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const raw = searchParams.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/nutrition";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=验证失败，请重试`);
}
