# Free API Credentials Setup Guide
## Complete Walkthrough for NicheValidator Full Version

---

## Overview

This guide walks you through obtaining ALL free API credentials needed for the NicheValidator full version. No credit card required for any of these services.

**Total Setup Time:** 30-45 minutes
**Total Monthly Cost:** $0

---

## API Credentials Needed

| API | Purpose | Difficulty | Time |
|-----|---------|------------|------|
| Google Cloud (Trends) | Search demand data | Easy | 5 min |
| AliExpress Open Platform | Supplier & product data | Medium | 10 min |
| Reddit | Community sentiment | Easy | 5 min |
| YouTube Data API | Video content analysis | Easy | 5 min |
| SerpApi (Free Tier) | Google search results | Easy | 5 min |

**Total Time: ~30-45 minutes**

---

## 1. Google Cloud Platform - Trends API

### Option A: Google Cloud API (Official - Recommended)

**What you get:** Real Google Trends data, official API access

**Steps:**

```
1. Go to: https://console.cloud.google.com/

2. Click "Get started for free" or "Sign in" if you have account

3. Create a new project:
   - Click "Select a project" dropdown
   - Click "New project"
   - Project name: "NicheValidator"
   - Click "Create"

4. Enable the Google Trends API:
   - In left sidebar, click "APIs & Services" > "Library"
   - Search for "Google Trends API"
   - Click "Google Trends API"
   - Click "Enable"

5. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key (looks like: AIzaSy...)

6. Set up billing (REQUIRED but FREE tier):
   - It asks for billing, but FREE tier gives you:
     - $0/month usage allowance
     - Sufficient for personal/small business use
   - You won't be charged unless you upgrade

7. Restrict your API key:
   - Click on your API key
   - Under "API restrictions", select "Google Trends API"
   - Under "Website restrictions", add your domain (optional)
   - Click "Save"
```

**Your API Key Format:** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Free Tier Limits:**
- 1,000 requests/day
- 10 requests/second

---

### Option B: PyTrends (Unofficial - Alternative)

**What you get:** Free, unlimited Google Trends data via Python library

**Why use this:** No API key needed, works out of the box

**Setup:**

```bash
# Install Python (if not installed)
# Download from: https://www.python.org/downloads/

# Install pytrends
pip install pytrends

# That's it - no API key required!
```

**Usage in our tool:** We'll use this server-side, so you don't need to configure anything.

---

## 2. AliExpress Open Platform API

**What you get:** Real product data, supplier info, pricing, shipping times

**Steps:**

```
1. Go to: https://openservice.aliexpress.com/

2. Click "Sign Up" (top right)
   - Use your AliExpress/Alibaba account
   - Or create new account

3. Create an App:
   - Go to "Developer Console" or "My Apps"
   - Click "Create App"
   - App Name: "NicheValidator"
   - App Type: "Dropshipping" or "E-commerce"
   - Description: "Product research tool for niche validation"

4. Get your credentials:
   - App Key (client_id)
   - App Secret (client_secret)

5. Configure your app:
   - Add your callback URL (we'll provide this)
   - Set permissions for:
     □ Product search
     □ Product detail
     □ Supplier info
     □ Order management (optional)

6. Generate Access Token:
   - Use the "Authorization" flow in their docs
   - Or contact their partner team for dropshipping access

7. Alternative: Use DSers Integration
   - Sign up for DSers (free): https://www.dsers.com/
   - DSers has built-in AliExpress API access
   - Much easier setup
```

**Important Notes:**
- AliExpress API requires business verification in some regions
- If denied, use DSers as intermediary (free tier available)
- We'll fallback to web scraping if API access is denied

---

## 3. Reddit API (Free)

**What you get:** Community discussions, sentiment, pain points

**Steps:**

```
1. Go to: https://www.reddit.com/prefs/apps

2. Click "Are you a developer? Create an app..."

3. Fill in the form:
   - Name: "NicheValidator"
   - App type: "script"
   - Description: "Analyzing niche discussions"
   - About URL: (leave blank or use https://example.com)
   - Redirect URI: http://localhost:8080

4. Click "Create app"

5. Copy your credentials:
   - CLIENT ID: The string under your app name
   - CLIENT SECRET: The secret shown after creation
   - Your Reddit username and password (for script apps)

6. Note: Script apps work with your personal account credentials
```

**Your Credentials:**
```
Client ID: (12-character string)
Client Secret: (27-character string)
Username: your_reddit_username
Password: your_reddit_password
```

**Free Tier:** 60 requests/minute (sufficient for our use)

---

## 4. YouTube Data API v3

**What you get:** Video counts, view data, channel info

**Steps:**

```
1. Go to: https://console.cloud.google.com/

2. Use the SAME project you created for Google Trends

3. Enable YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search "YouTube Data API v3"
   - Click "Enable"

4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - (Optional) Restrict to YouTube API

5. Copy your API Key

6. Quota Calculator:
   - Default: 10,000 units/day
   - Search query: 100 units
   - Video list: 1 unit
   - You can request quota increase if needed (free)
```

