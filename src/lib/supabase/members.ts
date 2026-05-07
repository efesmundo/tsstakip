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
    if (message.includes("DOCTYPE") || message.includes("not valid JSON") || message.includes("<")) {
      throw new Error(
        "Supabase Auth admin API'si HTML hata sayfası döndürdü. Bu genelde SUPABASE_SERVICE_ROLE_KEY veya NEXT_PUBLIC_SUPABASE_URL'in yanlış olduğunu gösterir. Vercel env vars'larını kontrol edin (boşluk veya tırnak olmamalı) ve yeniden deploy edin.",
      );
    }
    throw rawError;
  }

  const { data, error } = result;
  if (error) throw error;
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
