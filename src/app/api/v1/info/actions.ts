"use server";

import { revalidatePath } from "next/cache";

import {
  deleteServiceStatusToken,
  generateServiceStatusToken,
  getServiceStatusTokenInfo,
  type ApiTokenInfo,
} from "@/lib/api-tokens";
import { requireAdmin } from "@/lib/auth";

export type TokenActionState = {
  error?: string;
  message?: string;
  token?: string;
  tokenInfo?: ApiTokenInfo | null;
};

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function manageApiTokenAction(
  _state: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  const { user } = await requireAdmin();
  const intent = formData.get("intent");

  try {
    if (intent === "delete") {
      await deleteServiceStatusToken();
      revalidatePath("/api/v1/info");
      return {
        message: "Bearer token silindi. API yeni token üretilene kadar authenticate olmayacak.",
        tokenInfo: null,
      };
    }

    const { token, info } = await generateServiceStatusToken(user.id);
    revalidatePath("/api/v1/info");
    return {
      message: "Yeni bearer token üretildi. Bu değeri şimdi kaydedin; tekrar gösterilmeyecek.",
      token,
      tokenInfo: info,
    };
  } catch (error) {
    return {
      error: formatError(error),
      tokenInfo: await getServiceStatusTokenInfo().catch(() => null),
    };
  }
}