**Your API Key Format:** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Free Tier:** 10,000 units/day (≈ 100 niche searches)

---

## 5. TikTok Developer API (Limited)

**What you get:** Basic trending data (limited access)

**Note:** TikTok has VERY restricted API access. Most features require business partnership.

**Steps (Limited Access):**

```
1. Go to: https://developers.tiktok.com/

2. Create developer account

3. Apply for API access:
   - Not all developers get approved
   - Focus on "Content Posting API" or "Video Insights"
   - Full commerce API requires partnership

4. Alternative: Use third-party tools
   - Pentos: https://pentos.co/ (free tier)
   - TikBuddy: https://tikbuddy.com/ (free tier)
   - These aggregate TikTok data

5. Fallback: Manual TikTok search
   - We guide users to search manually
   - Tool prompts for manual verification
```

**Reality Check:** TikTok data is mostly unavailable via free API. We'll use manual prompts and web scraping alternatives.

---

## 6. SerpApi (Free Tier)

**What you get:** Scraped Google, Amazon, YouTube results with API

**Steps:**

```
1. Go to: https://serpapi.com/

2. Sign up for free account

3. Get your API key:
   - Dashboard shows your API key
   - Free tier: 100 searches/month

4. What you can search:
   - Google Shopping results
   - Amazon products
   - YouTube videos
   - Google Trends (manual check)

5. This is FALLBACK - use direct APIs first
```

**Free Tier:** 100 searches/month (use sparingly)

---

## 7. Amazon Data (No API Required)

**Reality:** Amazon PA-API requires Amazon Associates with 3+ sales

**Alternatives (All Free):**

```
A. Keepa Browser Extension (Recommended)
   - Install: https://keepa.com/#!download
   - Shows historical Amazon data
   - Free tier available

B. Jungle Scout Web App (Free Tier)
   - Sign up: https://www.junglescout.com/
   - Limited free searches per day

C. Helium 10 (Free Tier)
   - Sign up: https://www.helium10.com/
   - 5 free searches per day

D. AMZScout (Free Trial)
   - Sign up: https://amzscout.net/
   - Limited free access
```

**Our Approach:** We'll scrape publicly available Amazon pages and use these free tools' data.

---

## Summary: Your Credentials Checklist

After completing all steps, you should have:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREDENTIALS CHECKLIST                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Google Cloud Project                                        │
│     ├── Project ID: _______________________                      │
│     └── API Key: AIzaSy___________________________________     │
│                                                                  │
│  ✅ YouTube Data API                                            │
│     └── API Key: AIzaSy___________________________________     │
│        (Same as Google Cloud key)                               │
│                                                                  │
│  ⬜ AliExpress Open Platform                                   │
│     ├── App Key: _______________________                       │
│     ├── App Secret: _______________________                   │
│     └── Access Token: _______________________                   │
│     Note: May require business verification                     │
│                                                                  │
│  ⬜ Reddit App                                                 │
│     ├── Client ID: _______________________                    │
│     └── Client Secret: _______________________                 │
│                                                                  │
│  ✅ SerpApi (Optional)                                         │
│     └── API Key: _______________________                       │
│                                                                  │
│  ✅ Browser Extensions (Install on your browser)                │
│     ├── Keepa: https://keepa.com/#!download                    │
│     └── Keywords Everywhere: https://keywordseverywhere.com/   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Setup

Create a `.env` file in your project with these credentials:

```bash
# Google Cloud
GOOGLE_TRENDS_API_KEY=your_google_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# AliExpress (if approved)
ALIEXPRESS_APP_KEY=your_app_key
ALIEXPRESS_APP_SECRET=your_app_secret
ALIEXPRESS_ACCESS_TOKEN=your_access_token

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password

# Optional
SERPAPI_KEY=your_serpapi_key
```

---

## Next Steps After Getting Credentials

```
1. ✅ Get all credentials (30-45 min)

2. ✅ Install browser extensions:
   - Keepa (Chrome/Firefox)
   - Keywords Everywhere

3. ✅ Sign up for free tiers:
   - Jungle Scout
   - Helium 10

4. Contact me with your credentials

5. I'll integrate everything into the full version
```

---

## Troubleshooting

### Google Trends API Not Working
- Check billing is enabled (even on free tier)
- Verify API is enabled in console
- Check API key is correctly copied

### AliExpress API Denied
- Try DSers instead (easier integration)
- Use manual product research via browser
- We'll add web scraping fallback

### Reddit API Rate Limited
- Wait 1 hour, try again
- Script apps have higher limits
- Use cached data

### YouTube API Quota Exceeded
- Request quota increase (free)
- Spread requests over multiple days
- Use caching aggressively

---

**Ready to share your credentials?** Once you provide them, I'll build the full integration within 24-48 hours.
