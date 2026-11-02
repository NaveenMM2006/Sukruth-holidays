"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { normalizeImageUrl } from "@/lib/image";

/** next/image (lazy by default) with automatic URL normalization and graceful fallback. */
export default function SafeImage({ src, alt, className, ...rest }: Omit<ImageProps, "src"> & { src?: string }) {
  const normalizedSrc = normalizeImageUrl(src);
  const [stage, setStage] = useState<"optimized" | "unoptimized" | "failed">("optimized");

  useEffect(() => {
    setStage("optimized");
  }, [normalizedSrc]);

  if (!normalizedSrc || stage === "failed") {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-lagoon-light to-mist text-lagoon ${className || ""}`}
        role="img"
        aria-label={alt}
        style={rest.fill ? { position: "absolute", inset: 0 } : { width: rest.width, height: rest.height }}
      >
        <ImageOff aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      className={className}
      unoptimized={stage === "unoptimized" || rest.unoptimized}
      onError={() => {
        if (stage === "optimized") {
          setStage("unoptimized");
        } else {
          setStage("failed");
        }
      }}
      {...rest}
    />
  );
}
