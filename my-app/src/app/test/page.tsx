'use client'
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react'

// Type definitions to keep TypeScript happy
interface Companion {
  id: string
  displayName: string
  avatarUrl: string
  city: string
  ratingAvg: number
  reviewCount: number
  featuredScenario: { name: string; priceInCoin: number }
  voiceIntroUrl: string | null
}

interface Booking {
  id: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  scenarioName: string
  scheduledAt: string
  endsAt: string
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  priceInCoin: number
  chatRoomId: string | null
  scenarioLocation: string
}

interface Wallet {
  balance: number
  frozenBalance: number
  transactions: Array<{
    id: string
    label: string
    amountInCoin: number
    type: 'credit' | 'debit'
    status: string
    createdAt: string
  }>
}

interface User {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  role: 'client' | 'companion' | 'admin'
}

const getFutureScheduledAt = () => {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
}

export default function Home() {
  // States
  const [user, setUser] = useState<User | null>(null)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  
  // Loading states
  const [, setLoadingUser] = useState(true)
  const [loadingCompanions, setLoadingCompanions] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loadingWallet, setLoadingWallet] = useState(true)

  // Feedback states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Utility to append log messages for easy developer debugging
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)])
    console.log(`[DevLog] ${msg}`)
  }

  // Fetch all domain data
  const fetchData = async () => {
    addLog('Starting to fetch domain data from MSW mock layer...')
    
    // Auth
    setLoadingUser(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const json = await res.json()
        setUser(json.data)
        addLog(`Successfully loaded User: ${json.data.displayName} (${json.data.role})`)
      } else {
        setUser(null)
        addLog('User is currently a Guest (401 from /api/auth/me)')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Failed to fetch /api/auth/me: ${msg}`)
    } finally {
      setLoadingUser(false)
    }

    // Companions
    setLoadingCompanions(true)
    try {
      const res = await fetch('/api/companions')
      const json = await res.json()
      setCompanions(json.data.items)
      addLog(`Loaded ${json.data.items.length} companions from /api/companions`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Failed to fetch companions: ${msg}`)
    } finally {
      setLoadingCompanions(false)
    }

    // Bookings
    setLoadingBookings(true)
    try {
      const res = await fetch('/api/bookings')
      const json = await res.json()
      setBookings(json.data.items)
      addLog(`Loaded ${json.data.items.length} bookings from /api/bookings`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Failed to fetch bookings: ${msg}`)
    } finally {
      setLoadingBookings(false)
    }

    // Wallet
    setLoadingWallet(true)
    try {
      const res = await fetch('/api/wallet')
      const json = await res.json()
      setWallet(json.data)
      addLog(`Loaded wallet: ${json.data.balance} KC from /api/wallet`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Failed to fetch wallet: ${msg}`)
    } finally {
      setLoadingWallet(false)
    }
  }

  // Init
  useEffect(() => {
    // Wait a brief moment to ensure MSW worker registration starts
    const timer = setTimeout(() => {
      fetchData()
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switch role handler
  const handleRoleSwitch = async (role: 'guest' | 'client' | 'companion' | 'admin') => {
    addLog(`Requesting role switch to: ${role}...`)
    try {
      const res = await fetch('/api/auth/mock-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        addLog(`Role successfully switched to: ${role}. Refetching state...`)
        fetchData()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Failed to switch role: ${msg}`)
    }
  }

  // Booking actions
  const handleCancelBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId)
    addLog(`Requesting cancel for booking: ${bookingId}...`)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const json = await res.json()
        addLog(`Booking ${bookingId} cancelled successfully! Refunded: ${json.data.refundedCoin} Kano-Coins`)
        // Refetch to align with single source of truth
        fetchData()
      } else {
        const errJson = await res.json()
        addLog(`Failed to cancel booking: ${errJson.error.message}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Error cancelling booking: ${msg}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId)
    addLog(`Companion accepting booking: ${bookingId}...`)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'PATCH',
      })
      if (res.ok) {
        addLog(`Booking ${bookingId} accepted! Opening chat...`)
        fetchData()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Error accepting booking: ${msg}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId)
    addLog(`Companion rejecting booking: ${bookingId}...`)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'PATCH',
      })
      if (res.ok) {
        addLog(`Booking ${bookingId} rejected!`)
        fetchData()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Error rejecting booking: ${msg}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Booking creation helper
  const handleCreateBooking = async (companionId: string, scenarioId: string) => {
    addLog(`Creating custom booking for companion: ${companionId}...`)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId,
          scenarioId,
          scheduledAt: getFutureScheduledAt(),
        }),
      })
      if (res.ok) {
        const json = await res.json()
        addLog(`Booking created successfully! Booking ID: ${json.data.id}. Frozen coin: ${json.data.frozenCoin}`)
        fetchData()
      } else {
        const errJson = await res.json()
        addLog(`Failed to create booking: ${errJson.error.message}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Error creating booking: ${msg}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12 selection:bg-rose-500 selection:text-white">
      {/* Dynamic Glow Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-rose-500/20">
              K
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
                KanoRent Dev Sandbox
              </h1>
              <p className="text-xs text-slate-400 font-medium">MSW Mock Infrastructure Live Demo</p>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold px-2 text-slate-400">ROLE:</span>
            {(['guest', 'client', 'companion', 'admin'] as const).map(role => {
              const isActive = (role === 'guest' && !user) || (user?.role === role)
              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {role}
                </button>
              )
            })}
          </div>

          {/* Wallet Mini-Widget */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Balance:</span>
            {loadingWallet ? (
              <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
            ) : (
              <div className="text-sm font-black text-amber-300">
                {wallet?.balance ?? 0} <span className="text-xs font-bold text-slate-400">KC</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Explorer & Bookings (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Companions */}
          <section className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Explore Companions
                </h2>
                <p className="text-xs text-slate-400">Dynamic list fetched directly from /api/companions</p>
              </div>
              <button 
                onClick={fetchData} 
                className="text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all"
              >
                Reload Data
              </button>
            </div>

            {loadingCompanions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/40 animate-pulse h-40" />
                ))}
              </div>
            ) : companions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No companions available at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companions.map(comp => (
                  <div 
                    key={comp.id} 
                    className="group bg-slate-900/50 hover:bg-slate-900/80 p-4 rounded-xl border border-slate-800/60 transition-all hover:border-rose-500/30 flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/80">
                        <img 
                          src={comp.avatarUrl} 
                          alt={comp.displayName}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-white group-hover:text-rose-400 transition-colors">
                          {comp.displayName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-semibold text-rose-300">
                            {comp.city}
                          </span>
                          <span className="text-amber-400 font-bold">
                            ★ {comp.ratingAvg > 0 ? comp.ratingAvg.toFixed(1) : 'New'}
                          </span>
                          <span>({comp.reviewCount} reviews)</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium line-clamp-1 pt-1">
                          {comp.featuredScenario?.name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-300">
                        {comp.featuredScenario?.priceInCoin} <span className="text-[10px] font-medium text-slate-400">KC/hr</span>
                      </div>
                      <button
                        onClick={() => handleCreateBooking(comp.id, `sc-1-1`)}
                        disabled={!user || user.role !== 'client'}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                          user?.role === 'client'
                            ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50'
                        }`}
                        title={user?.role !== 'client' ? 'Chỉ Client mới có quyền đặt lịch' : 'Đặt ngay'}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Bookings */}
          <section className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/80">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
              Active Bookings
            </h2>

            {loadingBookings ? (
              <div className="space-y-3">
                {[1, 2].map(n => (
                  <div key={n} className="bg-slate-900/60 h-24 rounded-xl border border-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active bookings found.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  // Beautiful stateful badge classes
                  const statusColors = {
                    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    CANCELLED: 'bg-slate-800 text-slate-400 border-slate-700/50',
                    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  }[booking.status]

                  const isMutating = actionLoadingId === booking.id

                  return (
                    <div 
                      key={booking.id}
                      className="bg-slate-900/40 hover:bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          <img 
                            src={booking.companionAvatarUrl} 
                            alt={booking.companionName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{booking.companionName}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 pt-0.5">{booking.scenarioName}</p>
                          <p className="text-[10px] text-slate-400 pt-1">
                            Scheduled: {new Date(booking.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Total Price</div>
                          <div className="text-sm font-bold text-amber-300">{booking.priceInCoin} KC</div>
                        </div>

                        {/* Interactive operations based on role and status */}
                        <div className="flex gap-2">
                          {booking.status === 'PENDING' && user?.role === 'client' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isMutating}
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold border border-slate-700/80 transition-all"
                            >
                              {isMutating ? 'Processing...' : 'Cancel'}
                            </button>
                          )}

                          {booking.status === 'PENDING' && user?.role === 'companion' && (
                            <>
                              <button
                                onClick={() => handleAcceptBooking(booking.id)}
                                disabled={isMutating}
                                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-md shadow-emerald-600/10 transition-all"
                              >
                                {isMutating ? '...' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                disabled={isMutating}
                                className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-md shadow-rose-600/10 transition-all"
                              >
                                {isMutating ? '...' : 'Reject'}
                              </button>
                            </>
                          )}

                          {booking.status === 'ACCEPTED' && (
                            <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                              Chat Room Open
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Console Logger & Instructions (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Sandbox Live Log Terminal */}
          <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[300px]">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-200">Sandbox Logs</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase transition-all"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto space-y-1 select-all scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic py-2">No sandbox logs. Interact with the UI to trigger requests.</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="border-l border-slate-800 pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Quick Instructions Card */}
          <section className="bg-gradient-to-b from-slate-950/80 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-sm tracking-wide uppercase">Mock Operations Spec</h3>
            <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-medium">
              <li className="flex gap-2">
                <span className="text-rose-400">✦</span>
                <span><strong>Role Switch</strong> alters `/api/auth/me` return value globally in real-time.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-400">✦</span>
                <span><strong>Book Now</strong> validates that you are logged in as a <strong>Client</strong>. Only client can freeze coin.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-400">✦</span>
                <span><strong>Companion dashboard</strong> unlocks <strong>Accept / Reject</strong> buttons on pending bookings.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-400">✦</span>
                <span>Accepting a booking transitions state and automatically opens a chat room.</span>
              </li>
            </ul>
          </section>

        </div>

      </main>
    </div>
  )
}
