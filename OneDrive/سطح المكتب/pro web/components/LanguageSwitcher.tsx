'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const stored = localStorage.getItem('language') as 'en' | 'ar' | null
    if (stored) {
      setLang(stored)
      document.documentElement.setAttribute('dir', stored === 'ar' ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', stored)
    }
  }, [])

  function handleLanguageChange(newLang: 'en' | 'ar') {
    setLang(newLang)
    localStorage.setItem('language', newLang)
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', newLang)
  }

  return (
    <div className="flex items-center space-x-2 border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium transition ${
          lang === 'en'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-3 py-1 text-sm font-medium transition ${
          lang === 'ar'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        AR
      </button>
    </div>
  )
}

