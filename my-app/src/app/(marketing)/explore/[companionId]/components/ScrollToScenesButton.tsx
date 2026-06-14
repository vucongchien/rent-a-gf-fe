'use client'

import React from 'react'
import { Button } from '@/shared/components/atoms/Button'

export function ScrollToScenesButton() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const element = document.getElementById('scenes')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <Button
      variant="primary"
      size="md"
      onClick={handleClick}
      className="rounded-full px-6 text-sm font-semibold whitespace-nowrap transition-all shadow-[0_4px_12px_rgba(255,182,193,0.35)] hover:-translate-y-0.5"
    >
      Chọn kịch bản hẹn →
    </Button>
  )
}
