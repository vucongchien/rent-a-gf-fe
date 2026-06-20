import { http, HttpResponse, delay } from 'msw'

export const mediaHandlers = [
  // POST /api/media/upload
  http.post('/api/media/upload', async () => {
    await delay(1000)
    // mock upload success, return a dummy url
    return HttpResponse.json({
      data: {
        url: 'https://i.pravatar.cc/600?u=mock-upload-' + Date.now(),
        success: true
      }
    })
  })
]
