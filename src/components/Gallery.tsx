"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

/** Main image + thumbnails. Only the first image loads eagerly; thumbnails are lazy. */
export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [""];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
        <SafeImage
          key={list[active]}
          src={list[active]}
          alt={`${title}, photo ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      {list.length > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="More photos">
          {list.map((src, i) => (
            <li key={src + i} className="shrink-0">
              <button
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl ring-offset-2 ${i === active ? "ring-2 ring-lagoon" : "opacity-75 hover:opacity-100"}`}
              >
                <SafeImage src={src} alt="" fill sizes="96px" loading="lazy" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
