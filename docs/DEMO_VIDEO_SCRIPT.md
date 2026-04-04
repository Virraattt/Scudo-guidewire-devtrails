# Scudo Phase 2 — 2-Minute Demo Video Script & Production Guide

## Video Overview

- **Duration:** 2 minutes (120 seconds)
- **Format:** Screen recording with voiceover
- **Platform:** YouTube / Vimeo (publicly accessible link)
- **Subtitles:** English
- **Resolution:** 1080p @ 30fps

---

## Full Script (120 seconds)

### [Scene 1: Title & Problem — 15 seconds]

**Visual:** Black background with Scudo logo (blue shield) + text overlay

**Voiceover:**
"Meet Rajesh. He's a delivery driver in Mumbai earning ₹1,200 a day. But his income doesn't depend on him alone. It depends on Mumbai's weather, traffic, air quality, and a dozen other things outside his control."

**Text on screen:**
- "12 million gig workers in India"
- "Zero employer protection"
- "Vulnerable to external shocks"

---

### [Scene 2: The Problem — 10 seconds]

**Visual:** Animation showing a rainy day in Mumbai + order graph dropping

**Voiceover:**
"When heavy rains hit, orders drop by 70%. When there's a bandh, none. When AQI spikes during winter, customers don't order. Rajesh's income disappears overnight."

**Text on screen:**
- "Cyclone: -80% income"
- "Bandh: -85% income"
- "AQI >500: -70% income"

---

### [Scene 3: Traditional Insurance Problem — 10 seconds]

**Visual:** Insurance claim form being filled, stuck in loop

**Voiceover:**
"Traditional insurance? Claims take weeks. Forms, assessors, investigations. By then, Rajesh's family has no money, his rent is due, and his patience is gone."

**Text on screen:**
- "No claim forms"
- "No assessors"
- "Paid by 7 AM tomorrow"

---

### [Scene 4: Scudo Solution Intro — 15 seconds]

**Visual:** App screen showing registration

**Voiceover:**
"This is Scudo. In 5 minutes, Rajesh registers. His delivery app already has 90 days of his earnings history. Scudo's AI calculates his personal risk profile: ₹19,500 annual income at risk. His weekly premium? ₹43.14."

**UI shown:**
- Phone number → Name → City → Platform → Done ✓
- Policy details slide
- "Risk: ₹19,500 | Weekly: ₹43.14"

---

### [Scene 5: Dynamic Pricing (ML) — 12 seconds]

**Visual:** Dashboard showing 3 drivers, 3 different premiums

**Voiceover:**
"But here's the AI part. Three drivers in Mumbai. Same city, different earnings, different activity. Rajesh with ₹1,200/day and 50 hours/week pays ₹43. Ankita with ₹1,000/day and 35 hours pays ₹25. Neha, part-time at ₹650/day, pays just ₹12. Same city, same risks, different premiums."

**UI shown:**
```
Rajesh: ₹1,200/day, 50h/week → Premium: ₹43
Ankita: ₹1,000/day, 35h/week → Premium: ₹25
Neha:   ₹650/day, 18h/week  → Premium: ₹12
```

---

### [Scene 6: Disruption Detection — 12 seconds]

**Visual:** 5 API icons appearing, each revealing data

**Voiceover:**
"Every 30 minutes, Scudo checks 5 automated sources. India Meteorological Department alerts. Air quality data. Delivery platform order volumes. Fuel prices. Government disruption alerts. Any one triggers an automatic claim."

**Icons shown:**
- 🌧️ IMD Weather Alerts
- 💨 CPCB AQI Levels
- 📦 Platform Order Volume
- ⛽ Fuel Price Changes
- 🚨 Civil Disruptions

---

### [Scene 7: The Disruption Day — 15 seconds]

**Visual:** Timeline of Tuesday morning — weather alert comes in, orders drop, app showing GPS

**Voiceover:**
"Tuesday morning. Heavy rain. IMD issues a Red alert. Orders on Swiggy drop 70%. Rajesh heads out anyway, works 4 hours, delivers 8 orders, earns ₹350 instead of normal ₹1,000. But Scudo is already working."

**Visual feedback:**
- 🚨 Alert notification from IMD
- 📉 Order volume graph dropping from 950 to 350/hour
- 📍 GPS dots showing 4 hours of work
- 📦 8 delivery icons

---

### [Scene 8: Automatic Claim Processing — 20 seconds]

**Visual:** Screen showing claim calculation breakdown**Voiceover:**
"The system automatically calculates the claim:

Income loss: ₹650
Base payout: 70% of loss = ₹455

Gate One: Compliance check. Rajesh worked 4 hours out of a required 3.2. He passes.
Gate Two: Minimum orders. He completed 8, minimum is 2. He passes.

Final payout: ₹455. Initiated by 7 AM."

