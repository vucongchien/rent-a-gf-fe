'use client'

import { useEffect } from 'react'

export function MockProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_ENABLED !== 'true') return

    import('@/mocks/browser').then(({ worker }) => {
      worker.start({
        onUnhandledRequest: 'bypass', // không warn với các request không phải /api/*
      })
      console.log('[MSW] Mock worker started')
    })
  }, [])

  return <>{children}</>
}
