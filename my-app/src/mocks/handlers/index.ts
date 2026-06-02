import { authHandlers } from './auth'
import { companionHandlers } from './companions'
import { bookingHandlers } from './bookings'
import { walletHandlers } from './wallet'
import { chatHandlers } from './chat'
import { notificationHandlers } from './notifications'

export const handlers = [
  ...authHandlers,
  ...companionHandlers,
  ...bookingHandlers,
  ...walletHandlers,
  ...chatHandlers,
  ...notificationHandlers,
]
