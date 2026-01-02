import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Multi-Store SaaS Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create and manage your online store with our powerful multi-tenant platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Create Store
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
        <div className="mt-12">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Admin Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}

