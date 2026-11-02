/**
 * Normalizes user-pasted image URLs (e.g. from Pexels, Unsplash, Google Drive)
 * into direct image file URLs that Next.js and browsers can load directly.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  let u = url.trim();

  // Pexels webpage URL: https://www.pexels.com/photo/...-37032417/ or https://www.pexels.com/photo/37032417/
  const pexelsMatch = u.match(/pexels\.com\/photo[s]?\/(?:[^\/]+-)?(\d+)/i);
  if (pexelsMatch) {
    const id = pexelsMatch[1];
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
  }

  // Google Drive sharing link: https://drive.google.com/file/d/ID/view...
  const gdriveMatch = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
  }

  // Dropbox shared link: ?dl=0 -> ?raw=1
  if (u.includes("dropbox.com") && u.includes("dl=0")) {
    return u.replace("dl=0", "raw=1");
  }

  return u;
}

