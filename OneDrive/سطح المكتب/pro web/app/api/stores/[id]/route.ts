import { NextRequest, NextResponse } from 'next/server'
import { requireStoreAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storeUpdateSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireStoreAccess(params.id)

    const body = await request.json()
    const validated = storeUpdateSchema.parse(body)

    const updated = await prisma.store.update({
      where: { id: params.id },
      data: validated,
    })

    return NextResponse.json({ store: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update store error:', error)
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }
}

