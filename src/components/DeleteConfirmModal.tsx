"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface DeleteConfirmModalProps {
    item: {
        id: string | number;
        name?: string;
    } | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmModal({
    item,
    onClose,
    onConfirm,
}: DeleteConfirmModalProps) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
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

    const handleConfirm = () => {
        onConfirm();
        router.refresh();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                            Confirm Delete
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                    <p className="mb-6 text-gray-700 dark:text-gray-300">
                        Are you sure you want to delete{" "}
                        <strong>
                            &quot;{item.name ?? `item #${item.id}`}&quot;
                        </strong>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border px-4 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