**Math shown on screen:**
```
Expected: ₹1,000
Actual: ₹350
Loss: ₹650

Payout: 0.70 × 650 = ₹455
Compliance: 4h worked ÷ 3.2h required = 1.0x
Orders: 8 ≥ minimum of 2 ✓

APPROVED: ₹455
```

---

### [Scene 9: Instant Payout — 10 seconds]

**Visual:** Phone showing UPI notification, money transferred

**Voiceover:**
"By 7 AM Wednesday, ₹455 hits Rajesh's UPI account. No forms rejected. No appeals needed. No waiting. Just instant, automated, parametric insurance."

**UI shown:**
- WhatsApp message: "Your Scudo claim approved: ₹455 received"
- UPI bank notification: "+₹455"

---

### [Scene 10: The Impact — 8 seconds]

**Visual:** Rajesh at home with family, smiling, kids at school

**Voiceover:**
"His lost income is replaced. His family eats. His rent is paid. Tomorrow, he's back on the road, confident."

---

### [Scene 11: Feature Breakdown — 15 seconds]

**Visual:** Animated checklist of features

**Voiceover:**
"Scudo delivers all of this:

✓ Hyper-personalized premiums using AI
✓ 5 fully automated disruption triggers
✓ Zero-touch claims in 24 hours
✓ Transparent pricing drivers understand
✓ Fair pricing: lower rates for high-risk drivers
✓ Mobile-first, built for low-literacy workers"

**Text on screen:**
- ✓ AI Dynamic Pricing
- ✓ 5 Automated Triggers
- ✓ Zero-Touch Claims
- ✓ Instant Payouts
- ✓ Fair Pricing Model
- ✓ Mobile First

---

### [Scene 12: Closing Slide — 7 seconds]

**Visual:** Scudo branding, contact info

**Voiceover:**
"Scudo. Parametric income insurance for India's delivery workers. No paperwork. No assessors. No waiting."

**Text on screen:**
```
SCUDO
Zero-Friction Income Insurance

Website: www.scudo.dev
API Docs: docs.scudo.dev
GitHub: github.com/scudo/phase2
```

---

## Production Workflow

### Step 1: Screen Recording

**Setup:**
- Use OBS Studio (free) or ScreenFlow (Mac)
- Set resolution to 1920×1080
- Record at 30fps, H.264 codec
- Use external microphone (clear audio essential)

**Recording Sequence:**

```
Screen 1 (0-15s): Scudo logo on black, title text
  → Use video editing software to add this

Screen 2 (15-50s): Dashboard walkthrough
  → Log in to Scudo app
  → Show Dashboard → Policy → Claims pages
  → Slowly click through, pause on key metrics
  → Hover over tooltips

Screen 3 (50-80s): Pull up the 5 trigger APIs
  → Create a simple HTML/CSS showing:
    IMD Alert (animated)
    AQI Data (animated)
    Platform Orders (graph)
    Fuel Prices (chart)
    Civil Alert (notification)

Screen 4 (80-100s): Claim calculation
  → Use Google Sheets or similar to show calculation
  → Or screenshot from backend API response
  → Highlight the two gates

Screen 5 (100-127s): Final payout
  → Phone screenshot showing UPI notification
  → Or animated mockup

Closing (127-120s): Title card with Scudo branding
```

### Step 2: Audio Recording

**Best Practice:**
- Record voiceover separately (not live)
- Use Audacity (free) or Adobe Audition
- Record in quiet room
- Speak clearly, moderate pace (~140 words/minute)
- Add background music (royalty-free from Epidemic Sound / AudioJungle)

**Audio Levels:**
- Voiceover: -12dB
- Background music: -20dB (ducked during speech)
- Transitions: Use 2-second fade

### Step 3: Editing

**Software:** DaVinci Resolve (free) or Adobe Premiere

**Edit Sequence:**

1. Import screen recording
2. Import the voiceover track
3. Align voiceover with screen transitions (trim as needed)
4. Add text overlays at key moments:
   - Scene numbers
   - Statistics
   - Calculation breakdowns
5. Add lower-third graphics with metrics
6. Insert transition effects (fade, slide) between scenes
7. Add background music
8. Color grade: desaturate slightly, add subtle blue tint (Scudo brand color)

**Timeline Structure:**

```
Video Track 1: Screen Recording (1920×1080)
Video Track 2: Text Overlays & Graphics
Video Track 3: Transition Effects

Audio Track 1: Voiceover
Audio Track 2: Background Music
Audio Track 3: SFX (notification sound, etc.)
```

### Step 4: Export & Upload

**Export Settings:**
- Codec: H.264 (MP4)
- Resolution: 1920×1080
- Bitrate: 8-12 Mbps (YouTube recommended)
- Frame rate: 30fps
- Audio: AAC, 128kbps

**Upload Destinations:**

