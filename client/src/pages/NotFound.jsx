import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const NotFound = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t('pageNotFound') || 'الصفحة غير موجودة'}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('pageNotFoundMessage') || 'عذراً، الصفحة التي تبحث عنها غير موجودة.'}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {t('backToHome') || 'العودة للصفحة الرئيسية'}
        </Link>
      </div>
    </div>
  )
}

export default NotFound





