"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, Trash2, Plus, ShieldCheck, X } from "lucide-react";
import { useCustomers, CUSTOMERS_PAGE_SIZE } from "@/hooks/useCustomers";
import Pagination from "@/components/Admin/Pagination";

function ConfirmDelete({ name, onConfirm, onCancel, isPending }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Delete {name}?</span>
      <button
        onClick={onConfirm}
        disabled={isPending}
        className="text-xs font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
      </button>
      <button
        onClick={onCancel}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
      >
        No
      </button>
    </div>
  );
}

function CreateAdminModal({ onSave, isSaving, onClose }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-900">Create admin account</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded p-1 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-600">First name <span className="text-rose-500">*</span></label>
              <input type="text" required value={form.firstName} onChange={set("firstName")} className="input w-full" placeholder="Jane" />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-600">Last name <span className="text-rose-500">*</span></label>
              <input type="text" required value={form.lastName} onChange={set("lastName")} className="input w-full" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-600">Email <span className="text-rose-500">*</span></label>
            <input type="email" required value={form.email} onChange={set("email")} className="input w-full" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-600">Password <span className="text-rose-500">*</span></label>
            <input type="password" required minLength={8} value={form.password} onChange={set("password")} className="input w-full" placeholder="Min. 8 characters" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : "Create admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomersTab({ customers, totalCount, pageCount, isLoading, isFetching, deleteUser, searchQuery, setSearchQuery, page, setPage }) {
  const [deletingId, setDeletingId] = useState(null);

  return (
    <>
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
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No customers found</td></tr>
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
                    <td className="px-5 py-3.5 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      {deletingId === c.id ? (
                        <ConfirmDelete
                          name={c.first_name}
                          isPending={deleteUser.isPending}
                          onConfirm={() => { deleteUser.mutate(c.id); setDeletingId(null); }}
                          onCancel={() => setDeletingId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
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
    </>
  );
}

function AdminsTab({ admins, adminsLoading, createAdmin, deleteAdmin }) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreate = async (data) => {
    try {
      await createAdmin.mutateAsync(data);
      setShowModal(false);
    } catch {
      // toast already fired in mutation onError
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {adminsLoading ? "Loading…" : `${admins.length} admin${admins.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-1.5" />
          New admin
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Admin</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Added</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminsLoading ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-400">No admins found</td></tr>
              ) : (
                admins.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {a.first_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900">{a.first_name} {a.last_name}</p>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-600">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Admin
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      {deletingId === a.id ? (
                        <ConfirmDelete
                          name={a.first_name}
                          isPending={deleteAdmin.isPending}
                          onConfirm={() => { deleteAdmin.mutate(a.id); setDeletingId(null); }}
                          onCancel={() => setDeletingId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setDeletingId(a.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete admin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CreateAdminModal
          onSave={handleCreate}
          isSaving={createAdmin.isPending}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

const TABS = ["Customers", "Admins"];

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState("Customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { customers, totalCount, pageCount, isLoading, isFetching, deleteUser, admins, adminsLoading, createAdmin, deleteAdmin } = useCustomers({
    search: debouncedSearch, page,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Customers" ? (
        <CustomersTab
          customers={customers}
          totalCount={totalCount}
          pageCount={pageCount}
          isLoading={isLoading}
          isFetching={isFetching}
          deleteUser={deleteUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          page={page}
          setPage={setPage}
        />
      ) : (
        <AdminsTab
          admins={admins}
          adminsLoading={adminsLoading}
          createAdmin={createAdmin}
          deleteAdmin={deleteAdmin}
        />
      )}
    </div>
  );
}
