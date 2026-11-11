# Roadmap: New Rang Rangoli

## Overview

Implement a free, zero-cost automated WhatsApp messaging and 4-digit doorstep delivery OTP verification system for New Rang Rangoli. This milestone replaces third-party API dependencies with `whatsapp-web.js` (LocalAuth QR login) linked to owner Kishor Jamdade (+91 70576 17451), generates and stores 4-digit OTPs with expiration and retry limits at order creation, equips delivery agents and store admins with verification controls, and supports full bilingual English and Marathi translations.

## Phases

- [x] **Phase 1: Free Automated WhatsApp Gateway & 4-Digit Delivery OTP System** - End-to-end implementation of headless WhatsApp Web gateway, order summary dispatch with 4-digit OTP, expiration checks, admin verification UI, and bilingual translations.

---

## Phase Details

### Phase 1: Free Automated WhatsApp Gateway & 4-Digit Delivery OTP System

**Goal**: Establish a zero-cost WhatsApp messaging automation gateway using `whatsapp-web.js` for Kishor Jamdade (+91 70576 17451), dispatch itemized order summaries with a secure 4-digit delivery verification OTP upon order placement, enforce OTP expiration and attempt limits, provide admin delivery verification and QR management interfaces, and update bilingual translations.

**Depends on**: Existing order and admin infrastructure.  
**Requirements**: REQ-WA-01, REQ-WA-02, REQ-WA-03, REQ-OTP-01, REQ-OTP-02, REQ-OTP-03, REQ-I18N-01  
**Success Criteria**:
1. Store admin can view QR code in Admin Dashboard, scan it with Kishor Jamdade's WhatsApp, and see connection status transition to "Connected".
2. When an order is created, the customer receives an itemized WhatsApp order receipt and a 4-digit OTP from Kishor Jamdade (+91 70576 17451).
3. Kishor Jamdade receives an instant owner order alert on his personal WhatsApp (+91 70576 17451) for every incoming order.
4. The 4-digit OTP expires after 24 hours, locks after 5 incorrect attempts, and can be regenerated/resent by an admin.
5. Entering the valid 4-digit OTP in the Admin Order Details marks the order as "Delivered", verifies payment for COD, and sends a delivery confirmation WhatsApp message.
6. All UI elements, statuses, and notices render fluently in both English and Marathi.

**Plans**: 3 plans (All Completed)

Plans:
- [x] **01-01**: `whatsapp-web.js` service with `LocalAuth` QR lifecycle, connection state management, Kishor Jamdade profile, and admin status endpoints.
- [x] **01-02**: 4-digit OTP schema with expiration timestamp, auto-generation on order placement, WhatsApp dispatch, and verification endpoint.
- [x] **01-03**: Delivery verification UI in `OrderDetailModal`, WhatsApp QR pairing card in `AdminDashboardPage`, `OrderSuccessPage` notification, and bilingual translations in `translations.js`.
