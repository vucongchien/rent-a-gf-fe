import { notFound } from 'next/navigation'
import Link from 'next/link'
import { companionService } from '@/shared/services/companionService'
import { BookingForm } from '@/shared/components/molecules/BookingForm'
import { SiteHeader } from '@/shared/components/organisms/SiteHeader'

interface PageProps {
  params: Promise<{ companionId: string }>
  searchParams: Promise<{ scenarioId?: string }>
}

export default async function StandaloneBookingPage({ params, searchParams }: PageProps) {
  const { companionId } = await params
  const { scenarioId } = await searchParams
  const result = await companionService.getCompanionDetail(companionId)
  if (!result?.data) notFound()
  const companion = result.data
  const scenario = companion.scenarios.find(s => s.id === scenarioId) ?? companion.scenarios[0]

  return (
    <>
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href={`/explore/${companionId}`} className="text-xs text-neutral-400 hover:text-brand transition-colors">
            ← Quay lại profile của {companion.displayName}
          </Link>
        </div>
        
        <div className="note-card w-full p-8 bg-[--color-cream]">
          <h2 className="font-serif text-3xl text-brand mb-2">Đặt lịch hẹn</h2>
          <p className="text-sm text-neutral-600 mb-6">{scenario.name} · với {companion.displayName}</p>
          <BookingForm
            companionId={companion.id}
            companionName={companion.displayName}
            scenarioId={scenario.id}
            scenarioName={scenario.name}
            priceInCoin={scenario.priceInCoin}
            durationMinutes={scenario.durationMinutes}
          />
        </div>
      </main>
    </>
  )
}
