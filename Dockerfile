FROM node:16-slim as builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM gcr.io/distroless/nodejs:16
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["dist/main"]