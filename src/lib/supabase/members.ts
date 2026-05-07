import "server-only";

import { getSupabaseAdminClient } from "./admin";
import type { UserRole } from "./types";

type CreateMemberInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
};

type UpdateMemberInput = {
  fullName?: string;
  phone?: string | null;
  role?: UserRole;
  isActive?: boolean;
};

function isHtmlResponseError(message: string): boolean {
  return (
    message.includes("DOCTYPE") ||
    message.includes("not valid JSON") ||
    message.includes("Unexpected token '<'") ||
    message.includes("<html")
  );
}

const HTML_ERROR_HINT =
  "Supabase Auth admin API'si JSON yerine HTML döndürdü. Sebepler: " +
  "(1) SUPABASE_SERVICE_ROLE_KEY yanlış kopyalanmış (anon key ile karıştırılmış olabilir), " +
  "(2) NEXT_PUBLIC_SUPABASE_URL hatalı, " +
  "(3) Supabase projesi pause durumunda (free tier 1 hafta inaktiflik sonrası pause olur) — Supabase Dashboard'dan 'Restore project' tuşu ile uyandırın, " +
  "(4) Vercel'e env eklendi ama redeploy yapılmadı.";

export async function createMemberAccount(input: CreateMemberInput) {
  const supabase = getSupabaseAdminClient();
  const role = input.role ?? "member";

  let result;
  try {
    result = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        phone: input.phone,
        role,
      },
    });
  } catch (rawError) {
    const message = rawError instanceof Error ? rawError.message : String(rawError);
    if (isHtmlResponseError(message)) {
      throw new Error(HTML_ERROR_HINT);
    }
    throw rawError;
  }

  const { data, error } = result;
  if (error) {
    if (isHtmlResponseError(error.message)) {
      throw new Error(HTML_ERROR_HINT);
    }
    throw error;
  }
  if (!data.user) throw new Error("Auth API kullanıcı döndürmedi.");

  const userId = data.user.id;
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: input.fullName,
    phone: input.phone ?? null,
    role,
    is_active: true,
  });

  if (profileError) {
    throw profileError;
  }

  return data.user;
}

export async function updateMemberProfile(userId: string, input: UpdateMemberInput) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteMemberAccount(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }
}
