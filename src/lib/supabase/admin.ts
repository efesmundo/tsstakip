import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const supabaseSecretKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlı değil. Vercel env vars kontrol edin.",
    );
  }
  if (!supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil. Vercel env vars'a ekleyin ve yeniden deploy edin.",
    );
  }
  if (!supabaseSecretKey.startsWith("eyJ") && !supabaseSecretKey.startsWith("sb_secret_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY beklenen formatta değil (JWT veya sb_secret_ ile başlamalı). Yanlış key kopyalanmış olabilir.",
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
