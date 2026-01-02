import { getSession, requireStoreAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  await requireStoreAccess(product.storeId)

  const store = await prisma.store.findUnique({
    where: { id: product.storeId },
    select: { currency: true },
  })

  const categories = await prisma.category.findMany({
    where: { storeId: product.storeId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-gray-600">Update product information</p>
      </div>

      <ProductForm
        storeId={product.storeId}
        currency={store?.currency || 'USD'}
        categories={categories}
        product={product}
      />
    </div>
  )
}

