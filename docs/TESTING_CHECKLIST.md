# Testing Checklist - Phase 2 & 3 Features

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy env template
   cp .env.example .env.local
   
   # Fill in required variables:
   - DATABASE_URL (required)
   - CLERK keys (required)
   - GEMINI_API_KEY (required)
   - GEMINI_API_KEY_2, _3, _4, _5 (optional but recommended)
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate dev --name add_ai_response_cache
   # OR
   npx prisma db push
   
   # Verify
   npx prisma studio
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

---

## Feature 1: API Key Pool & Rotation

### Test: Key Rotation
1. Set only `GEMINI_API_KEY` in `.env.local`
2. Make 5 rapid API calls (e.g., run skill gap analysis 5 times)
3. **Expected:** All calls succeed using the single key

### Test: Multi-Key Pool
1. Add `GEMINI_API_KEY_2` and `GEMINI_API_KEY_3`
2. Restart server
3. Make 6 rapid API calls
4. Check server logs for: `⚠️ Gemini API rate limit hit on key X/Y. Rotating to next key...`
5. **Expected:** Calls rotate between keys, no user-facing errors

### Test: Graceful Degradation
1. Set an invalid key as `GEMINI_API_KEY_2`
2. Make API calls
3. **Expected:** System rotates to next valid key, user sees no error

**Status:** ✅ Pass / ❌ Fail

---

## Feature 2: Response Caching

### Test: Cache Save
1. Navigate to Dashboard → Skill Gap Analysis
2. Upload resume + job description
3. Click "Analyze Skills"
4. Check server console logs for: `💾 Cache SAVED for skill-gap (expires: 24h)`
5. Open Prisma Studio: `npx prisma studio`
6. Check `AIResponseCache` table has a new entry
7. **Expected:** Entry created with `featureType = "skill-gap"`

### Test: Cache Hit
1. Run the exact same skill gap analysis again (same resume + JD)
2. Check server logs for: `✅ Cache HIT for skill-gap`
3. **Expected:** Response returns instantly (no API call made)
4. Check `AIResponseCache` table → `hitCount` incremented

### Test: Cache Miss (Different Input)
1. Change the job description slightly
2. Run analysis again
3. **Expected:** New cache entry created (different hash)

### Test: Cache Expiration
1. In Prisma Studio, manually set an entry's `expiresAt` to yesterday
2. Try to retrieve that cached response
3. **Expected:** Cache miss, entry deleted automatically

### Test: Cache Cleanup Cron
1. Wait for 2 AM (or manually trigger Inngest function)
2. Check Inngest dashboard for `cleanupExpiredCache` execution
3. Check logs for: `🧹 Cleared X expired cache entries`
4. **Expected:** Old entries removed from database

**Status:** ✅ Pass / ❌ Fail

---

## Feature 3: ATS Resume Generator

### Test: Generate ATS Resume
1. Navigate to Dashboard → Skill Gap Analysis
2. Upload a real resume (or paste resume text)
3. Paste a real job description
4. Click "Analyze Skills"
5. Wait for results
6. Scroll to "Generate ATS-Optimized Resume" card
7. Click "Generate ATS-Optimized Resume"
8. **Expected:** After 5-10 seconds, structured resume appears with:
   - Name, contact info
   - Professional summary (tailored to JD)
   - Skills (missing skills incorporated)
   - Experience (bullet points enhanced)

### Test: Resume Download
1. After generation, click "Download as Text File"
2. **Expected:** `.txt` file downloads with properly formatted resume

### Test: Missing Skills Integration
1. Note which skills were marked as "Missing"
2. Check generated resume
3. **Expected:** Missing skills appear naturally in:
   - Professional summary
   - Experience descriptions
   - Skills section (prioritized at top)

### Test: Cache Behavior
1. Generate ATS resume
2. Generate again with exact same inputs
3. **Expected:** Cache is NOT used (featureType has TTL = 0)
4. Each generation is fresh and personalized

**Status:** ✅ Pass / ❌ Fail

---

## Feature 4: Hackathon Explorer

### Test: Load Hackathons
1. Navigate to Growth Tools → Explore Opportunities
2. Wait for hackathons tab to load
3. **Expected:** 
   - 10+ hackathon cards appear
   - Each shows: title, description, prize, deadline, source badge
   - "View Details" button opens external link

### Test: Relevance Ranking
1. Check your user profile skills (Dashboard)
2. Look at hackathon cards order
3. **Expected:** Hackathons matching your skills appear first

