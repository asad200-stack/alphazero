import { getSession, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
  const session = await requireAuth()

  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  if (!session.storeId) {
    return <div>No store associated with your account</div>
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    select: { currency: true },
  })

  const categories = await prisma.category.findMany({
    where: { storeId: session.storeId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-gray-600">Create a new product for your store</p>
      </div>

      <ProductForm
        storeId={session.storeId}
        currency={store?.currency || 'USD'}
        categories={categories}
      />
    </div>
  )
}

