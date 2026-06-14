'use client'

import { useBookingForm } from './useBookingForm'
import { BookingFormStep1 } from './BookingFormStep1'
import { BookingFormStep2 } from './BookingFormStep2'
import { BookingFormSuccess } from './BookingFormSuccess'

export interface BookingFormProps {
  companionId: string
  companionName: string
  scenarioId: string
  scenarioName: string
  priceInCoin: number
  durationMinutes: number
}

export function BookingForm(props: BookingFormProps) {
  const { companionId, companionName, scenarioId, scenarioName, priceInCoin, durationMinutes } = props

  const {
    step,
    setStep,
    scheduledAt,
    setScheduledAt,
    note,
    setNote,
    state,
    formAction,
    mockFormSubmit,
    isPending,
    errorMessage,
    handleNextStep,
    balance,
    openWallet,
    user,
    login,
    minDatetimeLocal,
    router,
  } = useBookingForm({
    companionId,
    companionName,
    scenarioId,
    scenarioName,
    priceInCoin,
    durationMinutes,
  })

  // Màn hình thành công
  if (state.status === 'success') {
    return (
      <BookingFormSuccess
        companionName={companionName}
        onGoToBookings={() => router.push('/bookings')}
        onContinueExplore={() => router.push('/explore')}
      />
    )
  }

  return (
    // Production: action={formAction} → Server Action
    // Mock: onSubmit={mockFormSubmit} → browser fetch → MSW intercepts
    <form
      action={formAction}
      onSubmit={mockFormSubmit}
      className="space-y-5"
    >
      {/* Các trường ẩn để submit qua Server Action (production) */}
      <input type="hidden" name="companionId" value={companionId} />
      <input type="hidden" name="scenarioId" value={scenarioId} />
      <input type="hidden" name="scheduledAt" value={scheduledAt} />
      <input type="hidden" name="note" value={note} />

      {step === 1 ? (
        <BookingFormStep1
          scenarioName={scenarioName}
          durationMinutes={durationMinutes}
          priceInCoin={priceInCoin}
          scheduledAt={scheduledAt}
          onChangeScheduledAt={setScheduledAt}
          note={note}
          onChangeNote={setNote}
          minDatetimeLocal={minDatetimeLocal}
          onNextStep={handleNextStep}
          isPending={isPending}
        />
      ) : (
        <BookingFormStep2
          companionName={companionName}
          scenarioName={scenarioName}
          priceInCoin={priceInCoin}
          scheduledAt={scheduledAt}
          balance={balance}
          user={user}
          isPending={isPending}
          login={login}
          openWallet={openWallet}
          onBackStep={() => setStep(1)}
        />
      )}

      {errorMessage && (
        <p className="text-error text-sm bg-error/10 rounded-xl px-4 py-2.5 border border-error/20 font-sans text-center">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
