"use client";

import { Camera, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PhotoType } from "@/lib/supabase/types";

type PhotoCaptureProps = {
  serviceId: string;
  photoType: PhotoType;
  label: string;
};

export function PhotoCapture({ serviceId, photoType, label }: PhotoCaptureProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function openCamera() {
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setIsOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setMessage("Kamera açılamadı. Tarayıcı izinlerini kontrol edin.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsOpen(false);
  }

  async function capture() {
    if (!videoRef.current) return;
    setIsUploading(true);
    setMessage(null);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.88);
    });

    if (!blob) {
      setMessage("Fotoğraf oluşturulamadı.");
      setIsUploading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Oturum bulunamadı.");
      setIsUploading(false);
      return;
    }

    const storagePath = `services/${serviceId}/${photoType}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("service-photos")
      .upload(storagePath, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setIsUploading(false);
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
      setIsUploading(false);
      return;
    }

    closeCamera();
    setIsUploading(false);
    router.refresh();
  }

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-white"
          onClick={isOpen ? closeCamera : openCamera}
          type="button"
        >
          {isOpen ? <X size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
          {isOpen ? "Kapat" : "Kamera"}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-3 space-y-3">
          <video
            autoPlay
            className="aspect-video w-full rounded-md bg-black object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium"
            disabled={isUploading}
            onClick={capture}
            type="button"
          >
            <Square size={15} aria-hidden="true" />
            {isUploading ? "Yükleniyor..." : "Fotoğraf Çek"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
