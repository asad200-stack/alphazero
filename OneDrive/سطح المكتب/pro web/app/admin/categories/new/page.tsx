import { getSession, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CategoryForm from '@/components/CategoryForm'

export default async function NewCategoryPage() {
  const session = await requireAuth()

  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  if (!session.storeId) {
    return <div>No store associated with your account</div>
  }

  const categories = await prisma.category.findMany({
    where: { storeId: session.storeId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
        <p className="mt-2 text-gray-600">Create a new category for your products</p>
      </div>

      <CategoryForm storeId={session.storeId} categories={categories} />
    </div>
  )
}

