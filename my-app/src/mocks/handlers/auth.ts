import { http, HttpResponse, delay } from 'msw'
import {
  currentMockUser,
  setMockUser,
  mockUsers,
} from '../fixtures/data'

export const authHandlers = [
  // GET /api/auth/me
  http.get('/api/auth/me', async () => {
    await delay(300)
    if (!currentMockUser) {
      return HttpResponse.json(
        { code: 'UNAUTHENTICATED', message: 'Chưa đăng nhập' },
        { status: 401 }
      )
    }
    return HttpResponse.json(currentMockUser)
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async () => {
    await delay(200)
    setMockUser('guest')
    return HttpResponse.json({ message: 'Logout successful' })
  }),

  // POST /api/auth/mock-switch — chỉ dùng trong dev để switch role
  http.post('/api/auth/mock-switch', async ({ request }) => {
    const body = await request.json() as { role: keyof typeof mockUsers }
    setMockUser(body.role)
    return HttpResponse.json({ role: body.role })
  }),
]

