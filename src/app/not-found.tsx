"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center overflow-hidden scrollbar-thin">
      <h2>Not Found</h2>
      <p>{pathname} is either legacy, myth, or unbegun.</p>
      <Link href="/" className="text-gray-500">
        Return Home
      </Link>
    </div>
  );
}
