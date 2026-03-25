import { useState, useEffect } from 'react'

interface MigrationNoticeProps {
  onDismiss: () => void
}

export default function MigrationNotice({ onDismiss }: MigrationNoticeProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has seen migration notice
    const seen = localStorage.getItem('migration-notice-seen')
    if (!seen) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('migration-notice-seen', 'true')
    setShow(false)
    onDismiss()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            We've updated MoneyUnseen!
          </h2>
        </div>

        <div className="space-y-3 mb-6 text-sm text-gray-700">
          <p>
            Your fixed costs and goals are safe. We've moved to a calmer, 
            more empowering experience.
          </p>
          
          <div className="bg-primary-50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-primary-900">What's new:</p>
            <ul className="space-y-1 text-primary-800">
              <li>• Momentum Phases (replaces XP levels)</li>
              <li>• Monthly actions counter</li>
              <li>• Calmer, judgment-free messaging</li>
            </ul>
          </div>

          <p className="text-xs text-gray-600">
            Note: Your action history has been reset for a fresh start.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  )
}