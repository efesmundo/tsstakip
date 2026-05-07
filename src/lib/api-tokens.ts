import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const SERVICE_STATUS_TOKEN_ID = "service-status";

export type ApiTokenInfo = {
  tokenPreview: string;
  createdAt: string;
  updatedAt: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function compareHashes(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export async function getServiceStatusTokenInfo(): Promise<ApiTokenInfo | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("api_tokens")
    .select("token_preview,created_at,updated_at")
    .eq("id", SERVICE_STATUS_TOKEN_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return {
    tokenPreview: data.token_preview,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function generateServiceStatusToken(createdBy: string) {
  const token = `tss_${randomBytes(32).toString("base64url")}`;
  const tokenPreview = `...${token.slice(-8)}`;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("api_tokens")
    .upsert(
      {
        id: SERVICE_STATUS_TOKEN_ID,
        name: "Service status callback",
        token_hash: hashToken(token),
        token_preview: tokenPreview,
        created_by: createdBy,
      },
      { onConflict: "id" },
    )
    .select("token_preview,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    token,
    info: {
      tokenPreview: data.token_preview,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function deleteServiceStatusToken() {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("api_tokens")
    .delete()
    .eq("id", SERVICE_STATUS_TOKEN_ID);

  if (error) {
    throw error;
  }
}

export async function validateServiceStatusBearer(token: string | null) {
  if (!token) return false;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("api_tokens")
    .select("token_hash")
    .eq("id", SERVICE_STATUS_TOKEN_ID)
    .maybeSingle();

  if (error || !data) return false;

  return compareHashes(hashToken(token), data.token_hash);
}
