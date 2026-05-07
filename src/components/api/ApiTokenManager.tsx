"use client";

import { Check, Copy, Eye, EyeOff, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

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
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [didCopy, setDidCopy] = useState(false);
  const initialState: TokenActionState = { tokenInfo: initialTokenInfo };
  const [state, formAction, isPending] = useActionState(
    manageApiTokenAction,
    initialState,
  );
  const tokenInfo = state.tokenInfo ?? null;
  const maskedToken = state.token ? "•".repeat(Math.min(state.token.length, 48)) : "";

  async function copyToken() {
    if (!state.token) return;
    await navigator.clipboard.writeText(state.token);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1800);
  }

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
          <div className="mt-2 flex flex-col gap-2 rounded-lg border border-accent/25 bg-accent-surface p-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground">
              {isTokenVisible ? state.token : maskedToken}
            </code>
            <div className="flex gap-2">
              <button
                aria-label={isTokenVisible ? "Tokenı gizle" : "Tokenı göster"}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 text-sm font-medium transition hover:border-accent/40 hover:text-accent"
                onClick={() => setIsTokenVisible((current) => !current)}
                type="button"
              >
                {isTokenVisible ? (
                  <EyeOff size={15} aria-hidden="true" />
                ) : (
                  <Eye size={15} aria-hidden="true" />
                )}
                {isTokenVisible ? "Gizle" : "Göster"}
              </button>
              <button
                aria-label="Tokenı kopyala"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                onClick={copyToken}
                type="button"
              >
                {didCopy ? (
                  <Check size={15} aria-hidden="true" />
                ) : (
                  <Copy size={15} aria-hidden="true" />
                )}
                {didCopy ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>
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
