import { getSession, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StoreSettingsForm from '@/components/StoreSettingsForm'

export default async function SettingsPage() {
  const session = await requireAuth()

  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  if (!session.storeId) {
    return <div>No store associated with your account</div>
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: {
      settings: true,
    },
  })

  if (!store) {
    return <div>Store not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="mt-2 text-gray-600">Manage your store profile and preferences</p>
      </div>

      <StoreSettingsForm store={store} />
    </div>
  )
}

