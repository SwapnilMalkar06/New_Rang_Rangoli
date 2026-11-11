require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const colorRoutes = require('./routes/colorRoutes');
const Product = require('./models/Product');
const User = require('./models/User');
const whatsappWebService = require('./services/whatsappWebService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colors', colorRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('New Rang Rangoli API is running...');
});

// Seed Data Logic
const seedProducts = async () => {
  try {
    // Check if we need to update the catalog to include combined Navaratri & Dussehra tags
    const checkCombined = await Product.findOne({ tags: 'Navaratri & Dussehra' });
    const productCount = await Product.countDocuments();
    if (!checkCombined || productCount < 18) {
      console.log('Updating catalog: dropping old products and seeding the new vibrant catalog with festival collections...');
      await Product.deleteMany({});
      const sampleProducts = [
        {
          name: 'Premium Rangoli Magic Colors - Box of 12',
          nameMR: 'प्रीमियम रांगोळी मॅजिक रंग - १२ चा बॉक्स',
          description: 'Super-fine, organic, eco-friendly vibrant rangoli colors for festive decorations.',
          descriptionMR: 'सणांच्या सजावटीसाठी अतिशय बारीक, सेंद्रिय, पर्यावरणपूरक आणि दोलायमान रांगोळीचे रंग.',
          mainCategory: 'Rangoli',
          subCategory: 'powders',
          price: 299,
          wholesalePrice: 149,
          minWholesaleQuantity: 20,
          stockQuantity: 400,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Ganpati', 'Ganesh Chaturthi', 'Diwali', 'Navaratri', 'Dussehra', 'Navaratri & Dussehra', 'Best Seller', 'Organic'],
          seasonalDiscount: {
            discountPercentage: 15,
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-11-30'),
            eventName: 'Festive Season Promo'
          }
        },
        {
          name: 'Traditional Mandala Rangoli Stencils Set',
          nameMR: 'पारंपारिक मंडला रांगोळी स्टॅन्सिल संच',
          description: 'Set of 6 durable plastic stencils with detailed traditional patterns for quick, stunning borders.',
          descriptionMR: 'पटकन आणि आकर्षक डिझाईन्स काढण्यासाठी यादीनुसार पारंपारिक नमुने असलेले ६ टिकाऊ प्लास्टिक स्टॅन्सिलचा संच.',
          mainCategory: 'Rangoli',
          subCategory: 'stencils',
          price: 199,
          wholesalePrice: 99,
          minWholesaleQuantity: 30,
          stockQuantity: 300,
          imageUrls: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
          tags: ['Ganpati', 'Ganesh Chaturthi', 'Diwali', 'Dussehra', 'Navaratri', 'Navaratri & Dussehra', 'Stencils', 'DIY Paint'],
          seasonalDiscount: null
        },
        {
          name: 'Super-fine Sanskar Bharati White Powder (5kg)',
          nameMR: 'सुपर-फाईन संस्कार भारती पांढरी पावडर (५ किलो)',
          description: 'High-grip white powder specially formulated for outlining intricate Sanskar Bharati patterns.',
          descriptionMR: 'गुंतागुंतीच्या संस्कार भारती डिझाईन्सच्या आउटलाइनिंगसाठी खास तयार केलेली पांढरी पावडर.',
          mainCategory: 'Sanskar Bharati Rangoli',
          subCategory: 'powders',
          price: 450,
          wholesalePrice: 220,
          minWholesaleQuantity: 15,
          stockQuantity: 250,
          imageUrls: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop'],
          tags: ['Sanskar Bharati', 'White Powder', 'Festive Essential', 'Diwali', 'Ganpati', 'Gudi Padwa'],
          seasonalDiscount: null
        },
        {
          name: 'Decorative Sanskar Bharati Pattern Roller',
          nameMR: 'सजावटीच्या संस्कार भारती डिझाईन रोलर',
          description: 'A heavy-duty mesh roller designed to lay down seamless Sanskar Bharati borders easily.',
          descriptionMR: 'संस्कार भारती बॉर्डर्स सहज आणि वेगाने काढण्यासाठी डिझाईन केलेला टिकाऊ मेश रोलर.',
          mainCategory: 'Sanskar Bharati Rangoli',
          subCategory: 'stencils',
          price: 249,
          wholesalePrice: 125,
          minWholesaleQuantity: 20,
          stockQuantity: 180,
          imageUrls: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
          tags: ['Sanskar Bharati', 'Roller', 'Tools', 'Diwali', 'Gudi Padwa'],
          seasonalDiscount: null
        },
        {
          name: 'Professional Portrait Face Detail Dust Set',
          nameMR: 'प्रोफेशनल पोर्ट्रेट फेस डिटेल डस्ट सेट',
          description: 'Ultra-fine natural mineral dust set with precise skin tone color matching for large-scale portraits.',
          descriptionMR: 'मोठ्या प्रमाणावरील पोर्ट्रेट रेखाटनासाठी अचूक स्किन टोन रंग जुळणारा अतिशय बारीक नैसर्गिक मिनरल डस्ट सेट.',
          mainCategory: 'Portrait Color',
          subCategory: 'powders',
          price: 599,
          wholesalePrice: 349,
          minWholesaleQuantity: 10,
          stockQuantity: 100,
          imageUrls: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
          tags: ['Portrait', 'Professional', 'Mineral Dust'],
          seasonalDiscount: null
        },
        {
          name: 'Skin & Earth Tone Powder Kit - 6 Shades',
          nameMR: 'स्किन आणि अर्थ टोन पावडर किट - ६ शेड्स',
          description: 'Curated organic colors for rangoli artists creating realistic faces and detailed portraits.',
          descriptionMR: 'वास्तववादी चेहरे आणि तपशीलवार पोर्ट्रेट तयार करणाऱ्या कलाकारांसाठी ६ सेंद्रिय रंगांचा संच.',
          mainCategory: 'Portrait Color',
          subCategory: 'powders',
          price: 399,
          wholesalePrice: 239,
          minWholesaleQuantity: 12,
          stockQuantity: 150,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Portrait', 'Earth Tone', 'Kit'],
          seasonalDiscount: null
        },
        {
          name: 'Neon Glow Pink Fluorescent Powder (1kg)',
          nameMR: 'निऑन ग्लो पिंक फ्लोरोसंट पावडर (१ किलो)',
          description: 'UV-reactive, super-bright fluorescent pink color for jaw-dropping modern art displays.',
          descriptionMR: 'आधुनिक कला प्रदर्शनासाठी अतिशय तेजस्वी, निऑन ग्लो असलेला फ्लोरोसंट गुलाबी रंग.',
          mainCategory: 'Fluorescent Color',
          subCategory: 'powders',
          price: 249,
          wholesalePrice: 149,
          minWholesaleQuantity: 20,
          stockQuantity: 200,
          imageUrls: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop'],
          tags: ['Neon', 'Fluorescent', 'Pink', 'Vibrant'],
          seasonalDiscount: null
        },
        {
          name: 'Vibrant Fluorescent Assorted Box - 6 Colors',
          nameMR: 'व्हायब्रंट फ्लोरोसंट मिश्रित बॉक्स - ६ रंग',
          description: 'A pack of 6 neon fluorescent powders including Green, Yellow, Orange, Pink, Violet, and Blue.',
          descriptionMR: 'हिरवा, पिवळा, नारिंगी, गुलाबी, जांभळा आणि निळा अशा ६ निऑन फ्लोरोसंट रंगांचा संच.',
          mainCategory: 'Fluorescent Color',
          subCategory: 'powders',
          price: 349,
          wholesalePrice: 199,
          minWholesaleQuantity: 15,
          stockQuantity: 160,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Neon', 'Fluorescent', 'Assorted', 'Kit'],
          seasonalDiscount: null
        },
        {
          name: 'Rangoli Pen Tool with 5 Adjustable Nozzles',
          nameMR: 'रांगोळी पेन टूल ५ ॲडजस्टेबल नोजल्ससह',
          description: 'Pen tool for double-line drawing, dots, and seamless line control, including 5 distinct flow nozzles.',
          descriptionMR: 'दुहेरी रेषा काढणे, ठिपके देणे आणि रेषांवर नियंत्रण ठेवण्यासाठी ५ वेगवेगळ्या नोजल्ससह पेन टूल.',
          mainCategory: 'Tools',
          subCategory: 'brushes',
          price: 149,
          wholesalePrice: 89,
          minWholesaleQuantity: 25,
          stockQuantity: 300,
          imageUrls: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop'],
          tags: ['Tools', 'Pen Tool', 'DIY Paint'],
          seasonalDiscount: null
        },
        {
          name: 'Heavy-Duty Floral Border Roller Stencil',
          nameMR: 'हेवी-ड्यूटी फ्लोरल बॉर्डर रोलर स्टॅन्सिल',
          description: 'Roller design tool for quick border designs. Just fill with white powder and roll.',
          descriptionMR: 'पटकन सुंदर फुलांच्या बॉर्डर काढण्यासाठी रोलर डिझाईन टूल. फक्त पांढऱ्या रंगाने भरा आणि रोल करा.',
          mainCategory: 'Tools',
          subCategory: 'stencils',
          price: 180,
          wholesalePrice: 110,
          minWholesaleQuantity: 30,
          stockQuantity: 220,
          imageUrls: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
          tags: ['Tools', 'Roller', 'Stencils'],
          seasonalDiscount: null
        },
        {
          name: 'Eco-friendly Organic Herbal Holi Colors - 5 Pack',
          nameMR: 'पर्यावरणपूरक सेंद्रिय हर्बल होळीचे रंग - ५ पॅक',
          description: '100% natural, skin-safe herbal colors extracted from flowers and vegetables (Red, Green, Yellow, Blue, Pink).',
          descriptionMR: '१००% नैसर्गिक, त्वचेसाठी सुरक्षित हर्बल रंग (लाल, हिरवा, पिवळा, निळा, गुलाबी).',
          mainCategory: 'Holi Color',
          subCategory: 'powders',
          price: 299,
          wholesalePrice: 179,
          minWholesaleQuantity: 20,
          stockQuantity: 500,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Holi', 'Herbal', 'Organic', 'Festival Essential'],
          seasonalDiscount: {
            discountPercentage: 20,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-03-31'),
            eventName: 'Holi Dhamaka Promo'
          }
        },
        {
          name: 'Water-Soluble Holi Color Bulb Squirters',
          nameMR: 'पाण्यात विरघळणारे होळीचे रंग बल्ब स्क्विर्टर्स',
          description: 'Vibrant non-toxic powder inside squeeze bulbs that dissolve in water instantly for clean Holi play.',
          descriptionMR: 'पाण्यात त्वरित विरघळणारे आणि होळीच्या खेळासाठी योग्य असे स्क्विझ बल्बमधील विषमुक्त रंग.',
          mainCategory: 'Holi Color',
          subCategory: 'powders',
          price: 150,
          wholesalePrice: 90,
          minWholesaleQuantity: 25,
          stockQuantity: 400,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Holi', 'Water Soluble', 'Bulb'],
          seasonalDiscount: null
        },
        {
          name: 'Premium Scented Royal Pink Gulal (500g)',
          nameMR: 'प्रीमियम सुगंधी रॉयल गुलाबी गुलाल (५०० ग्रॅम)',
          description: 'Silky smooth, scented organic gulal made from premium grade talc-free starch and rose extracts.',
          descriptionMR: 'प्रीमियम टॅल्क-मुक्त स्टार्च आणि गुलाबाच्या अर्कापासून बनवलेला मऊ आणि सुगंधी सेंद्रिय गुलाल.',
          mainCategory: 'Gulal',
          subCategory: 'powders',
          price: 120,
          wholesalePrice: 69,
          minWholesaleQuantity: 40,
          stockQuantity: 600,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Gulal', 'Scented', 'Pink', 'Festival Essential'],
          seasonalDiscount: null
        },
        {
          name: 'Natural Organic Kesari Yellow Gulal',
          nameMR: 'नैसर्गिक सेंद्रिय केसरी पिवळा गुलाल',
          description: 'Bright Kesari (Saffron Yellow) natural gulal made from turmeric and organic starch. Skin-friendly.',
          descriptionMR: 'हळद आणि सेंद्रिय स्टार्चपासून बनवलेला तेजस्वी केसरी नैसर्गिक गुलाल. त्वचेसाठी अत्यंत सुरक्षित.',
          mainCategory: 'Gulal',
          subCategory: 'powders',
          price: 130,
          wholesalePrice: 75,
          minWholesaleQuantity: 40,
          stockQuantity: 450,
          imageUrls: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop'],
          tags: ['Gulal', 'Kesari', 'Organic', 'Yellow', 'Holi', 'Ganpati', 'Dussehra', 'Navaratri', 'Navaratri & Dussehra'],
          seasonalDiscount: null
        },
        {
          name: 'Navaratri & Dussehra Auspicious Festive Rangoli Kit',
          nameMR: 'नवरात्र व दसरा विशेष रंग व स्टॅन्सिल किट',
          description: 'Curated 9 sacred vibrant shades, Garba-Dandiya patterns, and royal marigold yellow-orange powders with Vijayadashami victory borders.',
          descriptionMR: 'नवरात्रीचे ९ मंगलमय रंग, गरबा-दांडिया स्टॅन्सिल, झेंडू पिवळा व केसरी रंग आणि विजयादशमी विजय चौक रांगोळी संच.',
          mainCategory: 'Rangoli',
          subCategory: 'powders',
          price: 349,
          wholesalePrice: 199,
          minWholesaleQuantity: 15,
          stockQuantity: 350,
          imageUrls: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop'],
          tags: ['Navaratri', 'Dussehra', 'Navaratri & Dussehra', 'Garba', 'Vijayadashami', 'Durga Puja', 'Festival Essential'],
          seasonalDiscount: null
        },
        {
          name: 'Makar Sankranti Kite & Haldi-Kunku Rangoli Set',
          nameMR: 'मकर संक्रांत पतंग व हळदी-कुंकू रांगोळी संच',
          description: 'Festive kite-motif stencils with vibrant white, yellow, red and sky-blue rangoli powders.',
          descriptionMR: 'पतंग डिझाईन स्टॅन्सिल, सूर्य मंडला आणि हळदी-कुंकू कार्यक्रमासाठी खास संक्रांत रांगोळी संच.',
          mainCategory: 'Rangoli',
          subCategory: 'stencils',
          price: 249,
          wholesalePrice: 139,
          minWholesaleQuantity: 20,
          stockQuantity: 280,
          imageUrls: ['https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=600&auto=format&fit=crop'],
          tags: ['Makar Sankranti', 'Kite Festival', 'Stencils', 'Haldi Kunku'],
          seasonalDiscount: null
        },
        {
          name: 'Gudi Padwa Shobhayatra Rangoli & Toran Kit',
          nameMR: 'गुढीपाडवा शोभायात्रा रांगोळी व तोरण किट',
          description: 'Traditional bright colors, Swastik and Gudi stencils for welcoming the Maharashtrian New Year.',
          descriptionMR: 'नववर्षाच्या स्वागतासाठी पारंपारिक शुभ्र व रंगीबेरंगी पावडर, स्वस्तिक आणि शोभायात्रा डिझाईन्स.',
          mainCategory: 'Rangoli',
          subCategory: 'powders',
          price: 279,
          wholesalePrice: 159,
          minWholesaleQuantity: 20,
          stockQuantity: 260,
          imageUrls: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop'],
          tags: ['Gudi Padwa', 'New Year', 'Traditional', 'Swastik'],
          seasonalDiscount: null
        },
        {
          name: 'Dussehra Royal Marigold Yellow & Orange Rangoli Box',
          nameMR: 'दसरा झेंडू पिवळा व केसरी रंग विशेष बॉक्स',
          description: 'High-pigment natural marigold yellow and saffron orange powders with victory border stencils for Vijayadashami and Navaratri.',
          descriptionMR: 'झेंडूच्या फुलांसारखा तेजस्वी पिवळा आणि नारंगी रंग तसेच विजयादशमी बॉर्डर स्टॅन्सिल.',
          mainCategory: 'Rangoli',
          subCategory: 'powders',
          price: 220,
          wholesalePrice: 120,
          minWholesaleQuantity: 25,
          stockQuantity: 310,
          imageUrls: ['https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=600&auto=format&fit=crop'],
          tags: ['Dussehra', 'Navaratri', 'Navaratri & Dussehra', 'Vijayadashami', 'Marigold', 'Festival Essential'],
          seasonalDiscount: null
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Database successfully seeded with new vibrant products!');
    }
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default administrator account...');
      const admin = new User({
        name: 'Store Administrator',
        email: 'admin@newrangrangoli.com',
        password: 'admin123',
        phone: '9876543210',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin account created successfully: admin@newrangrangoli.com / admin123');
    }
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
  }
};

const seedDeliveryPartner = async () => {
  try {
    const deliveryExists = await User.findOne({ email: 'delivery@rangoli.com' });
    if (!deliveryExists) {
      console.log('Seeding default delivery partner account...');
      const delivery = new User({
        name: 'Ramesh Patil (Delivery Partner)',
        email: 'delivery@rangoli.com',
        password: 'delivery123',
        phone: '9876543210',
        role: 'delivery'
      });
      await delivery.save();
      console.log('Delivery partner account created successfully: delivery@rangoli.com / delivery123');
    }
  } catch (error) {
    console.error(`Error seeding delivery partner: ${error.message}`);
  }
};

const seedCustomer = async () => {
  try {
    const customerExists = await User.findOne({ email: 'radha@example.com' });
    if (!customerExists) {
      const customer = new User({
        name: 'Radha Sharma',
        email: 'radha@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'customer'
      });
      await customer.save();
    }
  } catch (error) {
    console.error(`Error seeding customer: ${error.message}`);
  }
};

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    seedProducts();
    seedAdmin();
    seedDeliveryPartner();
    seedCustomer();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Boot WhatsApp Web client in background
      whatsappWebService.initialize().catch((err) => {
        console.error('WhatsApp Web service startup warning:', err.message);
      });
    });
  });
}

module.exports = app;
module.exports.seedProducts = seedProducts;
module.exports.seedAdmin = seedAdmin;
module.exports.seedDeliveryPartner = seedDeliveryPartner;
module.exports.seedCustomer = seedCustomer;
