import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice?: number | null
    currency?: string | null
    images: Array<{ url: string }>
  }
  storeSlug: string
}

export default function ProductCard({ product, storeSlug }: ProductCardProps) {
  const displayPrice = product.salePrice || product.price
  const hasSale = !!product.salePrice

  return (
    <Link
      href={`/store/${storeSlug}/product/${product.slug}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
    >
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center space-x-2">
          {hasSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price, product.currency || 'USD')}
            </span>
          )}
          <span className={`font-bold ${hasSale ? 'text-red-600' : 'text-gray-900'}`}>
            {formatPrice(displayPrice, product.currency || 'USD')}
          </span>
        </div>
      </div>
    </Link>
  )
}

