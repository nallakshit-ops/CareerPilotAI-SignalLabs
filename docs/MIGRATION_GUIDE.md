# Database Migration Instructions

## New Table: AIResponseCache

This migration adds a caching layer to reduce API costs by 70%+.

### Run Migration

```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_ai_response_cache

# OR if you prefer to push without migration files
npx prisma db push

# Verify the table was created
npx prisma studio
```

### What This Adds

**Table:** `AIResponseCache`
- Stores AI-generated responses with SHA-256 cache keys
- TTL-based expiration (configurable per feature)
- Hit count tracking for analytics
- Automatic cleanup via Inngest cron (daily at 2 AM)

### Environment Variables (Optional)

Add these to `.env.local` for job/hackathon APIs:

```env
# Job Listings (Optional - uses fallback if not set)
JSEARCH_RAPIDAPI_KEY="your_rapidapi_key"  # Free: 200 req/month
ADZUNA_APP_ID="your_app_id"               # Free: 250 req/day
ADZUNA_APP_KEY="your_app_key"

# GitHub (Optional - increases rate limits)
GITHUB_TOKEN="ghp_your_token"             # Free: 5000 req/hr (vs 60 without)
```

### Verify It Works

After migration:

1. Run any AI feature (skill gap, career simulation, etc.)
2. Check console logs for `💾 Cache SAVED`
3. Run the same query again
4. Check for `✅ Cache HIT` in logs
5. Open Prisma Studio: `npx prisma studio`
6. Navigate to `AIResponseCache` table
7. Verify entries are being created

### Cache Statistics API

Check cache performance:

```javascript
import { getCacheStats } from '@/lib/cache-manager';

const stats = await getCacheStats();
console.log(stats);
// Output:
// {
//   totalCachedResponses: 145,
//   averageHitsPerCache: 3.2,
//   byFeature: [
//     { feature: 'skill-gap', count: 42, totalHits: 156 },
//     { feature: 'career-simulation', count: 38, totalHits: 98 }
//   ]
// }
```

### Troubleshooting

**"Table already exists" error:**
- Run `npx prisma db pull` to sync schema
- Then `npx prisma generate`

**Cache not working:**
- Check that Inngest is running (cache cleanup cron)
- Verify DATABASE_URL is set correctly
- Check server logs for cache errors

**Prisma Client out of sync:**
```bash
npx prisma generate
```
