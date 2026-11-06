# New Rang Rangoli (नव्या रंगांची रंगोली) 🌸

A full-stack modern cultural e-commerce platform crafted for authentic Indian Rangoli colors, Sanskar Bharati soft powders, tools, stencils, and seasonal festival kits. Built with React (Vite), Redux Toolkit, Node.js, Express, MongoDB, and Razorpay payment gateway integration.

---

## 🌟 Key Features

1. **Real-time Festive Landing Page**:
   - Dynamic festival hero animation tuned to the Hindu calendar and calendar months (Diwali, Makar Sankranti, Holi, Gudi Padwa, Ganpati, Navaratri & Dussehra).
   - High-definition authentic festival visual cards with bilingual slogans in English and Marathi.

2. **23 Authentic Rangoli Color Shades Catalog**:
   - Direct digital replica of the authentic physical rangoli shade card (Red, Yellow, Green, Pink, Maroon, Sky Blue, Jambli/Violet, Orange, Blue, Coffee/Brown, Black, Rani, Falsa, Morpankhi, Rama, Golden Yellow, Pista, Fluorescent Pink, Fluorescent Orange, Fluorescent Green, Fluorescent Yellow, White Rangoli).
   - Instant weight variant selection (**250gm**, **500gm**, **1000gm**) with reactive packet steppers.

3. **15+1 Sanskar Bharati Rangoli Soft Powder Catalog**:
   - Ultra-fine velvety, soft non-grain powder structure specifically created for freehand Sanskar Bharati motifs and borders.
   - 15 vibrant hues + 1 super-fine high-grip white outlining powder.

4. **Customer Shopping Accounts & Order History**:
   - Dedicated customer login and registration at `/login` and `/register`.
   - Customer dashboard (`/account`) displaying profile details and real-time order history with fulfillment status badges (Processing, Shipped, Delivered).

5. **Dual Payment Options**:
   - **Razorpay Online Payment**: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Wallets with cryptographic HMAC SHA256 signature verification.
   - **Cash on Delivery (COD)**: Option to pay cash upon doorstep delivery.

6. **B2B Wholesale & Retailer Portal**:
   - Dedicated wholesale portal (`/wholesale`) with bulk pricing discounts and Minimum Order Quantity (MOQ) enforcement.

7. **Bilingual Marathi (मराठी) & English UI**:
   - Instant language switching across navigation, product descriptions, catalog tags, cart, and checkout.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Local or Free MongoDB Atlas Cloud M0 Cluster)
- **Payment Gateway**: Razorpay Payments API & SDK
- **Hosting**: Vercel (Frontend static assets + Serverless Express API)

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas connection string)

### 2. Installation
Clone the repository and install dependencies:
```bash
# Clone repository
git clone https://github.com/SwapnilMalkar06/New_Rang_Rangoli.git
cd New_Rang_Rangoli

# Install root & backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# MongoDB Atlas or Local connection URI
MONGODB_URI=mongodb://127.0.0.1:27017/new_rang_rangoli

# JWT Authentication Secret
JWT_SECRET=super_secret_festive_rang_rangoli_key_2026

# Razorpay API Credentials (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=rzp_secret_placeholder

# Server Port
PORT=5000
```

### 4. Running Locally
Run backend and frontend servers in separate terminals:
```bash
# Terminal 1: Start Backend Server (Port 5000)
npm run server

# Terminal 2: Start Frontend Development Server (Port 3000)
npm run client
```

---

## ☁️ Free Online Database (MongoDB Atlas Setup)

1. Sign up for free at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a new free **M0 Sandbox Cluster** (free forever, 512MB storage).
3. Under **Database Access**, create a database user (e.g., `rangoli_admin`) with a secure password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere, required for Vercel serverless functions).
5. Click **Connect** -> **Connect your application** -> Copy the connection URI:
   ```
   mongodb+srv://rangoli_admin:<password>@cluster0.abcde.mongodb.net/new_rang_rangoli?retryWrites=true&w=majority
   ```
6. Set this URI as `MONGODB_URI` in your Vercel project environment settings.

---

## 🌐 Deploying to Vercel

The project includes pre-configured `vercel.json` and a serverless entry point at `api/index.js`.

### Method A: Deploy via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account (`SwapnilMalkar06`).
2. Click **Add New...** -> **Project**.
3. Import the **`New_Rang_Rangoli`** repository.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Any 32-character random string
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
5. Click **Deploy**. Vercel will build the Vite frontend and route `/api/*` to the serverless Express backend.

---

## 💳 Razorpay Integration Setup

1. Sign up / Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Go to **Settings** -> **API Keys**.
3. Click **Generate Test Key** (or use Live Keys for production).
4. Copy `Key Id` and `Key Secret` to your `.env` or Vercel Environment Variables:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
5. Note: When keys are not set, the platform operates in simulated sandbox mode for effortless local testing.

---

## 📄 License
This project is open-source and available under the MIT License.
