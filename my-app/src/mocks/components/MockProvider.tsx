'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'

let isWorkerStarted = false

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (process.env.NEXT_PUBLIC_MOCK_ENABLED !== 'true') {
      setIsReady(true)
      return
    }

    if (isWorkerStarted) {
      setIsReady(true)
      return
    }

    import('@/mocks/browser').then(async ({ worker }) => {
      try {
        if (!isWorkerStarted) {
          isWorkerStarted = true
          await worker.start({
            serviceWorker: {
              url: '/sw.js',
            },
            onUnhandledRequest: 'bypass', // không warn với các request không phải /api/*
          })
          console.log('[MSW] Mock worker started')
        }
      } catch (err) {
        console.warn('[MSW] Worker start warning:', err)
      } finally {
        setIsReady(true)
      }
    })
  }, [])

  // Trong quá trình SSR và Hydration lần đầu ở Client, render children để khớp HTML với Server
  if (!mounted) {
    return <>{children}</>
  }

  // Sau khi mounted ở Client, nếu bật Mock mà chưa ready thì hiển thị màn hình chờ loading
  if (process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' && !isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 font-sans text-neutral-500">
        Khởi tạo hệ thống giả lập dữ liệu (MSW)...
      </div>
    )
  }

  return <>{children}</>
}
