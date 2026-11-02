"use client";

import { useState } from "react";
import { Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { normalizeImageUrl } from "@/lib/image";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Image field. Two ways to add a picture:
 *  1. Paste any image link (Unsplash, Pexels, Imgur, Google Drive, Cloudinary ...)
 *  2. Upload a file straight to Cloudinary (if NEXT_PUBLIC_CLOUDINARY_* env vars set)
 * Direct URLs are stored in the database.
 */
export default function ImageUploader({
  value,
  onChange,
  multiple = true,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = (url: string) => {
    const normalized = normalizeImageUrl(url);
    if (!normalized) return;
    onChange(multiple ? [...value, normalized] : [normalized]);
  };

  function addLink(rawUrl?: string) {
    const toAdd = typeof rawUrl === "string" ? rawUrl : link;
    const u = toAdd.trim();
    if (!u) return;
    if (!/^https?:\/\/.+/i.test(u)) return setError("Enter a link that starts with https://");
    setError("");
    add(u);
    setLink("");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is larger than 8 MB`);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", PRESET!);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");
        urls.push(data.secure_url);
        if (!multiple) break;
      }
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((u, i) => (
            <li key={u + i} className="group relative h-20 w-28 overflow-hidden rounded-xl bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(u)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230C2B3D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='2' y1='2' x2='22' y2='22'/%3E%3Cpath d='M10.41 10.41a2 2 0 1 1-2.83-2.83'/%3E%3Cline x1='13.5' y1='13.5' x2='6' y2='21'/%3E%3Cpath d='M18 12l-3-3-2.5 2.5'/%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3C/svg%3E";
                }}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Remove image"
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-white"
              >
                <Trash2 size={14} />
              </button>
              {i === 0 && multiple && (
                <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 text-[10px] text-white">Cover</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Paste image link (Pexels, Unsplash, Google Drive...)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text")?.trim();
            if (pasted && /^https?:\/\/.+/i.test(pasted)) {
              e.preventDefault();
              addLink(pasted);
            }
          }}
          onBlur={() => {
            if (link.trim() && /^https?:\/\/.+/i.test(link.trim())) {
              addLink();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
          aria-label="Image link"
        />
        <button type="button" onClick={() => addLink()} className="btn-dark !px-4 !py-2">
          <Plus size={16} aria-hidden /> Add
        </button>
      </div>

      <p className="text-xs text-ink/60">
        Pasting directly works! (Pexels links, Unsplash links, or right-click any image &gt; “Copy Image Address”)
      </p>

      {CLOUD && PRESET ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-lagoon-dark hover:underline">
          {busy ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} aria-hidden />}
          {busy ? "Uploading…" : "or upload from this device"}
          <input type="file" accept="image/*" multiple={multiple} className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
        </label>
      ) : (
        <p className="text-xs text-ink/50">
          Tip: add Cloudinary keys in .env to upload files from your device.
        </p>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
