import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/base-path";

export default function AdminPage() {
  redirect(withBasePath("/admin/news"));
}
