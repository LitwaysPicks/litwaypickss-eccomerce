"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, User } from "lucide-react";
import { useCustomers, CUSTOMERS_PAGE_SIZE } from "@/hooks/useCustomers";
import Pagination from "@/components/Admin/Pagination";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { customers, totalCount, pageCount, isLoading, isFetching } = useCustomers({
    search: debouncedSearch, page,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          {isLoading ? "Loading…" : `${totalCount} customer${totalCount !== 1 ? "s" : ""}`}
          {isFetching && !isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input h-9 pl-9 pr-3 text-sm w-64"
          />
        </div>
      </div>

      <div className={`card overflow-hidden transition-opacity ${isFetching ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Location</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">No customers found</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {c.first_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page} pageCount={pageCount} totalCount={totalCount}
          pageSize={CUSTOMERS_PAGE_SIZE} isFetching={isFetching} onPageChange={setPage}
        />
      </div>
    </div>
  );
}
