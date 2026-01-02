import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import InquiryForm from '@/components/InquiryForm'
import Link from 'next/link'

export default async function ProductPage({
  params,
}: {
  params: { slug: string; productSlug: string }
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug, status: 'ACTIVE' },
    include: {
      settings: true,
    },
  })

  if (!store) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: {
      storeId_slug: {
        storeId: store.id,
        slug: params.productSlug,
      },
      visibility: 'VISIBLE',
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
      variations: true,
    },
  })

  if (!product) {
    notFound()
  }

  const displayPrice = product.salePrice || product.price
  const hasSale = !!product.salePrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        style={{ borderBottomColor: store.themeColor || undefined }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {store.logo && (
                <Link href={`/store/${store.slug}`}>
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="h-10 w-10 object-contain"
                  />
                </Link>
              )}
              <Link
                href={`/store/${store.slug}`}
                className="text-xl font-bold hover:underline"
                style={{ color: store.themeColor || undefined }}
              >
                {store.name}
              </Link>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square relative bg-gray-100 rounded overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt={`${product.name} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <Link
                    href={`/store/${store.slug}?category=${product.category.slug}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  {hasSale && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.price, product.currency || 'USD')}
                    </span>
                  )}
                  <span className={`text-3xl font-bold ${hasSale ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatPrice(displayPrice, product.currency || 'USD')}
                  </span>
                </div>
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
                {product.stockQuantity > 0 ? (
                  <p className="text-sm text-green-600">In Stock ({product.stockQuantity} available)</p>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
              </div>

              {product.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {product.specifications && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                  <div className="text-gray-700 whitespace-pre-line font-mono text-sm">
                    {product.specifications}
                  </div>
                </div>
              )}

              {product.tags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.variations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Variations</h2>
                  <div className="space-y-2">
                    {product.variations.map((variation) => (
                      <div
                        key={variation.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span>
                          {variation.name}: {variation.value}
                        </span>
                        {variation.priceModifier && variation.priceModifier !== 0 && (
                          <span className="text-sm text-gray-600">
                            {variation.priceModifier > 0 ? '+' : ''}
                            {formatPrice(variation.priceModifier, product.currency || 'USD')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {store.settings?.allowInquiries && (
                <div className="pt-6 border-t">
                  <InquiryForm productId={product.id} storeId={store.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

