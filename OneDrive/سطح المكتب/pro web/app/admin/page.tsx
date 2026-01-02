import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPackage, FiFolder, FiSettings, FiStore, FiUsers } from 'react-icons/fi'

export default async function AdminDashboard() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN'

  let stats: any = {}

  if (isSuperAdmin) {
    const [storeCount, userCount, productCount] = await Promise.all([
      prisma.store.count(),
      prisma.user.count(),
      prisma.product.count(),
    ])

    stats = {
      stores: storeCount,
      users: userCount,
      products: productCount,
    }
  } else if (session.storeId) {
    const [productCount, categoryCount, inquiryCount] = await Promise.all([
      prisma.product.count({ where: { storeId: session.storeId } }),
      prisma.category.count({ where: { storeId: session.storeId } }),
      prisma.inquiry.count({ where: { storeId: session.storeId } }),
    ])

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      select: { name: true, slug: true, status: true },
    })

    stats = {
      products: productCount,
      categories: categoryCount,
      inquiries: inquiryCount,
      store,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isSuperAdmin ? 'Super Admin Dashboard' : 'Store Dashboard'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isSuperAdmin
            ? 'Manage all stores and platform settings'
            : 'Manage your store, products, and orders'}
        </p>
      </div>

      {!isSuperAdmin && stats.store && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Store</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {stats.store.name}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  stats.store.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stats.store.status}
              </span>
            </p>
            <p>
              <span className="font-medium">Public URL:</span>{' '}
              <Link
                href={`/store/${stats.store.slug}`}
                target="_blank"
                className="text-indigo-600 hover:text-indigo-700"
              >
                /store/{stats.store.slug}
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isSuperAdmin ? (
          <>
            <StatCard
              title="Total Stores"
              value={stats.stores}
              icon={FiStore}
              href="/admin/stores"
            />
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={FiUsers}
              href="/admin/users"
            />
            <StatCard
              title="Total Products"
              value={stats.products}
              icon={FiPackage}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Products"
              value={stats.products}
              icon={FiPackage}
              href="/admin/products"
            />
            <StatCard
              title="Categories"
              value={stats.categories}
              icon={FiFolder}
              href="/admin/categories"
            />
            <StatCard
              title="Inquiries"
              value={stats.inquiries}
              icon={FiSettings}
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isSuperAdmin && (
            <>
              <Link
                href="/admin/products/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
              >
                <FiPackage className="mx-auto mb-2 text-gray-400" size={24} />
                <div className="font-medium text-gray-900">Add New Product</div>
              </Link>
              <Link
                href="/admin/categories/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
              >
                <FiFolder className="mx-auto mb-2 text-gray-400" size={24} />
                <div className="font-medium text-gray-900">Add Category</div>
              </Link>
            </>
          )}
          <Link
            href="/admin/settings"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <FiSettings className="mx-auto mb-2 text-gray-400" size={24} />
            <div className="font-medium text-gray-900">Settings</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string
  value: number
  icon: any
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="text-gray-400" size={32} />
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

