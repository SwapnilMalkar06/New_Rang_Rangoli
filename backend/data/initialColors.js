// Initial seed data for 23 Rangoli Color Shades & 16 Sanskar Bharati Powders

const initialRangoliColors = [
  {
    id: 'rc-1-red',
    number: '1',
    nameEn: '1. RED',
    nameMr: '१. लाल (Red)',
    shadeName: 'Red',
    category: 'Standard',
    hex: '#C91D3A',
    image: '/colors/1-red.jpg',
    descriptionEn: 'High-pigment bright crimson red rangoli powder.',
    descriptionMr: 'अतिशय बारीक, तेजस्वी लाल पारंपारिक रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-2-yellow',
    number: '2',
    nameEn: '2. YELLOW',
    nameMr: '२. पिवळा (Yellow)',
    shadeName: 'Yellow',
    category: 'Standard',
    hex: '#F2C80C',
    image: '/colors/2-yellow.jpg',
    descriptionEn: 'Vibrant sunshine yellow powder for festive highlights.',
    descriptionMr: 'तेजस्वी सूर्यफुलासारखा पिवळा रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-3-green',
    number: '3',
    nameEn: '3. GREEN',
    nameMr: '३. हिरवा (Green)',
    shadeName: 'Green',
    category: 'Standard',
    hex: '#156D3B',
    image: '/colors/3-green.jpg',
    descriptionEn: 'Rich emerald forest green rangoli powder.',
    descriptionMr: 'गडद व समृद्ध हिरवा रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-4-pink-gulabi',
    number: '4',
    nameEn: '4. PINK/GULABI',
    nameMr: '४. गुलाबी (Pink / Gulabi)',
    shadeName: 'Pink',
    category: 'Standard',
    hex: '#C52879',
    image: '/colors/4-pink-gulabi.jpg',
    descriptionEn: 'Vivid festive pink / gulabi rangoli powder.',
    descriptionMr: 'उत्सवाचा पारंपारिक गुलाबी रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-5-perrot-green',
    number: '5',
    nameEn: '5. PERROT GREEN',
    nameMr: '५. पोपटी हिरवा (Parrot Green)',
    shadeName: 'Parrot Green',
    category: 'Standard',
    hex: '#27AA38',
    image: '/colors/5-perrot-green.jpg',
    descriptionEn: 'Fresh vibrant parrot green powder.',
    descriptionMr: 'ताजा व मनमोहक पोपटी हिरवा रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-6-marun',
    number: '6',
    nameEn: '6. MARUN',
    nameMr: '६. मरून (Maroon)',
    shadeName: 'Maroon',
    category: 'Standard',
    hex: '#6E1633',
    image: '/colors/6-marun.jpg',
    descriptionEn: 'Deep royal maroon powder for traditional motifs.',
    descriptionMr: 'शाही गडद मरून रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-7-sky-blue',
    number: '7',
    nameEn: '7. SKY BLUE',
    nameMr: '७. आकाशी निळा (Sky Blue)',
    shadeName: 'Sky Blue',
    category: 'Standard',
    hex: '#26A2DC',
    image: '/colors/7-sky-blue.jpg',
    descriptionEn: 'Crisp serene daylight sky blue.',
    descriptionMr: 'निर्मळ व शांत आकाशी निळा रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-8-jambali',
    number: '8',
    nameEn: '8. JAMBLI',
    nameMr: '८. जांभळा (Violet / Jambli)',
    shadeName: 'Jambli / Violet',
    category: 'Standard',
    hex: '#5A1B70',
    image: '/colors/8-jambali.jpg',
    descriptionEn: 'Royal festive jambli / deep violet.',
    descriptionMr: 'शाही जांभळा रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-9-orange',
    number: '9',
    nameEn: '9. ORANGE',
    nameMr: '९. नारंगी / केसरी (Orange)',
    shadeName: 'Orange',
    category: 'Standard',
    hex: '#F36712',
    image: '/colors/9-orange.jpg',
    descriptionEn: 'Glowing saffron orange rangoli powder.',
    descriptionMr: 'उत्सवाचा तेजस्वी नारंगी व केसरी रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-10-blue',
    number: '10',
    nameEn: '10. BLUE',
    nameMr: '१०. गडद निळा (Blue)',
    shadeName: 'Blue',
    category: 'Standard',
    hex: '#0A3B8C',
    image: '/colors/10-blue.jpg',
    descriptionEn: 'Rich navy ultramarine blue.',
    descriptionMr: 'गडद व आकर्षक निळा रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-11-cofy',
    number: '11',
    nameEn: '11. COFY',
    nameMr: '११. कॉफी / चॉकलेटी (Coffee Brown)',
    shadeName: 'Coffee / Brown',
    category: 'Standard',
    hex: '#4A2311',
    image: '/colors/11-cofy.jpg',
    descriptionEn: 'Earthy rich coffee chocolate brown.',
    descriptionMr: 'चॉकलेटी व कॉफी पारंपारिक रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-12-black',
    number: '12',
    nameEn: '12. BLACK',
    nameMr: '१२. काळा (Black)',
    shadeName: 'Black',
    category: 'Standard',
    hex: '#1A1819',
    image: '/colors/12-black.jpg',
    descriptionEn: 'Intense deep jet black powder for outlines and contrast.',
    descriptionMr: 'तीक्ष्ण काळा रंग, आउटलाइन्स व कॉन्ट्रास्टसाठी.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-13-rani',
    number: '13',
    nameEn: '13. RANI',
    nameMr: '१३. राणी कलर (Rani Magenta)',
    shadeName: 'Rani',
    category: 'Standard',
    hex: '#B7105F',
    image: '/colors/13-rani.jpg',
    descriptionEn: 'Intense traditional rani magenta.',
    descriptionMr: 'पारंपारिक व मनमोहक राणी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-14-falsa',
    number: '14',
    nameEn: '14. FALSA',
    nameMr: '१४. फालसा (Falsa / Plum)',
    shadeName: 'Falsa',
    category: 'Standard',
    hex: '#7A1C47',
    image: '/colors/14-falsa.jpg',
    descriptionEn: 'Traditional deep plum falsa shade.',
    descriptionMr: 'पारंपारिक फालसा (प्लम) रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-15-morpankhi',
    number: '15',
    nameEn: '15. MORPANKHI',
    nameMr: '१५. मोरपंखी (Teal Peacock)',
    shadeName: 'Morpankhi',
    category: 'Standard',
    hex: '#0A7373',
    image: '/colors/15-morpankhi.jpg',
    descriptionEn: 'Regal peacock feather teal blue-green.',
    descriptionMr: 'मनमोहक मोरपंखी शेड.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-16-rama',
    number: '16',
    nameEn: '16. RAMA',
    nameMr: '१६. रामा ग्रीन (Rama Cyan)',
    shadeName: 'Rama',
    category: 'Standard',
    hex: '#0BB3A2',
    image: '/colors/16-rama.jpg',
    descriptionEn: 'Vibrant Rama green/cyan color.',
    descriptionMr: 'दोलायमान रामा ग्रीन रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-17-goldan-yellow',
    number: '17',
    nameEn: '17. GOLDAN YELLOW',
    nameMr: '१७. गोल्डन पिवळा (Golden Yellow)',
    shadeName: 'Golden Yellow',
    category: 'Standard',
    hex: '#EAA90A',
    image: '/colors/17-goldan-yellow.jpg',
    descriptionEn: 'Rich warm golden yellow turmeric tone.',
    descriptionMr: 'हळदीसारखा उजळ सोनेरी पिवळा रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-18-pista',
    number: '18',
    nameEn: '18. PISTA',
    nameMr: '१८. पिस्ता (Pista Light Green)',
    shadeName: 'Pista',
    category: 'Standard',
    hex: '#8CC63F',
    image: '/colors/18-pista.jpg',
    descriptionEn: 'Soft pastel pistachio green.',
    descriptionMr: 'नाजूक व मनमोहक पिस्ता हिरवा रंग.',
    weights: {
      '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
      '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
    }
  },
  {
    id: 'rc-19-f-pink',
    number: '19',
    nameEn: '19. F. PINK',
    nameMr: '१९. फ्लोरोसंट पिंक (Neon Pink)',
    shadeName: 'Fluorescent Pink',
    category: 'Fluorescent',
    hex: '#FF1493',
    image: '/colors/19-f-pink.jpg',
    descriptionEn: 'Ultra-bright UV neon fluorescent pink.',
    descriptionMr: 'चमकदार फ्लोरोसंट गुलाबी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 25, label: '250gm' },
      '500gm': { retailPrice: 70, wholesalePrice: 45, label: '500gm' },
      '1000gm': { retailPrice: 130, wholesalePrice: 75, label: '1000gm' }
    }
  },
  {
    id: 'rc-20-f-orange',
    number: '20',
    nameEn: '20. F. ORANGE',
    nameMr: '२०. फ्लोरोसंट ऑरेंज (Neon Orange)',
    shadeName: 'Fluorescent Orange',
    category: 'Fluorescent',
    hex: '#FF5E00',
    image: '/colors/20-f-orange.jpg',
    descriptionEn: 'Electrifying neon orange with high-lumen glow.',
    descriptionMr: 'चमकदार फ्लोरोसंट नारंगी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 25, label: '250gm' },
      '500gm': { retailPrice: 70, wholesalePrice: 45, label: '500gm' },
      '1000gm': { retailPrice: 130, wholesalePrice: 75, label: '1000gm' }
    }
  },
  {
    id: 'rc-21-f-green',
    number: '21',
    nameEn: '21. F. GREEN',
    nameMr: '२१. फ्लोरोसंट ग्रीन (Neon Green)',
    shadeName: 'Fluorescent Green',
    category: 'Fluorescent',
    hex: '#39FF14',
    image: '/colors/21-f-green.jpg',
    descriptionEn: 'Radiant electric neon green rangoli powder.',
    descriptionMr: 'तेजस्वी फ्लोरोसंट हिरवा रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 25, label: '250gm' },
      '500gm': { retailPrice: 70, wholesalePrice: 45, label: '500gm' },
      '1000gm': { retailPrice: 130, wholesalePrice: 75, label: '1000gm' }
    }
  },
  {
    id: 'rc-22-f-yellow',
    number: '22',
    nameEn: '22. F. YELLOW',
    nameMr: '२२. फ्लोरोसंट यलो (Neon Yellow)',
    shadeName: 'Fluorescent Yellow',
    category: 'Fluorescent',
    hex: '#FFFF00',
    image: '/colors/22-f-yellow.jpg',
    descriptionEn: 'Vibrant high-contrast neon yellow.',
    descriptionMr: 'चमकदार फ्लोरोसंट पिवळा रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 25, label: '250gm' },
      '500gm': { retailPrice: 70, wholesalePrice: 45, label: '500gm' },
      '1000gm': { retailPrice: 130, wholesalePrice: 75, label: '1000gm' }
    }
  },
  {
    id: 'rc-23-white',
    number: '23',
    nameEn: '23. WHITE RANGOLI',
    nameMr: '२३. पांढरी रांगोळी (Superfine White)',
    shadeName: 'White Rangoli',
    category: 'White Powder',
    hex: '#F8F9FA',
    image: '/colors/23-white.jpg',
    descriptionEn: 'Superfine authentic bright white rangoli outline powder.',
    descriptionMr: 'अतिशय बारीक, अस्सल पांढरी रांगोळी पावडर.',
    weights: {
      '250gm': { retailPrice: 25, wholesalePrice: 15, label: '250gm' },
      '500gm': { retailPrice: 45, wholesalePrice: 25, label: '500gm' },
      '1000gm': { retailPrice: 80, wholesalePrice: 45, label: '1000gm' }
    }
  }
];

