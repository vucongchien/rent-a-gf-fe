import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PolaroidGallery } from './PolaroidGallery'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('PolaroidGallery', () => {
  const defaultProps = {
    companionId: 'comp-1',
    companionName: 'Mochi',
    albumUrls: ['/photo-1.jpg', '/photo-2.jpg', '/photo-3.jpg', '/photo-4.jpg'],
  }

  it('renders main cover photo and thumbnails correctly with given props', () => {
    render(<PolaroidGallery {...defaultProps} />)

    // Kiểm tra render ảnh bìa
    const mainImg = screen.getByAltText(/Mochi ảnh bìa/i)
    expect(mainImg).toBeInTheDocument()
    expect(mainImg).toHaveAttribute('src', '/photo-1.jpg')
    expect(mainImg.closest('a')).toHaveAttribute('href', '/explore/comp-1/photo/0')

    // Kiểm tra render các ảnh thumb (lấy tối đa 3 ảnh thumb)
    const thumb1 = screen.getByAltText(/Mochi ảnh 2/i)
    expect(thumb1).toBeInTheDocument()
    expect(thumb1).toHaveAttribute('src', '/photo-2.jpg')
    expect(thumb1.closest('a')).toHaveAttribute('href', '/explore/comp-1/photo/1')

    const thumb2 = screen.getByAltText(/Mochi ảnh 3/i)
    expect(thumb2).toBeInTheDocument()
    expect(thumb2).toHaveAttribute('src', '/photo-3.jpg')
    expect(thumb2.closest('a')).toHaveAttribute('href', '/explore/comp-1/photo/2')

    const thumb3 = screen.getByAltText(/Mochi ảnh 4/i)
    expect(thumb3).toBeInTheDocument()
    expect(thumb3).toHaveAttribute('src', '/photo-4.jpg')
    expect(thumb3.closest('a')).toHaveAttribute('href', '/explore/comp-1/photo/3')
  })

  it('falls back to placeholder.png when albumUrls is empty', () => {
    render(<PolaroidGallery companionId="comp-1" companionName="Mochi" albumUrls={[]} />)

    const mainImg = screen.getByAltText(/Mochi ảnh bìa/i)
    expect(mainImg).toBeInTheDocument()
    expect(mainImg).toHaveAttribute('src', '/placeholder.png')

    // Không có thumbnail nào khác
    expect(screen.queryByAltText(/Mochi ảnh 2/i)).not.toBeInTheDocument()
  })
})
