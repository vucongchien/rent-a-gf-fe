/**
 * sseUtils.ts — Helpers đóng gói giao thức Server-Sent Events (SSE).
 */

export function sendComment(controller: ReadableStreamDefaultController, comment: string) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`: ${comment}\n\n`));
}

export function sendEvent(
  controller: ReadableStreamDefaultController,
  eventName: string,
  data: unknown,
  id?: string
) {
  const encoder = new TextEncoder();
  let message = `event: ${eventName}\n`;
  if (id) {
    message += `id: ${id}\n`;
  }
  message += `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}
