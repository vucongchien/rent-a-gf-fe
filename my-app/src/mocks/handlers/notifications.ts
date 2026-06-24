import { http, HttpResponse, delay } from 'msw'
import { mockNotifications } from '../fixtures/data'

let notifications = [...mockNotifications]

export const notificationHandlers = [
  // GET /api/notifications — cursor-based (SSOT §2.7).
  // Mock dataset nhỏ: trả tất cả 1 lần, nextCursor=null/hasMore=false.
  http.get('/api/notifications', async () => {
    await delay(400)
    return HttpResponse.json({
      items: notifications,
      nextCursor: null,
      hasMore: false,
    })
  }),

  // PUT /api/notifications/:notifId/read
  http.put('/api/notifications/:notifId/read', async ({ params }) => {
    await delay(200)
    notifications = notifications.map(n =>
      n.id === params.notifId ? { ...n, isRead: true } : n
    )
    return HttpResponse.json({ success: true })
  }),

  // PUT /api/notifications/read-all
  http.put('/api/notifications/read-all', async () => {
    await delay(300)
    notifications = notifications.map(n => ({ ...n, isRead: true }))
    return HttpResponse.json({ success: true })
  }),
]
