import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

function normalizeUrl(raw: string): string {
  let url = raw.trim().replace(/^"|"$/g, "").replace(/\/$/, "");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

export function getSupabaseAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlı değil. Vercel env vars kontrol edin.",
    );
  }
  if (!rawKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil. Vercel env vars'a ekleyin ve yeniden deploy edin.",
    );
  }

  const supabaseUrl = normalizeUrl(rawUrl);
  const supabaseSecretKey = rawKey.trim().replace(/^"|"$/g, "");

  if (!supabaseSecretKey.startsWith("eyJ") && !supabaseSecretKey.startsWith("sb_secret_")) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY beklenen formatta değil (uzunluk: ${supabaseSecretKey.length}, ilk 6 karakter: "${supabaseSecretKey.slice(0, 6)}"). JWT (eyJ ile başlar) veya sb_secret_ formatında olmalı.`,
    );
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
