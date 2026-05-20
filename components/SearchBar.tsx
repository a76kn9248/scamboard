"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search address, handle, or reason..."
        className="flex-1 bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
      />
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-mono text-sm transition-colors"
      >
        SEARCH
      </button>
    </form>
  );
}
