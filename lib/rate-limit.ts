import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

export async function rateLimit(identifier: string) {
  // Temporarily disabled
  return true
}

