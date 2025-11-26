"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface AddProductFormProps {
  addItemAction: (formData: FormData) => Promise<void>;
}

export default function AddProductForm({ addItemAction }: AddProductFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = null;

      // Si hay una imagen seleccionada, subirla primero
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
      }

      // Enviar el formulario con la server action
      await addItemAction(formData);
      
      // Limpiar el formulario
      e.currentTarget.reset();
      setImagePreview(null);
      setSelectedFile(null);
      
      // Refrescar la página
      router.refresh();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error al agregar el producto");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="my-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Nombre</label>
          <input name="nombre" required className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Color</label>
          <input name="color" className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Estilo</label>
          <input name="estilo" className="border rounded px-2 py-1" placeholder="Formal, casual, etc." />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Talles (CSV)</label>
          <input name="talle" className="border rounded px-2 py-1" placeholder="XS,S,M,L" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Precio por día</label>
          <input name="precio" type="number" step="0.01" min="0" required className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Imagen</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="border rounded px-2 py-1 text-sm"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Subiendo..." : "Add product"}
        </button>
      </form>
    </div>
  );
}

