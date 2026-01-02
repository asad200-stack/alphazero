import { getSession, requireStoreAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import CategoryForm from '@/components/CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { parent: true },
  })

  if (!category) {
    notFound()
  }

  await requireStoreAccess(category.storeId)

  const categories = await prisma.category.findMany({
    where: { storeId: category.storeId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-2 text-gray-600">Update category information</p>
      </div>

      <CategoryForm
        storeId={category.storeId}
        categories={categories}
        category={category}
      />
    </div>
  )
}

