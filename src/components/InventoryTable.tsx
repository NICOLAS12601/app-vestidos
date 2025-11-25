"use client";

import { useState } from "react";
import EditItemModal from "./EditItemModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Item {
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
  };
}

interface InventoryTableProps {
  items: Item[];
  deleteItemAction: (formData: FormData) => Promise<void>;
  updateItemAction: (formData: FormData) => Promise<void>;
}

export default function InventoryTable({ items, deleteItemAction, updateItemAction }: InventoryTableProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  return (
    <>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Color</th>
              <th className="py-2 pr-4">Style</th>
              <th className="py-2 pr-4">Sizes</th>
              <th className="py-2 pr-4">Price/day</th>
              <th className="py-2 pr-0 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={String(i.id)} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 group">
                <td className="py-2 pr-4">{String(i.id)}</td>
                <td className="py-2 pr-4">{i.name ?? "-"}</td>
                <td className="py-2 pr-4">{i.color ?? "-"}</td>
                <td className="py-2 pr-4">{i.style ?? "-"}</td>
                <td className="py-2 pr-4">
                  {Array.isArray(i.sizes) ? i.sizes.join(", ") : ""}
                </td>
                <td className="py-2 pr-4">${Number(i.pricePerDay ?? 0).toFixed(2)}</td>
                <td className="py-2 pl-4 pr-0 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingItem(i)}
                      className="rounded border px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setDeletingItem(i)}
                      className="rounded border px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="py-3 text-slate-500" colSpan={7}>
                  No items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} updateItemAction={updateItemAction} />
      <DeleteConfirmModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={async () => {
          if (deletingItem) {
            const formData = new FormData();
            formData.append("id", String(deletingItem.id));
            await deleteItemAction(formData);
          }
        }}
      />
    </>
  );
}

