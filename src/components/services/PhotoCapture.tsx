"use client";

import { Camera, ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PhotoType } from "@/lib/supabase/types";

type PhotoCaptureProps = {
  serviceId: string;
  photoType: PhotoType;
  label: string;
  galleryEnabled?: boolean;
};

export function PhotoCapture({
  serviceId,
  photoType,
  label,
  galleryEnabled = true,
}: PhotoCaptureProps) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setMessage(null);
    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Oturum bulunamadı.");
        return;
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const storagePath = `services/${serviceId}/${photoType}-${Date.now()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("service-photos")
        .upload(storagePath, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("service_photos").insert({
        service_id: serviceId,
        photo_type: photoType,
        storage_path: storagePath,
        uploaded_by: user.id,
        taken_at: new Date().toISOString(),
      });

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-2">
          <input
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
            ref={cameraInputRef}
            type="file"
          />
          {galleryEnabled ? (
            <input
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = "";
              }}
              ref={galleryInputRef}
              type="file"
            />
          ) : null}
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition active:scale-95 hover:bg-accent-strong disabled:opacity-60"
            disabled={isUploading}
            onClick={() => cameraInputRef.current?.click()}
            type="button"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={15} aria-hidden="true" />
            ) : (
              <Camera size={15} aria-hidden="true" />
            )}
            Kamera
          </button>
          {galleryEnabled ? (
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 text-sm font-medium transition active:scale-95 hover:border-accent/40 hover:text-accent disabled:opacity-60"
              disabled={isUploading}
              onClick={() => galleryInputRef.current?.click()}
              type="button"
            >
              <ImageIcon size={15} aria-hidden="true" />
              Galeri
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
