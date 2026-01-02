import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { inquirySchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = inquirySchema.parse(body)

    // Verify store exists and is active
    const store = await prisma.store.findUnique({
      where: { id: validated.storeId, status: 'ACTIVE' },
      include: { settings: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.settings?.allowInquiries) {
      return NextResponse.json({ error: 'Inquiries not allowed for this store' }, { status: 403 })
    }

    const inquiry = await prisma.inquiry.create({
      data: validated,
    })

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create inquiry error:', error)
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}