const initialSanskarBharatiColors = [
  {
    id: 'sb-1-golden-yellow',
    number: '1',
    nameEn: '1. Sanskar Golden Yellow',
    nameMr: '१. संस्कार सोनेरी पिवळा',
    shadeName: 'Golden Yellow',
    category: 'Vibrant Warm',
    hex: '#F8E113',
    image: '/colors/sanskar-bharati/sb-1-golden-yellow.jpg',
    descriptionEn: 'High-pigment turmeric golden yellow with ultra-soft powder structure.',
    descriptionMr: 'मध्यवर्ती मंडलासाठी खास अतिशय मऊ, रेशमी मखमली आणि तेजस्वी सोनेरी पिवळी पावडर.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-2-turquoise-sky',
    number: '2',
    nameEn: '2. Sanskar Turquoise Sky Blue',
    nameMr: '२. संस्कार आकाशी फिरोजी निळा',
    shadeName: 'Turquoise Sky',
    category: 'Cool Pastel',
    hex: '#0E89CF',
    image: '/colors/sanskar-bharati/sb-2-turquoise-sky.jpg',
    descriptionEn: 'Vibrant turquoise sky blue with silky soft powder texture.',
    descriptionMr: 'पार्श्वभूमी शेडिंगसाठी उत्कृष्ट अतिशय मऊ आणि रेशमी आकाशी फिरोजी निळा रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-3-lemon-pastel',
    number: '3',
    nameEn: '3. Sanskar Lemon Pastel',
    nameMr: '३. संस्कार लेमन पेस्टल पिवळा',
    shadeName: 'Lemon Pastel',
    category: 'Soft Pastel',
    hex: '#F8FC98',
    image: '/colors/sanskar-bharati/sb-3-lemon-pastel.jpg',
    descriptionEn: 'Delicate light lemon pastel cream powder.',
    descriptionMr: 'हळुवार ग्रेडियंट शेडिंगसाठी नाजूक फिकट लेमन पेस्टल अतिशय मऊ पावडर.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-4-rani-pink',
    number: '4',
    nameEn: '4. Sanskar Rani Pink (Magenta)',
    nameMr: '४. संस्कार राणी गुलाबी (मॅजेन्टा)',
    shadeName: 'Rani Magenta',
    category: 'Festive Vibrant',
    hex: '#F85FF6',
    image: '/colors/sanskar-bharati/sb-4-rani-pink.jpg',
    descriptionEn: 'Glowing festive rani pink magenta with smooth velvet powder structure.',
    descriptionMr: 'फुलांच्या पाकळ्या व उत्सवाच्या डिझाईन्ससाठी मखमली, मऊ राणी गुलाबी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-5-crimson-red',
    number: '5',
    nameEn: '5. Sanskar Crimson Red',
    nameMr: '५. संस्कार किरमिजी लाल',
    shadeName: 'Crimson Red',
    category: 'Deep Traditional',
    hex: '#BD1121',
    image: '/colors/sanskar-bharati/sb-5-crimson-red.jpg',
    descriptionEn: 'Rich holy sindoori crimson red soft powder.',
    descriptionMr: 'पारंपारिक गडद लाल, शुभ व उत्सवी संस्कार भारती पावडर.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-6-emerald-green',
    number: '6',
    nameEn: '6. Sanskar Emerald Green',
    nameMr: '६. संस्कार पाचू हिरवा',
    shadeName: 'Emerald Green',
    category: 'Nature Rich',
    hex: '#0D8337',
    image: '/colors/sanskar-bharati/sb-6-emerald-green.jpg',
    descriptionEn: 'Deep jewel emerald forest green velvety powder.',
    descriptionMr: 'पानांच्या व निसर्गाच्या डिझाईन्ससाठी गडद हिरवा मखमली रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-7-ultramarine-blue',
    number: '7',
    nameEn: '7. Sanskar Ultramarine Blue',
    nameMr: '७. संस्कार गडद राजेशाही निळा',
    shadeName: 'Ultramarine Blue',
    category: 'Deep Traditional',
    hex: '#0732A2',
    image: '/colors/sanskar-bharati/sb-7-ultramarine-blue.jpg',
    descriptionEn: 'Royal midnight ultramarine deep blue powder.',
    descriptionMr: 'गडद राजेशाही निळा, उत्कृष्ट कव्हरेज देणारा रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-8-parrot-light-green',
    number: '8',
    nameEn: '8. Sanskar Parrot Green',
    nameMr: '८. संस्कार पोपटी हलका हिरवा',
    shadeName: 'Parrot Green',
    category: 'Nature Rich',
    hex: '#2EBB41',
    image: '/colors/sanskar-bharati/sb-8-parrot-light-green.jpg',
    descriptionEn: 'Bright tender leaf parrot green powder.',
    descriptionMr: 'उजळ व मनमोहक पोपटी हिरवा रांगोळी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-9-royal-violet',
    number: '9',
    nameEn: '9. Sanskar Royal Violet / Jambli',
    nameMr: '९. संस्कार जांभळा (व्हायोलेट)',
    shadeName: 'Royal Violet',
    category: 'Festive Vibrant',
    hex: '#641A7E',
    image: '/colors/sanskar-bharati/sb-9-royal-violet.jpg',
    descriptionEn: 'Vibrant majestic violet jambli tone.',
    descriptionMr: 'शाही जांभळा रंग, बॉर्डर आणि मंडलाच्या भरावासाठी.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-10-saffron-orange',
    number: '10',
    nameEn: '10. Sanskar Saffron Orange',
    nameMr: '१०. संस्कार भगवा / केसरी',
    shadeName: 'Saffron Orange',
    category: 'Vibrant Warm',
    hex: '#F77014',
    image: '/colors/sanskar-bharati/sb-10-saffron-orange.jpg',
    descriptionEn: 'Luminous marigold saffron orange.',
    descriptionMr: 'झेंडूच्या फुलांसारखा तेजस्वी भगवा व केसरी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-11-deep-maroon',
    number: '11',
    nameEn: '11. Sanskar Deep Maroon',
    nameMr: '११. संस्कार गडद मरून',
    shadeName: 'Deep Maroon',
    category: 'Deep Traditional',
    hex: '#6B122D',
    image: '/colors/sanskar-bharati/sb-11-deep-maroon.jpg',
    descriptionEn: 'Warm royal burgundy maroon velvety powder.',
    descriptionMr: 'पारंपारिक उत्सवासाठी खास गडद मरून मखमली रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-12-lavender-lilac',
    number: '12',
    nameEn: '12. Sanskar Lavender Lilac',
    nameMr: '१२. संस्कार लॅव्हेंडर फिकट जांभळा',
    shadeName: 'Lavender Lilac',
    category: 'Soft Pastel',
    hex: '#B28FD3',
    image: '/colors/sanskar-bharati/sb-12-lavender-lilac.jpg',
    descriptionEn: 'Ethereal light lavender lilac soft powder.',
    descriptionMr: 'नाजूक व मनमोहक फिकट लॅव्हेंडर पावडर.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-13-coral-peach',
    number: '13',
    nameEn: '13. Sanskar Coral Peach',
    nameMr: '१३. संस्कार कोरल पीच',
    shadeName: 'Coral Peach',
    category: 'Soft Pastel',
    hex: '#F9A080',
    image: '/colors/sanskar-bharati/sb-13-coral-peach.jpg',
    descriptionEn: 'Soft warm apricot coral peach.',
    descriptionMr: 'हळुवार व उबदार कोरल पीच रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-14-mint-aqua',
    number: '14',
    nameEn: '14. Sanskar Mint Aqua',
    nameMr: '१४. संस्कार मिंट अ‍ॅक्वा फिकट हिरवा',
    shadeName: 'Mint Aqua',
    category: 'Cool Pastel',
    hex: '#7BE7C5',
    image: '/colors/sanskar-bharati/sb-14-mint-aqua.jpg',
    descriptionEn: 'Cool refreshing pale mint aqua turquoise.',
    descriptionMr: 'शीतल व ताजा मिंट अ‍ॅक्वा फिरोजी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-15-rose-blush',
    number: '15',
    nameEn: '15. Sanskar Rose Blush',
    nameMr: '१५. संस्कार रोझ ब्लश गुलाबी',
    shadeName: 'Rose Blush',
    category: 'Soft Pastel',
    hex: '#F6A8B8',
    image: '/colors/sanskar-bharati/sb-15-rose-blush.jpg',
    descriptionEn: 'Gentle pastel petal pink blush powder.',
    descriptionMr: 'गुलाबाच्या पाकळ्यांसारखा नाजूक गुलाबी रंग.',
    weights: {
      '250gm': { retailPrice: 40, wholesalePrice: 20, label: '250gm' },
      '500gm': { retailPrice: 80, wholesalePrice: 40, label: '500gm' },
      '1000gm': { retailPrice: 160, wholesalePrice: 80, label: '1000gm' }
    }
  },
  {
    id: 'sb-16-white-outlining',
    number: '16',
    nameEn: '16. Sanskar Super-fine White Outlining Powder',
    nameMr: '१६. संस्कार सुपर-फाईन पांढरी आउटलाइन पावडर',
    shadeName: 'White Outlining Powder',
    category: 'Signature White',
    hex: '#FFFFFF',
    image: '/colors/sanskar-bharati/sb-16-white-powder.jpg',
    descriptionEn: 'The core signature of Sanskar Bharati: Super-fine, high-friction grip, brilliant snow-white powder.',
    descriptionMr: 'संस्कार भारतीचा आत्मा: बोटांच्या सहज प्रवाहासाठी अतिशय बारीक, उच्च पकड देणारी पांढरी पावडर.',
    weights: {
      '250gm': { retailPrice: 30, wholesalePrice: 18, label: '250gm' },
      '500gm': { retailPrice: 55, wholesalePrice: 32, label: '500gm' },
      '1000gm': { retailPrice: 100, wholesalePrice: 60, label: '1000gm' }
    }
  }
];

module.exports = {
  initialRangoliColors,
  initialSanskarBharatiColors
};
