import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { COOKIE_OPTIONS } from "./config";

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: COOKIE_OPTIONS,
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // 在 Server Component 中调用时忽略，middleware 会刷新会话
          }
        },
      },
    }
  );
}