### Test: Devpost API
1. Check server logs for Devpost API call
2. **Expected:** No errors, 200 status
3. If Devpost fails, MLH fallback list still shows

**Status:** ✅ Pass / ❌ Fail

---

## Feature 5: Job Explorer

### Test: Load Jobs (No API Keys)
1. Don't set JSEARCH or ADZUNA keys
2. Navigate to Jobs tab
3. **Expected:** Fallback job board links appear (LinkedIn, WeWorkRemotely, etc.)

### Test: Load Jobs (With API Keys)
1. Set `JSEARCH_RAPIDAPI_KEY` in `.env.local`
2. Restart server
3. Navigate to Jobs tab
4. **Expected:** 
   - Real job listings from LinkedIn/Indeed/Glassdoor
   - Title, company, location, salary, apply link
   - "Apply Now" button works

### Test: Cold DM Generator
1. Click the 💬 button on any job card
2. Wait 5-10 seconds
3. **Expected:** 
   - Cold DM message appears below
   - Subject line + full message
   - "Copy" button works
   - "Find Recruiters on LinkedIn" button opens LinkedIn search with company name

### Test: Copy Message
1. Click "Copy" button on generated DM
2. Paste into a text editor
3. **Expected:** Full message copied correctly
4. Button shows checkmark briefly

**Status:** ✅ Pass / ❌ Fail

---

## Feature 6: GitHub Winning Repos

### Test: Load Repos (No Token)
1. Don't set GITHUB_TOKEN
2. Navigate to Winning Projects tab
3. **Expected:** 
   - 10-12 repos appear
   - Ranked by stars
   - Shows: name, description, stars, forks, language, topics

### Test: Load Repos (With Token)
1. Create GitHub personal access token
2. Set `GITHUB_TOKEN` in `.env.local`
3. Restart server
4. Navigate to Winning Projects tab
5. **Expected:** Same as above, but rate limit is 5000/hr instead of 60/hr

### Test: Skill-Based Search
1. Check your user skills (Dashboard)
2. Look at repo results
3. **Expected:** Repos match your tech stack (e.g., Python, React, etc.)

**Status:** ✅ Pass / ❌ Fail

---

## Feature 7: Navigation Integration

### Test: Explorer Link in Nav
1. Click "Growth Tools" dropdown in header
2. **Expected:** "Explore Opportunities" menu item appears with compass icon
3. Click it
4. **Expected:** Navigate to /explore page

**Status:** ✅ Pass / ❌ Fail

---

## Performance Tests

### Test: API Cost Reduction
1. Open Prisma Studio
2. Note current `AIResponseCache` count
3. Run 10 skill gap analyses with varied inputs
4. Check cache table again
5. **Expected:** 
   - 10 new entries created
   - Some repeat queries hit cache (faster response)
   - Total API calls < 10 (due to cache hits)

### Test: Load Time
1. Navigate to /explore
2. Open DevTools → Network tab
3. Reload page
4. **Expected:** 
   - Initial page load < 2s
   - API calls complete within 5s
   - No 500 errors

**Status:** ✅ Pass / ❌ Fail

---

## Error Handling Tests

### Test: Invalid API Key
1. Set `GEMINI_API_KEY` to an invalid value
2. Try to generate ATS resume
3. **Expected:** 
   - User sees error toast: "Failed to generate ATS resume. Please try again."
   - No crash, page remains usable

### Test: Network Timeout
1. Disconnect internet briefly
2. Try to load hackathons
3. **Expected:** 
   - Error toast appears
   - Graceful fallback or empty state

### Test: Missing Required Fields
1. Try to generate ATS resume without resume text
2. **Expected:** Error: "Resume and job description are required"

**Status:** ✅ Pass / ❌ Fail

---

## Final Verification

- [ ] All API routes respond (check `/api` endpoints)
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Database migrations applied successfully
- [ ] Prisma Studio shows all tables correctly
- [ ] Inngest cron jobs registered (check Inngest dashboard)
- [ ] All navigation links work
- [ ] Mobile responsive (test on phone or DevTools)
- [ ] Dark/light mode both work

---

## Reporting Issues

If any test fails:

1. **Check Logs:**
   - Browser console (F12)
   - Server terminal output
   - Prisma Studio for database state

2. **Common Fixes:**
   - Restart dev server after `.env` changes
   - Run `npx prisma generate` if schema changed
   - Clear browser cache
   - Check environment variables are set

3. **Document:**
   - Which test failed
   - Error message (exact text)
   - Steps to reproduce
   - Browser/OS info
