'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/atoms/Button'

let isWorkerStarted = false

const MSW_START_TIMEOUT_MS = 10_000

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)

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

    let settled = false
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true
        console.error('[MSW] Worker start timed out after', MSW_START_TIMEOUT_MS, 'ms')
        setHasError(true)
      }
    }, MSW_START_TIMEOUT_MS)

    import('@/mocks/browser')
      .then(async ({ worker }) => {
        if (isWorkerStarted) return
        isWorkerStarted = true
        await worker.start({
          serviceWorker: { url: '/sw.js' },
          onUnhandledRequest: 'bypass',
        })
        console.log('[MSW] Mock worker started')
      })
      .then(() => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        setIsReady(true)
      })
      .catch((err) => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        console.error('[MSW] Worker start failed:', err)
        setHasError(true)
      })

    return () => clearTimeout(timeoutId)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  if (process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' && hasError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 font-sans text-neutral-700 gap-4 px-6 text-center">
        <p className="text-base font-semibold">Không khởi động được hệ thống giả lập dữ liệu (MSW).</p>
        <p className="text-sm text-neutral-500">Vui lòng tải lại trang để thử lại.</p>
        <Button
          type="button"
          variant="unstyled"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-full bg-chizuru-500 hover:bg-chizuru-600 text-neutral-900 font-bold text-sm transition-colors"
        >
          Tải lại trang
        </Button>
      </div>
    )
  }

  if (process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' && !isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 font-sans text-neutral-500">
        Khởi tạo hệ thống giả lập dữ liệu (MSW)...
      </div>
    )
  }

  return <>{children}</>
}
