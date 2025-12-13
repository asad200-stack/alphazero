import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

const ShareStoreLink = () => {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { settings } = useSettings()

  // Get store URL - use settings store_url if available, otherwise use current origin
  const storeUrl = settings?.store_url && settings.store_url.trim() !== '' 
    ? settings.store_url.trim()
    : window.location.origin

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = storeUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        alert('فشل نسخ الرابط. الرجاء نسخه يدوياً: ' + storeUrl)
      }
      document.body.removeChild(textArea)
    }
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`مرحباً! تصفح منتجاتنا على: ${storeUrl}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareViaTelegram = () => {
    const message = encodeURIComponent(`مرحباً! تصفح منتجاتنا على: ${storeUrl}`)
    window.open(`https://t.me/share/url?url=${encodeURIComponent(storeUrl)}&text=${message}`, '_blank')
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2 space-x-reverse shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>مشاركة رابط المتجر</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">مشاركة رابط المتجر</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                رابط المتجر للزبائن:
              </label>
              {storeUrl && (storeUrl.includes('localhost') || storeUrl.includes('127.0.0.1')) && (
                <div className="mb-3 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
                  <p className="font-medium mb-1">⚠️ تحذير:</p>
                  <p className="text-sm">
                    الرابط الحالي هو localhost ولن يعمل على أجهزة أخرى. 
                    يرجى نشر المشروع على Render وإضافة رابط عام في الإعدادات.
                    <br />
                    <span className="font-semibold mt-2 block">راجع ملف: GITHUB_DEPLOY_SIMPLE.md</span>
                  </p>
                </div>
              )}
              {storeUrl && !storeUrl.includes('localhost') && !storeUrl.includes('127.0.0.1') && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                  <p className="font-medium mb-1">✅ ممتاز!</p>
                  <p className="text-sm">
                    هذا الرابط ثابت ويمكن مشاركته مع الزبائن. 
                    <strong>التحديثات تلقائية</strong> - أي منتج تضيفه أو تعدله يظهر للزبائن فوراً بدون الحاجة لإعادة نشر!
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="text"
                  value={storeUrl}
                  readOnly
                  className={`flex-1 px-4 py-3 border rounded-lg bg-gray-50 text-base font-medium ${
                    storeUrl && (storeUrl.includes('localhost') || storeUrl.includes('127.0.0.1'))
                      ? 'border-yellow-500'
                      : 'border-green-300 bg-green-50'
                  }`}
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-5 py-3 rounded-lg font-semibold transition shadow-md ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center space-x-2 space-x-reverse">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>تم النسخ!</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2 space-x-reverse">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>نسخ الرابط</span>
                    </span>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                💡 <strong>نصيحة:</strong> هذا الرابط ثابت - شاركه مع الزبائن مرة واحدة، 
                وأي تعديلات تقوم بها ستظهر لهم تلقائياً عند فتح الرابط!
              </p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-3">مشاركة عبر:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center space-x-2 space-x-reverse bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>واتساب</span>
                </button>
                <button
                  onClick={shareViaTelegram}
                  className="flex items-center justify-center space-x-2 space-x-reverse bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>تيليجرام</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-1 space-x-reverse"
              >
                <span>فتح المتجر في نافذة جديدة</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ShareStoreLink

