"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLink() {
  const [href, setHref] = useState("/admin/login");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está logueado
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        setHref(data.loggedIn ? "/admin" : "/admin/login");
        setIsLoading(false);
      })
      .catch(() => {
        setHref("/admin/login");
        setIsLoading(false);
      });
  }, []);

  return (
    <Link 
      href={href} 
      className="inline-flex items-center rounded-full bg-fuchsia-600 text-white px-4 py-2 text-sm font-medium hover:bg-fuchsia-500"
    >
      Admin
    </Link>
  );
}

