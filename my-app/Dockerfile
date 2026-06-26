# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Cài đặt pnpm phiên bản 9 tương đương cấu hình CI/CD
RUN npm install -g pnpm@9

# Copy các file quản lý dependencies
COPY package.json pnpm-lock.yaml* ./

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build code ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9

# Copy dependencies từ stage trước và copy source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry của Next.js để tăng tốc độ build và bảo mật thông tin
ENV NEXT_TELEMETRY_DISABLED=1

# Thực hiện build ứng dụng (Next.js sẽ xuất ra thư mục .next/standalone nhờ cấu hình output: 'standalone')
RUN pnpm run build

# Stage 3: Runner stage để chạy ứng dụng
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo group và user không có quyền root (non-root user) để chạy container an toàn hơn
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các assets tĩnh
COPY --from=builder /app/public ./public

# Cấp quyền cho thư mục prerender cache của Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy code đã được build standalone từ stage builder
# Nhờ output standalone, chúng ta không cần copy toàn bộ node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Khởi chạy server Next.js (file server.js được sinh ra tự động bởi Next.js standalone build)
CMD ["node", "server.js"]
