"use client"

import { useRouter } from "next/navigation"
import { LogOut, History, Camera, BookOpen } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : ""

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <h1 className="text-2xl font-bold text-gray-900">Plant Scanner</h1>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/scanner"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <Camera className="w-4 h-4" />
            Scanner
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <History className="w-4 h-4" />
            History
          </Link>
          <Link
            href="/examples"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Examples
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-gray-700">Welcome, {userName}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
