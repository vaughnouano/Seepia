<div align="center">

# 📸 Seepia Rentals

### Renting a camera shouldn't feel like a scavenger hunt.

**See what's actually available. Book it in minutes. Skip the back-and-forth.**

[🌐 Visit Seepia Rentals](https://seepia-nextjs.vercel.app)

</div>

---

## The Problem With Renting a Camera the Old Way

If you've ever tried to rent a camera through a Facebook Marketplace listing, you know the drill:

- Message the seller and wait for a reply
- Ask if your dates are even available
- Fill out a form by hand, take a photo of it, send it over chat
- Hope nobody double-books the same weekend
- Wait, and wait, and wait some more

It's slow for renters, and it's chaos for the business trying to keep track of who's booked what, on which camera, with which ID on file.

**Seepia Rentals fixes that.**

## What Seepia Rentals Gives You

### See exactly what's free — instantly
No more asking "is this date open?" The calendar shows real-time availability for every camera, so renters know immediately what they can book — no waiting on a reply.

### Book in one smooth flow
Pick your dates, fill out one clean form, sign digitally with your finger or mouse, and you're done. No printing, no scanning, no clunky screenshots sent through Messenger.

### Verified renters, safer business
Every booking comes with ID verification and a digital signature — built in from the start, not bolted on. The business gets peace of mind; renters get a process that actually feels legitimate.

### No accounts, no friction
Renters don't need to sign up for anything. No passwords to remember, no app to download. Just show up, book, and go take great photos.

### Built for a real, growing rental business
This isn't a generic template — it's a purpose-built platform designed around how a camera rental business actually operates: return-day buffers so gear isn't double-booked before it's even back, tiered pricing for short vs. extended rentals, and an admin view built for a real owner reviewing real submissions.

## Who This Is For

Seepia Rentals was built for **Seepia**, a small camera rental business — but the idea behind it is simple and portable: any small rental business drowning in DMs and spreadsheets deserves a real booking system, not a workaround.

## See It Live

👉 **[seepia-nextjs.vercel.app](https://seepia-nextjs.vercel.app)**

Browse the camera catalog, try picking a date range, and see the booking flow end to end.

---

<div align="center">

*Built to make renting gear feel as easy as it should have been all along.*

</div>

---

<details>
<summary><strong>🛠️ For developers — technical details</strong></summary>

<br>

**Stack:** Next.js 14 (App Router) · Supabase (Postgres, Row-Level Security, Auth, Storage) · Vercel

**Architecture highlights:**
- Row-Level Security on every table — anonymous visitors can only insert bookings and read non-sensitive availability data
- Private Storage bucket for ID photos and signatures, accessed only via short-lived signed URLs
- Server-side revalidation of age eligibility, pricing, and required fields — nothing sensitive is trusted from the client
- In-browser digital signature capture via `react-signature-canvas`

**Local setup:**

```bash
git clone https://github.com/vaughnouano/seepia-nextjs.git
cd seepia-nextjs
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev
```

**Roadmap:** admin approval dashboard, route-protected admin login, scheduled cleanup of past bookings, mobile-responsive layout, late-return penalty logic.

</details>
