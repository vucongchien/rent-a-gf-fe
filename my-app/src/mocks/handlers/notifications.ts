import { http, HttpResponse, delay } from 'msw'
import { mockNotifications } from '../fixtures/data'

let notifications = [...mockNotifications]

export const notificationHandlers = [
  // GET /api/notifications
  http.get('/api/notifications', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20
    const start = (page - 1) * limit
    return HttpResponse.json({
      data: {
        items: notifications.slice(start, start + limit),
        meta: { page, limit, total: notifications.length, hasNextPage: start + limit < notifications.length },
      },
    })
  }),

  // PATCH /api/notifications/:id/read
  http.patch('/api/notifications/:notifId/read', async ({ params }) => {
    await delay(200)
    notifications = notifications.map(n =>
      n.id === params.notifId ? { ...n, isRead: true } : n
    )
    return HttpResponse.json({ data: { success: true } })
  }),

  // PATCH /api/notifications/read-all
  http.patch('/api/notifications/read-all', async () => {
    await delay(300)
    notifications = notifications.map(n => ({ ...n, isRead: true }))
    return HttpResponse.json({ data: { success: true } })
  }),
]
