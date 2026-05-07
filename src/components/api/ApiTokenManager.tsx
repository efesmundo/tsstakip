"use client";

import { KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { useActionState } from "react";

import {
  manageApiTokenAction,
  type TokenActionState,
} from "@/app/api/v1/info/actions";
import type { ApiTokenInfo } from "@/lib/api-tokens";
import { formatDateTime } from "@/lib/labels";

type ApiTokenManagerProps = {
  initialTokenInfo: ApiTokenInfo | null;
};

export function ApiTokenManager({ initialTokenInfo }: ApiTokenManagerProps) {
  const initialState: TokenActionState = { tokenInfo: initialTokenInfo };
  const [state, formAction, isPending] = useActionState(
    manageApiTokenAction,
    initialState,
  );
  const tokenInfo = state.tokenInfo ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-surface text-accent">
          <KeyRound size={17} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {tokenInfo ? `Aktif token: ${tokenInfo.tokenPreview}` : "Aktif token yok"}
          </p>
          <p className="mt-1 text-sm text-foreground/65">
            {tokenInfo
              ? `Son güncelleme: ${formatDateTime(tokenInfo.updatedAt)}`
              : "Token olmadan durum callback API authenticate olmaz."}
          </p>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-lg border border-danger/25 bg-danger/8 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      {state.message ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      {state.token ? (
        <div>
          <p className="text-sm font-semibold text-foreground">Yeni token</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-accent/25 bg-accent-surface p-3 text-sm text-foreground">
            <code>{state.token}</code>
          </pre>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <form action={formAction}>
          <input name="intent" type="hidden" value="generate" />
          <button
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            <RefreshCw size={15} aria-hidden="true" />
            {tokenInfo ? "Yeniden Üret" : "Token Üret"}
          </button>
        </form>
        <form action={formAction}>
          <input name="intent" type="hidden" value="delete" />
          <button
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/8 px-4 text-sm font-semibold text-danger transition hover:bg-danger/15 disabled:opacity-60"
            disabled={!tokenInfo || isPending}
            type="submit"
          >
            <Trash2 size={15} aria-hidden="true" />
            Sil
          </button>
        </form>
      </div>
    </div>
  );
}
