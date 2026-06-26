import { describe, it, expect } from 'vitest'
import {
  validateProfile,
  validateScenario,
  validateMediaMeta,
  MAX_BIO_LEN,
  MAX_VOICE_SECONDS,
} from './validation'

describe('validateProfile', () => {
  it('accepts a valid profile', () => {
    const res = validateProfile({
      displayName: 'Chizuru',
      biography: 'Hello',
      availableCities: ['HCM'],
    })
    expect(res.ok).toBe(true)
  })

  it('rejects short displayName', () => {
    const res = validateProfile({ displayName: 'A', biography: '', availableCities: ['HCM'] })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.displayName).toBeTruthy()
  })

  it('rejects bio too long', () => {
    const res = validateProfile({
      displayName: 'Chizuru',
      biography: 'a'.repeat(MAX_BIO_LEN + 1),
      availableCities: ['HCM'],
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.biography).toBeTruthy()
  })

  it('requires at least 1 city', () => {
    const res = validateProfile({ displayName: 'Chizuru', biography: '', availableCities: [] })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.availableCities).toBeTruthy()
  })

  it('rejects invalid city code', () => {
    const res = validateProfile({
      displayName: 'Chizuru',
      biography: '',
      availableCities: ['Mars'],
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.availableCities).toBeTruthy()
  })
})

describe('validateScenario', () => {
  const base = {
    title: 'Cà phê chiều',
    description: 'Mô tả ngắn',
    price: 100,
    durationMinutes: 60,
    publicPlace: 'The Coffee House Q1',
  }

  it('accepts valid scenario', () => {
    expect(validateScenario(base).ok).toBe(true)
  })

  it('rejects price = 0 per INV-P01', () => {
    const res = validateScenario({ ...base, price: 0 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.price).toBeTruthy()
  })

  it('rejects negative price', () => {
    const res = validateScenario({ ...base, price: -10 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.price).toBeTruthy()
  })

  it('rejects duration 90 per INV-P02', () => {
    const res = validateScenario({ ...base, durationMinutes: 90 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.durationMinutes).toBeTruthy()
  })

  it('accepts duration 60/120/180', () => {
    for (const d of [60, 120, 180]) {
      expect(validateScenario({ ...base, durationMinutes: d }).ok).toBe(true)
    }
  })

  it('rejects too-short title', () => {
    const res = validateScenario({ ...base, title: 'Hi' })
    expect(res.ok).toBe(false)
  })
})

describe('validateMediaMeta', () => {
  it('rejects image > 2MB per INV-P05', () => {
    const res = validateMediaMeta({ assetType: 'IMAGE', sizeBytes: 3_000_000 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.file).toBeTruthy()
  })

  it('accepts image ≤ 2MB', () => {
    expect(validateMediaMeta({ assetType: 'IMAGE', sizeBytes: 1_500_000 }).ok).toBe(true)
  })

  it('rejects voice > 30s per INV-P04', () => {
    const res = validateMediaMeta({
      assetType: 'VOICE',
      sizeBytes: 1_000_000,
      durationSeconds: MAX_VOICE_SECONDS + 1,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.durationSeconds).toBeTruthy()
  })

  it('rejects voice > 5MB', () => {
    const res = validateMediaMeta({
      assetType: 'VOICE',
      sizeBytes: 6_000_000,
      durationSeconds: 10,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.file).toBeTruthy()
  })

  it('requires duration for voice', () => {
    const res = validateMediaMeta({ assetType: 'VOICE', sizeBytes: 1_000_000 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.fieldErrors.durationSeconds).toBeTruthy()
  })
})
