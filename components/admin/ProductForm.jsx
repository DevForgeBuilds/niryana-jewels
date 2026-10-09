"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "@/store/toastStore";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

function UploadSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14.5v1a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5v-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const EMPTY = {
  name: "",
  category: "rings",
  price: "",
  metal: "",
  stone: "",
  certification: "",
  description: "",
  stock_quantity: 10,
  images: [""],
  video: "",
  variants: [],
};

export default function ProductForm({ initial, productId }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  // Full per-size/length inventory tracking: when on, `form.variants` (an array of
  // {label, stock_quantity}) drives stock instead of the single stock_quantity field.
  const [useVariants, setUseVariants] = useState(Boolean(initial?.variants?.length));
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const categoriesRaw = useAdminStore((s) => s.categories);
  // Keep the dropdown alphabetical regardless of admin-list insertion order.
  const categories = [...categoriesRaw].sort((a, b) => a.name.localeCompare(b.name));
  const router = useRouter();

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageChange(idx, value) {
    const images = [...form.images];
    images[idx] = value;
    setForm((f) => ({ ...f, images }));
  }

  function addImageField() {
    setForm((f) => ({ ...f, images: [...f.images, ""] }));
  }

  function handleVariantChange(idx, field, value) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...f, variants };
    });
  }

  function addVariantRow() {
    setForm((f) => ({ ...f, variants: [...f.variants, { label: "", stock_quantity: 0 }] }));
  }

  function removeVariantRow(idx) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  }

  const [saving, setSaving] = useState(false);
  const [uploadingImageIdx, setUploadingImageIdx] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageFileInputs = useRef({});
  const videoFileInput = useRef(null);

  async function handleImageFileSelected(idx, file) {
    if (!file) return;
    setUploadingImageIdx(idx);
    try {
      const url = await uploadToCloudinary(file, "image");
      handleImageChange(idx, url);
      toast("Image uploaded.", "success");
    } catch (err) {
      toast(err.message || "Upload failed. Please try again.", "error");
    } finally {
      setUploadingImageIdx(null);
    }
  }

  async function handleVideoFileSelected(file) {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadToCloudinary(file, "video");
      handleChange("video", url);
      toast("Video uploaded.", "success");
    } catch (err) {
      toast(err.message || "Upload failed. Please try again.", "error");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanedVariants = form.variants
      .map((v) => ({ label: String(v.label || "").trim(), stock_quantity: Number(v.stock_quantity) || 0 }))
      .filter((v) => v.label);

    if (useVariants && !cleanedVariants.length) {
      toast("Add at least one size/length with a label before saving.", "error");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      images: form.images.filter(Boolean),
      // Sending an empty array (vs omitting the field) tells the backend to clear
      // any existing variants and fall back to the plain stock_quantity above.
      variants: useVariants ? cleanedVariants : [],
    };
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await addProduct(payload);
      }
      router.push("/admin/products");
    } catch (err) {
      toast(`Failed to save product: ${err.message}`, "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-4">
      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Product Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Category</label>
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Price (₹)</label>
          <input
            required
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Metal Type</label>
          <input
            value={form.metal}
            onChange={(e) => handleChange("metal", e.target.value)}
            placeholder="e.g. 925 Sterling Silver"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Stone Details</label>
          <input
            value={form.stone}
            onChange={(e) => handleChange("stone", e.target.value)}
            placeholder="e.g. White CZ"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Certification</label>
          <input
            value={form.certification}
            onChange={(e) => handleChange("certification", e.target.value)}
            placeholder="e.g. BIS 925 Hallmark"
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-charcoal/50">Stock Quantity</label>
          <input
            type="number"
            disabled={useVariants}
            value={useVariants ? form.variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0) : form.stock_quantity}
            onChange={(e) => handleChange("stock_quantity", e.target.value)}
            className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1 disabled:bg-cream-soft disabled:text-charcoal/50"
          />
          {useVariants && <p className="text-xs text-charcoal/40 mt-1">Auto-calculated from sizes below.</p>}
        </div>
      </div>

      <div className="border border-forest/15 rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useVariants}
            onChange={(e) => {
              const checked = e.target.checked;
              setUseVariants(checked);
              if (checked && form.variants.length === 0) {
                setForm((f) => ({ ...f, variants: [{ label: "", stock_quantity: 0 }] }));
              }
            }}
            className="w-4 h-4 accent-forest"
          />
          <span className="text-sm text-forest font-medium">
            This product comes in multiple sizes / lengths (e.g. ring sizes, chain lengths)
          </span>
        </label>

        {useVariants && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs uppercase tracking-widest text-charcoal/50">
              <span>Size / Length Label</span>
              <span>Stock Quantity</span>
              <span />
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={v.label}
                  onChange={(e) => handleVariantChange(i, "label", e.target.value)}
                  placeholder="e.g. 16 or 18 inch"
                  className="border border-forest/20 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={v.stock_quantity}
                  onChange={(e) => handleVariantChange(i, "stock_quantity", e.target.value)}
                  className="border border-forest/20 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVariantRow(i)}
                  title="Remove this size"
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariantRow} className="text-xs text-gold hover:underline">
              + Add another size
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full border border-forest/20 rounded-lg px-4 py-2.5 mt-1"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">
          Image URLs (GitHub raw / jsDelivr links)
        </label>
        {form.images.map((img, i) => (
          <div key={i} className="flex items-center gap-2 mt-1">
            <input
              value={img}
              onChange={(e) => handleImageChange(i, e.target.value)}
              placeholder="Paste a link, or click Upload →"
              className="flex-1 border border-forest/20 rounded-lg px-4 py-2.5"
            />
            <input
              ref={(el) => (imageFileInputs.current[i] = el)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleImageFileSelected(i, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => imageFileInputs.current[i]?.click()}
              disabled={uploadingImageIdx === i}
              title="Upload an image from your device"
              className="shrink-0 flex items-center gap-1.5 border border-forest/20 text-forest text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg hover:bg-forest hover:text-cream transition-colors disabled:opacity-60"
            >
              {uploadingImageIdx === i ? <UploadSpinner /> : <UploadIcon className="w-4 h-4" />}
              {uploadingImageIdx === i ? "Uploading…" : "Upload"}
            </button>
            {img && (
              <img
                src={img}
                alt=""
                className="w-10 h-10 rounded-md object-cover border border-forest/10 shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
        ))}
        <button type="button" onClick={addImageField} className="text-xs text-gold mt-2 hover:underline">
          + Add another image
        </button>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-charcoal/50">Video URL (optional)</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            value={form.video}
            onChange={(e) => handleChange("video", e.target.value)}
            placeholder="Paste a link, or click Upload →"
            className="flex-1 border border-forest/20 rounded-lg px-4 py-2.5"
          />
          <input
            ref={videoFileInput}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              handleVideoFileSelected(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => videoFileInput.current?.click()}
            disabled={uploadingVideo}
            title="Upload a video from your device"
            className="shrink-0 flex items-center gap-1.5 border border-forest/20 text-forest text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg hover:bg-forest hover:text-cream transition-colors disabled:opacity-60"
          >
            {uploadingVideo ? <UploadSpinner /> : <UploadIcon className="w-4 h-4" />}
            {uploadingVideo ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : productId ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