```
YouTube:
  Title: "Scudo Phase 2 Demo — Zero-Friction Income Insurance for Gig Workers"
  Description: [Paste detailed description below]
  Tags: gig workers, insurance, india, delivery, parametric
  Playlist: "Scudo Product Demos"
  Visibility: Public
  Thumbnail: Scudo logo + "2 Min Demo"

YouTube Description:
---
Scudo is an AI-enabled parametric income insurance platform for 
India's 12 million delivery workers.

This demo shows:
✓ AI-powered personalized premium calculation
✓ 5 automated disruption detection triggers (weather, AQI, platform, fuel, civil)
✓ Zero-touch automatic claims processing
✓ Instant payouts by 7 AM next morning

Key Features:
• Dynamic risk assessment using hyper-local factors
• Worker Activity Index (WAI) for fair pricing
• Transparent two-gate anti-fraud payout formula
• No claims forms, no assessors, no paperwork

Source Code: github.com/scudo/phase2
Documentation: docs.scudo.dev
Contact: hello@scudo.dev

Built for delivery workers. Built with ❤️ for India.
---

Vimeo:
  Same upload process, different platform
  Set to public, allow embedding
```

---

## Demo Video Checklist

Before uploading, verify:

- [ ] Audio is clear, voiceover at -12dB
- [ ] Video is sharp, no pixelation at 1080p
- [ ] All text is readable (minimum 18pt font)
- [ ] Transitions are smooth (no jump cuts)
- [ ] Timing: Exactly 2 minutes ± 2 seconds
- [ ] Total file size: <500MB
- [ ] Subtitles are synced (SRT file generated)
- [ ] Background music is royalty-free
- [ ] No personal data visible in screenshots (anonymize)
- [ ] Scudo branding consistent throughout
- [ ] Call-to-action clear (GitHub link, docs link)
- [ ] Preview video 3× before uploading

---

## Additional B-Roll Recommendations

To enhance visual storytelling, consider filming:

1. **Real delivery driver footage** (with consent):
   - Rider on two-wheeler in morning
   - Picking up order from restaurant
   - Rain sequence (or use licensed stock footage)
   - Handing delivery to customer
   - Evening return to home

2. **Mumbai cityscape:**
   - Aerial of delivery zones
   - Traffic during rush hour
   - Weather transitions
   - Monsoon rain footage

3. **UI interactions:**
   - Smooth scrolling through app
   - Clicking buttons with cursor
   - Form submissions
   - Data loading animations

**Stock Footage Sources:**
- Unsplash (free)
- Pexels (free)
- iStock (paid, high quality)
- Shutterstock (paid)

---

## Timing Breakdown

| Scene | Duration | Timestamp |
|-------|----------|-----------|
| Title | 15s | 0:00 |
| Problem | 10s | 0:15 |
| Insurance Issue | 10s | 0:25 |
| Solution Intro | 15s | 0:35 |
| Dynamic Pricing | 12s | 0:50 |
| Triggers | 12s | 1:02 |
| Disruption Day | 15s | 1:14 |
| Claim Processing | 20s | 1:29 |
| Payout | 10s | 1:49 |
| Impact | 8s | 1:59 |
| Closing | 7s | 2:07 |
| **TOTAL** | **120s** | **2:00** |

---

## Tips for Professional Quality

1. **Lighting:** Record in well-lit room, avoid glare on screen
2. **Audio:** Use external USB microphone (Blue Yeti, Rode), not laptop mic
3. **Pacing:** Slow down voiceover slightly (120 words/min is comfortable)
4. **Color:** Use Scudo brand blue (#001d4d) consistently
5. **Font:** Sans-serif (Segoe UI, Inter) for digital feel
6. **Music:** Choose energetic but not distracting background track
7. **Graphics:** Keep animations to 0.5-1 second (don't overdo)
8. **Call-to-Action:** End with clear next steps (GitHub, docs, website)

---

## Legal/Compliance Notes

- [ ] Ensure all data shown is anonymized (no real phone numbers/names)
- [ ] Use only royalty-free music & sound effects
- [ ] Disclaimer: "Demo uses simulated data for illustration" (if using mock APIs)
- [ ] Add subtitle option for accessibility
- [ ] If including real footage: get model releases from drivers

---

## Final Checklist Before Publishing

```
✓ Video is 1:58-2:02 duration
✓ Audio levels normalized (-12dB voiceover, -20dB music)
✓ Captions/subtitles included in video
✓ YouTube/Vimeo metadata filled out
✓ Thumbnail created & uploaded
✓ Description links to GitHub/docs
✓ Tags relevant to search
✓ Privacy: No PII visible, only demo data
✓ File backed up locally before upload
✓ Tested playback on multiple devices
✓ Mobile view verified (looks good on phone)
```

---

## Success Metrics

**After upload, track:**

- Views (target: >500 in first week)
- Click-through to GitHub (target: >10% CTR)
- Shares/embeds on social media
- Watch time (should be high, indicating engagement)
- Comments sentiment (should be positive)
- Traffic to docs.scudo.dev from video description link

---

*Last Updated: April 2026*  
*Scudo Phase 2 — Demo Video Production Guide*
