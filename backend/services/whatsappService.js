/**
 * WhatsApp Messaging Gateway Service for New Rang Rangoli
 * Business WhatsApp Number: +91 70576 17451
 */

const https = require('https');
const http = require('http');

const BUSINESS_WHATSAPP_PHONE = process.env.WHATSAPP_BUSINESS_PHONE || '+91 70576 17451';
const DISPLAY_BUSINESS_PHONE = '+91 70576 17451';

/**
 * Format phone number into standard international format without '+' for WhatsApp (e.g. 917057617451)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Strip all non-digits
  const cleaned = phone.toString().replace(/\D/g, '');

  // If 10 digits (Standard Indian Mobile Number), prepend country code 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  // If 11 digits and starts with 0, replace 0 with 91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `91${cleaned.slice(1)}`;
  }

  // If already starts with 91 and has 12 digits
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }

  return cleaned;
};

/**
 * Dispatches a WhatsApp message using Meta WhatsApp Cloud API or Twilio or graceful simulated logger
 */
const sendRawMessage = async ({ to, message, messageType = 'NOTIFICATION', orderId = '' }) => {
  const normalizedTo = formatPhoneNumber(to);
  if (!normalizedTo) {
    console.warn('[WhatsApp Gateway] Invalid recipient phone number:', to);
    return { success: false, error: 'Invalid recipient phone number' };
  }

  const metaToken = process.env.WHATSAPP_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // 1. Meta WhatsApp Cloud API (Official)
  if (metaToken && metaPhoneId && metaToken !== 'placeholder_token') {
    try {
      const payload = JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'text',
        text: { preview_url: false, body: message }
      });

      const options = {
        hostname: 'graph.facebook.com',
        path: `/v18.0/${metaPhoneId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
            } catch (err) {
              resolve({ statusCode: res.statusCode, body: data });
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`[WhatsApp Gateway] Meta Cloud API message sent to +${normalizedTo}`);
        return { success: true, simulated: false, provider: 'meta', response: response.body };
      } else {
        console.error('[WhatsApp Gateway] Meta Cloud API returned error:', response.body);
      }
    } catch (metaErr) {
      console.error('[WhatsApp Gateway] Error calling Meta Cloud API:', metaErr.message);
    }
  }

  // 2. Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || `whatsapp:${formatPhoneNumber(BUSINESS_WHATSAPP_PHONE)}`;

  if (twilioSid && twilioAuth && twilioSid.startsWith('AC')) {
    try {
      const postData = new URLSearchParams({
        From: twilioFrom,
        To: `whatsapp:+${normalizedTo}`,
        Body: message
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`[WhatsApp Gateway] Twilio message sent to +${normalizedTo}`);
        return { success: true, simulated: false, provider: 'twilio', response: response.body };
      }
    } catch (twilioErr) {
      console.error('[WhatsApp Gateway] Twilio API error:', twilioErr.message);
    }
  }

  // 3. Graceful Simulation & Development Dispatcher
  // When live cloud tokens are pending, this logs the message cleanly and provides a clickable WhatsApp web link
  const waDirectLink = `https://wa.me/${normalizedTo}?text=${encodeURIComponent(message)}`;
  
  console.log('\n======================================================');
  console.log('📱 [WHATSAPP BUSINESS GATEWAY - MESSAGE DISPATCHED]');
  console.log(`From Business No: ${DISPLAY_BUSINESS_PHONE}`);
  console.log(`To Customer:      +${normalizedTo}`);
  console.log(`Notification:     ${messageType}`);
  if (orderId) console.log(`Order Reference:  #${orderId.toString().slice(-6).toUpperCase()}`);
  console.log('------------------------------------------------------');
  console.log(message);
  console.log('------------------------------------------------------');
  console.log(`👉 Direct WhatsApp Link: ${waDirectLink}`);
  console.log('======================================================\n');

  return {
    success: true,
    simulated: true,
    to: normalizedTo,
    directChatUrl: waDirectLink,
    messageType,
    sentAt: new Date()
  };
};

/**
 * 1. Order Confirmation WhatsApp Message
 */
const sendOrderConfirmation = async (order) => {
  if (!order || !order.customerPhone) return null;

  const orderNum = order._id.toString().slice(-6).toUpperCase();
  const itemsText = (order.items || [])
    .map((item, idx) => `  ${idx + 1}. *${item.name}* ${item.selectedWeight ? `(${item.selectedWeight})` : ''} × ${item.quantity} = ₹${((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}`)
    .join('\n');

  const paymentInfo = order.paymentMethod === 'Razorpay' || order.paymentStatus === 'Paid'
    ? '✅ Online Payment Received (Paid)'
    : '💵 Cash on Delivery (Pay ₹' + Number(order.totalPrice || 0).toFixed(2) + ' on receipt)';

  const text = 
`🌸 *NEW RANG RANGOLI - ORDER CONFIRMATION* 🌸

Namaste *${order.customerName}*! 🙏
Thank you for ordering with New Rang Rangoli! We have successfully received your order and our workshop is packing your vibrant rangoli materials.

📋 *Order Details:*
• *Order ID:* #${orderNum}
• *Total Amount:* ₹${Number(order.totalPrice || 0).toFixed(2)}
• *Payment:* ${paymentInfo}
• *Delivery Address:* ${order.shippingAddress}

🛒 *Items Ordered:*
${itemsText}

We will notify you on WhatsApp as soon as your parcel is dispatched!

📞 *Business Helpline (WhatsApp):* ${DISPLAY_BUSINESS_PHONE}
_New Rang Rangoli - Colors of Indian Tradition_`;

  return sendRawMessage({
    to: order.customerPhone,
    message: text,
    messageType: 'ORDER_CONFIRMATION',
    orderId: order._id
  });
};

/**
 * 2. Order Status Update WhatsApp Message
 */
const sendStatusUpdate = async (order, newStatus, customNote = '') => {
  if (!order || !order.customerPhone) return null;

  const orderNum = order._id.toString().slice(-6).toUpperCase();

  let statusExplanation = '';
  switch (newStatus) {
    case 'Processing':
      statusExplanation = '✨ Your rangoli items are being carefully hand-packed and prepared at our workshop.';
      break;
    case 'Shipped':
      statusExplanation = '📦 Great news! Your parcel has been dispatched and is currently on its way to your destination.';
      break;
    case 'Out for Delivery':
      statusExplanation = '🚚 Your parcel is *OUT FOR DELIVERY* today with our delivery partner!';
      break;
    case 'Ready-for-Pickup':
      statusExplanation = '🏪 Your order is packed and ready for pickup at our workshop.';
      break;
    case 'Delivered':
      statusExplanation = '✅ Your order has been successfully delivered! Thank you for celebrating with us.';
      break;
    case 'Cancelled':
      statusExplanation = '❌ Your order has been marked as cancelled. Please contact our helpline if you need help.';
      break;
    default:
      statusExplanation = `Your order status has been updated to ${newStatus}.`;
      break;
  }

  const text =
`🌸 *NEW RANG RANGOLI - ORDER STATUS UPDATE* 🌸

Namaste *${order.customerName}*! 🙏
The status of your order *#${orderNum}* has been updated:

🚚 *Current Status:* *${newStatus}*
${statusExplanation}

${customNote ? `📝 *Note from Workshop:* ${customNote}\n` : ''}
📍 *Delivery Address:* ${order.shippingAddress}
💰 *Order Total:* ₹${Number(order.totalPrice || 0).toFixed(2)}

📞 Need help? WhatsApp us at *${DISPLAY_BUSINESS_PHONE}*
_New Rang Rangoli_`;

  return sendRawMessage({
    to: order.customerPhone,
    message: text,
    messageType: 'STATUS_UPDATE',
    orderId: order._id
  });
};

/**
 * 3. Delivery OTP WhatsApp Message (Compulsory for delivery verification)
 */
const sendDeliveryOtp = async (order, otpCode) => {
  if (!order || !order.customerPhone) return null;

  const orderNum = order._id.toString().slice(-6).toUpperCase();

  const text =
`🚨 *NEW RANG RANGOLI - DELIVERY VERIFICATION OTP* 🚨

Namaste *${order.customerName}*! 🙏
Your order *#${orderNum}* is *OUT FOR DELIVERY* today with our delivery partner!

🔑 *YOUR SECRET DELIVERY CONFIRMATION OTP:*
┏━━━━━━━━━━━━━━━━━━━┓
┃       👉  *${otpCode}*  👈       ┃
┗━━━━━━━━━━━━━━━━━━━┛

⚠️ *IMPORTANT INSTRUCTIONS:*
1. Our delivery partner will arrive at your address:
   _${order.shippingAddress}_
2. Please verify your materials upon arrival.
3. *Give this OTP (${otpCode}) to the delivery partner ONLY AFTER receiving the package.*
4. The delivery partner is required to enter this OTP on their terminal to verify and complete the delivery.

${order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' ? `💵 *Amount to Pay on Delivery (Cash on Delivery):* ₹${Number(order.totalPrice || 0).toFixed(2)}\n` : ''}
📞 *Helpline (WhatsApp):* ${DISPLAY_BUSINESS_PHONE}
_New Rang Rangoli - Premium Indian Rangoli Colors_`;

  return sendRawMessage({
    to: order.customerPhone,
    message: text,
    messageType: 'DELIVERY_OTP',
    orderId: order._id
  });
};

/**
 * 4. Successful Delivery Confirmation WhatsApp Message
 */
const sendDeliveryConfirmed = async (order) => {
  if (!order || !order.customerPhone) return null;

  const orderNum = order._id.toString().slice(-6).toUpperCase();
  const deliveryTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const text =
`🎉 *NEW RANG RANGOLI - PARCEL DELIVERED!* 🎉

Namaste *${order.customerName}*! 🙏
Your order *#${orderNum}* has been *DELIVERED & VERIFIED* successfully at ${deliveryTime}!

✅ *Delivery Status:* OTP Verified & Completed
📦 *Items Delivered:* ${(order.items || []).length} product(s)
💰 *Total Amount:* ₹${Number(order.totalPrice || 0).toFixed(2)}

Thank you for choosing New Rang Rangoli! We hope our authentic festive colors bring prosperity, joy, and beauty to your home and celebrations. 🌺✨

📸 _Tag us or send pictures of your beautiful rangoli designs to our WhatsApp at *${DISPLAY_BUSINESS_PHONE}*!_

📞 *Customer Support:* ${DISPLAY_BUSINESS_PHONE}`;

  return sendRawMessage({
    to: order.customerPhone,
    message: text,
    messageType: 'DELIVERY_CONFIRMATION',
    orderId: order._id
  });
};

module.exports = {
  BUSINESS_WHATSAPP_PHONE,
  DISPLAY_BUSINESS_PHONE,
  formatPhoneNumber,
  sendRawMessage,
  sendOrderConfirmation,
  sendStatusUpdate,
  sendDeliveryOtp,
  sendDeliveryConfirmed
};
