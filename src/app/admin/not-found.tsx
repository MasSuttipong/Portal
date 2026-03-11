import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          หน้าที่คุณกำลังค้นหาไม่มีอยู่ใน Admin Panel
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          กลับหน้า Admin
        </Link>
      </div>
    </div>
  );
}
