// Client-side "unsigned" upload helper for Cloudinary.
// No server round-trip needed — the browser uploads the file directly to
// Cloudinary using a public cloud name + an "unsigned" upload preset (safe to
// expose; it only allows uploads, nothing destructive).
//
// Env vars required (set in Vercel + .env.local):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a File/Blob to Cloudinary and returns its permanent HTTPS URL.
 * @param {File} file
 * @param {"image"|"video"} resourceType
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<string>} secure_url
 */
export function uploadToCloudinary(file, resourceType = "image", onProgress) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error("Upload isn't configured yet (missing Cloudinary env vars). Please paste a URL instead.")
    );
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url);
        } else {
          reject(new Error(res?.error?.message || "Upload failed. Please try again."));
        }
      } catch {
        reject(new Error("Upload failed. Please try again."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed — check your internet connection."));
    xhr.send(formData);
  });
}
