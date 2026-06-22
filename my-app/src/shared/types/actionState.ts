/**
 * actionState.ts — Discriminated union dùng chung cho mọi Server Action.
 * Map từ shape lỗi SSOT `{ code, message, details[] }` về fieldErrors khi có thể.
 */
export type ActionState<T = unknown> =
  | { status: 'idle' }
  | { status: 'success'; data?: T; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

export const idleState: ActionState<never> = { status: 'idle' }
