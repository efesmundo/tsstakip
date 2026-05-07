"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel = "Kaydediliyor...",
  className = "h-12 rounded-md bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  );
}
