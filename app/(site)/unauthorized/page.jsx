"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="btn btn-outline"
          >
            Go Back
          </button>
          <button
            onClick={() => router.replace("/")}
            className="btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
