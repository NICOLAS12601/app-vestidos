"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface EditItemModalProps {
  item: {
    id: string | number;
    name?: string;
    color?: string;
    style?: string;
    sizes?: string[];
    pricePerDay?: number;
    raw?: {
      nombre?: string;
      color?: string;
      estilo?: string;
      talle?: string;
      precio?: string | number;
      imagen?: string | null;
    };
  } | null;
  onClose: () => void;
  updateItemAction: (formData: FormData) => Promise<void>;
}

export default function EditItemModal({ item, onClose, updateItemAction }: EditItemModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (item) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [item, onClose]);

  if (!item) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = item.raw?.imagen ?? null;

      // Si hay una nueva imagen seleccionada, subirla primero
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", selectedFile);

        const uploadResponse = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          alert(`Error al subir imagen: ${error.error || "Error desconocido"}`);
          setIsUploading(false);
          return;
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      }

      // Agregar la URL de la imagen al formData
      if (imageUrl) {
        formData.append("imagen", imageUrl);
      } else {
        formData.append("imagen", "");
      }

      await updateItemAction(formData);
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto");
    } finally {
      setIsUploading(false);
    }
  };

  const nombre = item.raw?.nombre ?? item.name ?? "";
  const color = item.raw?.color ?? item.color ?? "";
  const estilo = item.raw?.estilo ?? item.style ?? "";
  const talle = item.raw?.talle ?? (Array.isArray(item.sizes) ? item.sizes.join(",") : "");
  const precio = String(item.raw?.precio ?? item.pricePerDay ?? "0");
  const currentImage = item.raw?.imagen ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit product #{String(item.id)}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="id" value={String(item.id)} />
            <label className="text-xs font-semibold">
              Nombre
              <input
                name="nombre"
                defaultValue={nombre}
                required
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="text-xs font-semibold">
              Color
              <input
                name="color"
                defaultValue={color}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="text-xs font-semibold">
              Estilo
              <input
                name="estilo"
                defaultValue={estilo}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="text-xs font-semibold">
              Talles (CSV)
              <input
                name="talle"
                defaultValue={talle}
                className="mt-1 w-full border rounded px-2 py-1"
                placeholder="XS,S,M,L"
              />
            </label>
            <label className="text-xs font-semibold sm:col-span-2">
              Precio por día
              <input
                name="precio"
                type="number"
                step="0.01"
                min="0"
                defaultValue={precio}
                required
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="text-xs font-semibold sm:col-span-2">
              Imagen
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              />
              {(imagePreview || currentImage) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || currentImage || ""}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </label>
            <div className="col-span-full flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Subiendo..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

