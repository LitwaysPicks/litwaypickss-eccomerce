import { requireAdmin } from "@/lib/session";
import AdminShell from "@/components/Admin/Layout/AdminShell";

export default async function AdminLayout({ children }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
