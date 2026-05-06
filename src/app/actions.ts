"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireProfile } from "@/lib/auth";
import { createMemberAccount, deleteMemberAccount, updateMemberProfile } from "@/lib/supabase/members";
import type {
  FeeType,
  PaymentStatus,
  ServicePriority,
  ServiceStatus,
  TeamType,
  UserRole,
} from "@/lib/supabase/types";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function amount(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function dateTime(value: string | null) {
  return value ? new Date(value).toISOString() : null;
}

export async function createServiceAction(formData: FormData) {
  const { supabase, user, profile } = await requireProfile();
  const feeType = (text(formData, "fee_type") ?? "free") as FeeType;
  const status: ServiceStatus =
    feeType === "paid" ? "awaiting_approval" : "pending";
  const memberId =
    profile.role === "admin" ? (text(formData, "member_id") ?? user.id) : user.id;

  const { data, error } = await supabase
    .from("services")
    .insert({
      customer_name: text(formData, "customer_name") ?? "",
      customer_phone: text(formData, "customer_phone") ?? "",
      address: text(formData, "address") ?? "",
      district: text(formData, "district"),
      site_id: text(formData, "site_id") ?? "",
      project_name: text(formData, "project_name"),
      product_group_id: text(formData, "product_group_id"),
      service_type_id: text(formData, "service_type_id"),
      member_id: memberId,
      priority: (text(formData, "priority") ?? "normal") as ServicePriority,
      scheduled_at: dateTime(text(formData, "scheduled_at")),
      description: text(formData, "description"),
      status,
      team_type: (text(formData, "team_type") ?? "technical_team") as TeamType,
      subcontractor_id: text(formData, "subcontractor_id"),
      subcontractor_contact: text(formData, "subcontractor_contact"),
      subcontractor_phone: text(formData, "subcontractor_phone"),
      fee_type: feeType,
      amount: amount(formData, "amount"),
      currency: text(formData, "currency") ?? "TRY",
      payment_status: text(formData, "payment_status") as PaymentStatus | null,
      warranty_code: text(formData, "warranty_code"),
      warranty_expires_at: text(formData, "warranty_expires_at"),
      customer_approval_sent_at: feeType === "paid" ? new Date().toISOString() : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/${profile.role === "admin" ? "admin" : "member"}/services/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirect(`/${profile.role === "admin" ? "admin" : "member"}/services/${data.id}`);
}

export async function updateServiceAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;

  const { error } = await supabase
    .from("services")
    .update({
      customer_name: text(formData, "customer_name") ?? "",
      customer_phone: text(formData, "customer_phone") ?? "",
      address: text(formData, "address") ?? "",
      district: text(formData, "district"),
      site_id: text(formData, "site_id") ?? "",
      project_name: text(formData, "project_name"),
      product_group_id: text(formData, "product_group_id"),
      service_type_id: text(formData, "service_type_id"),
      member_id: text(formData, "member_id"),
      priority: (text(formData, "priority") ?? "normal") as ServicePriority,
      scheduled_at: dateTime(text(formData, "scheduled_at")),
      description: text(formData, "description"),
      status: (text(formData, "status") ?? "pending") as ServiceStatus,
      fee_type: (text(formData, "fee_type") ?? "free") as FeeType,
      amount: amount(formData, "amount"),
      currency: text(formData, "currency") ?? "TRY",
      payment_status: text(formData, "payment_status") as PaymentStatus | null,
      warranty_code: text(formData, "warranty_code"),
      warranty_expires_at: text(formData, "warranty_expires_at"),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/services/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/services/${id}`);
}

export async function updateServiceStatusAction(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = text(formData, "id");
  const status = text(formData, "status") as ServiceStatus | null;
  if (!id || !status) return;

  const patch: {
    status: ServiceStatus;
    started_at?: string;
    completed_at?: string;
    customer_approved_at?: string;
    customer_rejected_at?: string;
  } = { status };

  if (status === "in_progress") patch.started_at = new Date().toISOString();
  if (status === "completed") patch.completed_at = new Date().toISOString();
  if (status === "approved") patch.customer_approved_at = new Date().toISOString();
  if (status === "rejected") patch.customer_rejected_at = new Date().toISOString();

  const { error } = await supabase.from("services").update(patch).eq("id", id);
  if (error) return;

  revalidatePath(`/${profile.role === "admin" ? "admin" : "member"}/services/${id}`);
  revalidatePath(`/${profile.role === "admin" ? "admin" : "member"}`);
}

export async function deleteServiceAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin");
  redirect("/admin/services");
}

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  await createMemberAccount({
    email: text(formData, "email") ?? "",
    password: text(formData, "password") ?? "",
    fullName: text(formData, "full_name") ?? "",
    phone: text(formData, "phone") ?? undefined,
    role: (text(formData, "role") ?? "member") as UserRole,
  });
  revalidatePath("/admin/members");
}

export async function updateMemberAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await updateMemberProfile(id, {
    fullName: text(formData, "full_name") ?? undefined,
    phone: text(formData, "phone"),
    role: (text(formData, "role") ?? "member") as UserRole,
    isActive: bool(formData, "is_active"),
  });
  revalidatePath("/admin/members");
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  await deleteMemberAccount(id);
  revalidatePath("/admin/members");
}

export async function createProductGroupAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_groups").insert({ name: text(formData, "name") ?? "" });
  revalidatePath("/admin/settings");
}

export async function createServiceTypeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("service_types").insert({
    name: text(formData, "name") ?? "",
    product_group_id: text(formData, "product_group_id"),
  });
  revalidatePath("/admin/settings");
}

export async function createSubcontractorAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("subcontractors").insert({
    name: text(formData, "name") ?? "",
    contact_name: text(formData, "contact_name"),
    phone: text(formData, "phone"),
  });
  revalidatePath("/admin/settings");
}

export async function updatePhotoRulesAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("photo_rules")
    .update({
      require_start_photo: bool(formData, "require_start_photo"),
      require_end_photo: bool(formData, "require_end_photo"),
      camera_only: bool(formData, "camera_only"),
      gallery_upload_enabled: bool(formData, "gallery_upload_enabled"),
    })
    .eq("id", "00000000-0000-0000-0000-000000000001");
  revalidatePath("/admin/settings");
}

export async function togglePriorityAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const priority = text(formData, "priority") as ServicePriority | null;
  if (!priority) return;
  await supabase
    .from("priority_settings")
    .update({ is_active: bool(formData, "is_active") })
    .eq("priority", priority);
  revalidatePath("/admin/settings");
}
