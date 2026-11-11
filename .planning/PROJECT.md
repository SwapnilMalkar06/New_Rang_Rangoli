# New Rang Rangoli

## What This Is

New Rang Rangoli is a modern e-commerce web platform for authentic Indian festive rangoli colors, stencils, portrait shades, and wholesale powders. Owned and managed by **Kishor Jamdade** (+91 70576 17451), the system serves retail households, festival celebrants, and bulk wholesale shopkeepers with bilingual English and Marathi interfaces, cart and checkout flows, online and Cash-on-Delivery payment, and administrative order management.

## Core Value

Provide a free, highly reliable, and authentic Indian festive commerce experience with automated WhatsApp messaging and customer delivery verification directly connecting customers with Kishor Jamdade's workshop.

## Owner Profile

- **Owner**: Kishor Jamdade
- **Business WhatsApp**: `+91 70576 17451`
- **Location & Brand**: New Rang Rangoli - Colors of Indian Tradition

## Requirements

### Validated

- Retail and wholesale product catalogs with dynamic filtering, cart, and bilingual support (EN/MR).
- Admin dashboard with order management, color inventory management, and price adjustment.
- Razorpay and Cash-on-Delivery (COD) checkout pipelines.

### Active (Milestone 1: Free Automated WhatsApp & 4-Digit Delivery OTP System)

- [ ] **REQ-WA-01**: Automated WhatsApp order confirmation and itemized receipt dispatch on order creation sent directly from Kishor Jamdade's WhatsApp (+91 70576 17451) without paid third-party API costs.
- [ ] **REQ-WA-02**: Headless `whatsapp-web.js` service with `LocalAuth` session persistence and admin QR pairing dashboard for Kishor Jamdade.
- [ ] **REQ-WA-03**: Automated real-time owner order notification alert sent directly to Kishor Jamdade (+91 70576 17451) whenever a new order is received.
- [ ] **REQ-OTP-01**: Secure 4-digit delivery verification OTP generated upon order placement.
- [ ] **REQ-OTP-02**: OTP storage with expiration window (24 hours) and brute-force attempt limits (max 5 attempts).
- [ ] **REQ-OTP-03**: Secure delivery verification endpoint and modal UI in admin order details for delivery agents.
- [ ] **REQ-I18N-01**: Complete bilingual English and Marathi translations in `translations.js` for OTP status, verification, and WhatsApp states.

### Out of Scope

- Paid Meta Cloud API or Twilio WhatsApp credits (must use free `whatsapp-web.js` with local QR authentication).
- Customer self-delivery verification (verification is conducted by delivery agents / store admins with the customer's OTP).
- SMS gateways (all instant communication routed over WhatsApp).

## Context

- **Tech Stack**: React 18 + Vite frontend (Tailwind CSS, Redux Toolkit, Lucide icons), Node.js + Express backend (CommonJS), MongoDB + Mongoose.
- **Business Contact**: Kishor Jamdade (+91 70576 17451).
- **Session Auth**: `LocalAuth` stores browser cookies and session keys in `./.wwebjs_auth` directory across server restarts.

## Constraints

- **Budget**: Zero API costs ($0) for messaging by utilizing WhatsApp Web browser automation.
- **Node.js**: Windows & Linux headless Chrome compatibility via Puppeteer args (`--no-sandbox`, `--disable-setuid-sandbox`).
- **Security**: 4-digit OTP must have rate limiting (attempts) and expiration (24h) to avoid brute forcing.

## Key Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `whatsapp-web.js` with `LocalAuth` | Avoids expensive Meta Cloud API or Twilio monthly per-message billing for small-to-medium Indian retail operations. | Session credentials stored locally in `.wwebjs_auth`. One-time QR scan required by Kishor Jamdade. |
| 4-digit OTP (1000–9999) | Short, easy to read and dictate over doorstep delivery compared to 6-digit codes. | Requires strict attempt limit (5 attempts) and expiration timestamp to preserve security. |
| Dual dispatch upon order creation | Customer receives itemized receipt + 4-digit OTP; Kishor Jamdade receives instant owner order alert on +91 70576 17451. | Keeps both customer and owner immediately informed in real-time. |
