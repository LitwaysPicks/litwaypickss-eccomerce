/**
 * Server-only Cloudinary utilities.
 * Never import this from a client component.
 *
 * Requires:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY          (server-only, no NEXT_PUBLIC_ prefix)
 *   CLOUDINARY_API_SECRET       (server-only, no NEXT_PUBLIC_ prefix)
 */
import { createHash } from "crypto";

/**
 * Extract the Cloudinary public_id from a delivery URL.
 *
 * Example URL (with transformation):
 *   https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/litway/products/shoe.jpg
 * → public_id: "litway/products/shoe"
 */
function extractPublicId(url) {
  try {
    const path = new URL(url).pathname;
    const uploadIdx = path.indexOf("/upload/");
    if (uploadIdx === -1) return null;

    const parts = path.slice(uploadIdx + 8).split("/");

    // Skip leading transformation segments.
    // Transformation segments contain commas (f_auto,q_auto) or
    // match the "key_value" pattern (w_1200, h_800).
    let i = 0;
    while (
      i < parts.length - 1 &&
      (/,/.test(parts[i]) || /^[a-z]+_/.test(parts[i]))
    ) {
      i++;
    }

    // Join remaining parts and strip the file extension
    return parts.slice(i).join("/").replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

async function destroyOne(publicId) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Cloudinary signature: SHA-1 of sorted "key=value" pairs + api_secret
  const paramString = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramString + apiSecret)
    .digest("hex");

  const fd = new FormData();
  fd.append("public_id", publicId);
  fd.append("timestamp", timestamp);
  fd.append("api_key", apiKey);
  fd.append("signature", signature);

  await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: fd },
  );
}

/**
 * Delete all Cloudinary images by their delivery URLs.
 * Runs deletions in parallel and silently ignores individual failures.
 */
export async function deleteCloudinaryImages(urls = []) {
  const publicIds = urls.map(extractPublicId).filter(Boolean);
  await Promise.allSettled(publicIds.map(destroyOne));
}
