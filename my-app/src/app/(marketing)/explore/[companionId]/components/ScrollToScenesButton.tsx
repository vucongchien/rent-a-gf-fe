'use client'

import React from 'react'

export function ScrollToScenesButton() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const element = document.getElementById('scenes')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="btn-base btn-primary btn-md rounded-full px-6 text-sm font-semibold whitespace-nowrap transition-all shadow-[0_4px_12px_rgba(255,182,193,0.35)] hover:-translate-y-0.5 cursor-pointer"
    >
      Chọn kịch bản hẹn →
    </button>
  )
}
