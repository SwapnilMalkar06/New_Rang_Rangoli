/**
 * WhatsApp Web Automation Gateway for New Rang Rangoli
 * Powered by whatsapp-web.js with LocalAuth session persistence
 * Store Owner: Kishor Jamdade (+91 70576 17451)
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const OWNER_NAME = process.env.OWNER_NAME || 'Kishor Jamdade';
const OWNER_PHONE = process.env.OWNER_PHONE || '+91 70576 17451';
const NORMALIZED_OWNER_PHONE = '917057617451';

// Session directory in workspace root (or /tmp if running in serverless environment like Vercel)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const AUTH_DIR = isServerless 
  ? path.join('/tmp', '.wwebjs_auth') 
  : path.resolve(__dirname, '../../.wwebjs_auth');

// Format phone number to clean digits (e.g. 917057617451)
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('0')) return `91${cleaned.slice(1)}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned;
  return cleaned;
};

// Convert phone number to WhatsApp Web JID (e.g. 917057617451@c.us)
const toChatId = (phone) => {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return null;
  return `${formatted}@c.us`;
};

class WhatsAppWebService {
  constructor() {
    this.client = null;
    this.status = 'DISCONNECTED'; // INITIALIZING, QR_READY, AUTHENTICATED, READY, DISCONNECTED, AUTH_FAILURE
    this.latestQrCodeDataUrl = null;
    this.latestQrRaw = null;
    this.qrGeneratedAt = null;
    this.clientInfo = null;
    this.readyAt = null;
    this.reconnectTimer = null;
    this.isInitializing = false;
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      lastSentAt: null
    };
  }

  /**
   * Initialize the headless WhatsApp Web client
   */
  async initialize() {
    if (this.isInitializing || this.status === 'READY') {
      return this.getStatus();
    }

    this.isInitializing = true;
    this.status = 'INITIALIZING';
    console.log(`[WhatsApp Web] Initializing client for owner ${OWNER_NAME} (${OWNER_PHONE})...`);

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: AUTH_DIR
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      // 1. QR Code Event
      this.client.on('qr', async (qr) => {
        try {
          this.status = 'QR_READY';
          this.latestQrRaw = qr;
          this.qrGeneratedAt = new Date();
          this.latestQrCodeDataUrl = await qrcode.toDataURL(qr, {
            margin: 2,
            scale: 7,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          console.log(`\n======================================================`);
          console.log(`📲 [WHATSAPP WEB - SCAN QR CODE]`);
          console.log(`Please scan using Kishor Jamdade's phone (${OWNER_PHONE}):`);
          console.log(`WhatsApp -> Linked Devices -> Link a Device`);
          console.log(`======================================================\n`);
        } catch (err) {
          console.error('[WhatsApp Web] Error generating QR Data URL:', err.message);
        }
      });

      // 2. Authenticated Event
      this.client.on('authenticated', () => {
        this.status = 'AUTHENTICATED';
        console.log('[WhatsApp Web] Session authenticated successfully.');
      });

      // 3. Ready Event
      this.client.on('ready', () => {
        this.status = 'READY';
        this.latestQrCodeDataUrl = null;
        this.latestQrRaw = null;
        this.readyAt = new Date();
        this.isInitializing = false;

        const info = this.client.info || {};
        this.clientInfo = {
          pushname: info.pushname || OWNER_NAME,
          user: info.wid?.user || NORMALIZED_OWNER_PHONE,
          phone: info.wid?.user ? `+${info.wid.user}` : OWNER_PHONE,
          platform: info.platform || 'web'
        };

        console.log(`✅ [WhatsApp Web] Service is READY! Connected as ${this.clientInfo.pushname} (${this.clientInfo.phone})`);
      });

      // 4. Auth Failure Event
      this.client.on('auth_failure', (msg) => {
        this.status = 'AUTH_FAILURE';
        this.isInitializing = false;
        this.clientInfo = null;
        console.error('[WhatsApp Web] Authentication failure:', msg);
      });

      // 5. Disconnected Event
      this.client.on('disconnected', (reason) => {
        this.status = 'DISCONNECTED';
        this.isInitializing = false;
        this.clientInfo = null;
        console.warn(`[WhatsApp Web] Client disconnected (reason: ${reason}). Scheduling reconnect in 10s...`);

        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.initialize();
        }, 10000);
      });

      // Start client without blocking server startup
      this.client.initialize().catch((initErr) => {
        console.error('[WhatsApp Web] Client initialization error:', initErr.message);
        this.status = 'DISCONNECTED';
        this.isInitializing = false;
      });

    } catch (error) {
      console.error('[WhatsApp Web] Failed to instantiate Client:', error.message);
      this.status = 'DISCONNECTED';
      this.isInitializing = false;
    }

    return this.getStatus();
  }

  /**
   * Get current connection status and QR code
   */
  getStatus() {
    return {
      status: this.status,
      ready: this.status === 'READY',
      qrCode: this.latestQrCodeDataUrl,
      qrGeneratedAt: this.qrGeneratedAt,
      clientInfo: this.clientInfo,
      readyAt: this.readyAt,
      ownerName: OWNER_NAME,
      ownerPhone: OWNER_PHONE,
      stats: this.stats
    };
  }

  /**
   * Restart the WhatsApp Web client
   */
  async restart() {
    console.log('[WhatsApp Web] Restarting WhatsApp client...');
    try {
      if (this.client) {
        await this.client.destroy().catch(() => {});
      }
    } catch (e) {
      // Ignore destroy error
    }
    this.client = null;
    this.status = 'DISCONNECTED';
    this.isInitializing = false;
    return this.initialize();
  }

  /**
   * Logout and clear session for fresh QR pairing
   */
  async logout() {
    console.log('[WhatsApp Web] Logging out session...');
    try {
      if (this.client) {
        await this.client.logout().catch(() => {});
        await this.client.destroy().catch(() => {});
      }
    } catch (e) {
      // Ignore logout errors
    }

    this.client = null;
    this.status = 'DISCONNECTED';
    this.clientInfo = null;
    this.latestQrCodeDataUrl = null;
    this.isInitializing = false;

    // Remove auth folder if exists
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        console.log('[WhatsApp Web] Cleared auth credentials in:', AUTH_DIR);
      }
    } catch (rmErr) {
      console.warn('[WhatsApp Web] Notice clearing auth directory:', rmErr.message);
    }

    return this.initialize();
  }

  /**
   * Send a raw message to a recipient
   */
  async sendRawMessage(to, message) {
    const chatId = toChatId(to);
    const normalizedDigits = formatPhoneNumber(to);

    if (!chatId) {
      console.warn('[WhatsApp Web] Invalid recipient phone number:', to);
      return { success: false, error: 'Invalid recipient phone number' };
    }

    // 1. Live WhatsApp Web Dispatch (When connected)
    if (this.status === 'READY' && this.client) {
      try {
        const response = await this.client.sendMessage(chatId, message);
        this.stats.totalSent += 1;
        this.stats.lastSentAt = new Date();
        console.log(`[WhatsApp Web] Message sent to +${normalizedDigits} (ID: ${response.id?._serialized || 'ok'})`);
        return {
          success: true,
          simulated: false,
          to: normalizedDigits,
          chatId,
          sentAt: new Date()
        };
      } catch (sendErr) {
        console.error(`[WhatsApp Web] Failed to send message to +${normalizedDigits}:`, sendErr.message);
        this.stats.totalFailed += 1;
      }
    }

    // 2. Graceful Fallback Dispatcher
    const waDirectLink = `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(message)}`;
    console.log('\n======================================================');
    console.log(`📱 [WHATSAPP FALLBACK - SESSION PENDING/DISCONNECTED]`);
    console.log(`From Owner:   ${OWNER_NAME} (${OWNER_PHONE})`);
    console.log(`To Recipient: +${normalizedDigits}`);
    console.log('------------------------------------------------------');
    console.log(message);
    console.log('------------------------------------------------------');
    console.log(`👉 Direct wa.me link: ${waDirectLink}`);
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      fallback: true,
      to: normalizedDigits,
      directChatUrl: waDirectLink,
      sentAt: new Date()
    };
  }

  /**
   * Send itemized order summary and 4-digit Delivery OTP to Customer
   * AND send instant owner alert to Kishor Jamdade (+91 70576 17451)
   */
  async sendOrderSummaryAndOtp(order, otpCode) {
    if (!order || !order.customerPhone) return null;

    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const itemsText = (order.items || [])
      .map((item, idx) => `  ${idx + 1}. *${item.name}* ${item.selectedWeight ? `(${item.selectedWeight})` : ''} × ${item.quantity} = ₹${((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}`)
      .join('\n');

    const paymentInfo = order.paymentMethod === 'Razorpay' || order.paymentStatus === 'Paid'
      ? '✅ Online Payment Received (Paid)'
      : `💵 Cash on Delivery (Pay ₹${Number(order.totalPrice || 0).toFixed(2)} upon delivery)`;

    // Message for customer
    const customerMessage =
`🌸 *NEW RANG RANGOLI - ORDER CONFIRMATION & DELIVERY OTP* 🌸

Namaste *${order.customerName}*! 🙏
Thank you for your order with New Rang Rangoli! Our workshop is packing your vibrant festive materials.

📋 *Order Details:*
• *Order ID:* #${orderNum}
• *Total Amount:* ₹${Number(order.totalPrice || 0).toFixed(2)}
• *Payment:* ${paymentInfo}
• *Delivery Address:* ${order.shippingAddress}

🛒 *Items Ordered:*
${itemsText}

🔑 *YOUR SECRET 4-DIGIT DELIVERY OTP:*
┏━━━━━━━━━━━━━━━━━━━┓
┃       👉  *${otpCode}*  👈       ┃
┗━━━━━━━━━━━━━━━━━━━┛
⚠️ *Important:* Share this 4-digit OTP (*${otpCode}*) with the delivery partner *ONLY* after inspecting and receiving your package at your doorstep.

📞 *Owner & Helpline:* ${OWNER_NAME} (${OWNER_PHONE})
_New Rang Rangoli - Colors of Indian Tradition_`;

    // 1. Dispatch to customer
    const custResult = await this.sendRawMessage(order.customerPhone, customerMessage);

    // 2. Dispatch instant alert to Owner (Kishor Jamdade)
    try {
      const ownerAlertMessage =
`🚨 *NEW ORDER ALERT - NEW RANG RANGOLI* 🚨

Namaste *${OWNER_NAME}*! A new order has been placed:

📋 *Order Reference:* #${orderNum}
👤 *Customer:* ${order.customerName}
📞 *Phone:* +${formatPhoneNumber(order.customerPhone)}
📍 *Address:* ${order.shippingAddress}
💰 *Total Value:* ₹${Number(order.totalPrice || 0).toFixed(2)} (${order.paymentMethod})
🔑 *4-Digit Delivery OTP:* *${otpCode}*

🛒 *Items (${(order.items || []).length}):*
${itemsText}

_Dispatched automatically via New Rang Rangoli Store System_`;

      await this.sendRawMessage(NORMALIZED_OWNER_PHONE, ownerAlertMessage);
    } catch (ownerErr) {
      console.error('[WhatsApp Web] Error sending alert to owner:', ownerErr.message);
    }

    return custResult;
  }

  /**
   * Resend 4-digit Delivery OTP to Customer WhatsApp
   */
  async sendDeliveryOtp(order, otpCode) {
    if (!order || !order.customerPhone) return null;

    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const text =
`🚨 *NEW RANG RANGOLI - DELIVERY VERIFICATION OTP* 🚨

Namaste *${order.customerName}*! 🙏
Your order *#${orderNum}* is *OUT FOR DELIVERY* today!

🔑 *YOUR 4-DIGIT DELIVERY OTP:*
┏━━━━━━━━━━━━━━━━━━━┓
┃       👉  *${otpCode}*  👈       ┃
┗━━━━━━━━━━━━━━━━━━━┛

⚠️ *INSTRUCTIONS:*
1. Delivery address: _${order.shippingAddress}_
2. Please verify your items upon arrival.
3. *Provide this 4-digit OTP (${otpCode}) to the delivery partner only upon receiving your package.*
${order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' ? `💵 *Amount to Pay on Delivery (COD):* ₹${Number(order.totalPrice || 0).toFixed(2)}\n` : ''}
📞 *Owner & Helpline:* ${OWNER_NAME} (${OWNER_PHONE})
_New Rang Rangoli - Colors of Indian Tradition_`;

    return this.sendRawMessage(order.customerPhone, text);
  }

  /**
   * Successful Delivery Confirmation
   */
  async sendDeliveryConfirmed(order) {
    if (!order || !order.customerPhone) return null;

    const orderNum = order._id.toString().slice(-6).toUpperCase();
    const deliveryTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const text =
`🎉 *NEW RANG RANGOLI - PARCEL DELIVERED!* 🎉

Namaste *${order.customerName}*! 🙏
Your order *#${orderNum}* has been *DELIVERED & VERIFIED* successfully with your 4-digit OTP at ${deliveryTime}!

✅ *Delivery Status:* OTP Verified & Completed
📦 *Items Delivered:* ${(order.items || []).length} product(s)
💰 *Total Amount:* ₹${Number(order.totalPrice || 0).toFixed(2)}

Thank you for choosing New Rang Rangoli! We hope our authentic festive colors bring prosperity, joy, and beauty to your celebrations. 🌺✨

📸 _Send pictures of your beautiful rangoli designs to our WhatsApp at *${OWNER_PHONE}*!_

📞 *Customer Support:* ${OWNER_NAME} (${OWNER_PHONE})`;

    // Send to customer
    const custResult = await this.sendRawMessage(order.customerPhone, text);

    // Quick ping to owner
    try {
      const ownerDeliveredPing = `✅ *ORDER #${orderNum} DELIVERED!* Customer: ${order.customerName} (+${formatPhoneNumber(order.customerPhone)}). Amount: ₹${Number(order.totalPrice || 0).toFixed(2)} (OTP Verified).`;
      await this.sendRawMessage(NORMALIZED_OWNER_PHONE, ownerDeliveredPing);
    } catch (e) {}

    return custResult;
  }
}

// Export singleton instance
const whatsappWebService = new WhatsAppWebService();

module.exports = whatsappWebService;
module.exports.OWNER_NAME = OWNER_NAME;
module.exports.OWNER_PHONE = OWNER_PHONE;
module.exports.formatPhoneNumber = formatPhoneNumber;
module.exports.toChatId = toChatId;
