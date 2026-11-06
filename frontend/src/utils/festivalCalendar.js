// 12-Month Festival Calendar Schedule & Real-Time Seasonal Detection

export const FESTIVAL_SEASONS = [
  {
    monthIndex: 0, // January
    monthNameEn: 'January (Paush / Magh)',
    monthNameMr: 'जानेवारी (पौष / माघ)',
    seasonTitleEn: 'Makar Sankranti & Harvest Season',
    seasonTitleMr: 'मकर संक्रांत व सुगीचा सण',
    primaryFestivalId: 'makar-sankranti',
    upcomingFestivalIds: ['holi', 'gudi-padwa']
  },
  {
    monthIndex: 1, // February
    monthNameEn: 'February (Magh / Phalgun)',
    monthNameMr: 'फेब्रुवारी (माघ / फाल्गुन)',
    seasonTitleEn: 'Spring Blossom & Pre-Holi Season',
    seasonTitleMr: 'वसंत ऋतू व होळी पूर्वतयारी',
    primaryFestivalId: 'holi',
    upcomingFestivalIds: ['gudi-padwa', 'raksha-bandhan']
  },
  {
    monthIndex: 2, // March
    monthNameEn: 'March (Phalgun / Chaitra)',
    monthNameMr: 'मार्च (फाल्गुन / चैत्र)',
    seasonTitleEn: 'Holi Colors & Chaitra Welcoming',
    seasonTitleMr: 'रंगोत्सव होळी व चैत्र स्वागत',
    primaryFestivalId: 'holi',
    upcomingFestivalIds: ['gudi-padwa', 'raksha-bandhan']
  },
  {
    monthIndex: 3, // April
    monthNameEn: 'April (Chaitra / Vaishakh)',
    monthNameMr: 'एप्रिल (चैत्र / वैशाख)',
    seasonTitleEn: 'Gudi Padwa & Marathi New Year',
    seasonTitleMr: 'गुढीपाडवा व मराठी नववर्ष',
    primaryFestivalId: 'gudi-padwa',
    upcomingFestivalIds: ['raksha-bandhan', 'ganpati']
  },
  {
    monthIndex: 4, // May
    monthNameEn: 'May (Vaishakh / Jyeshtha)',
    monthNameMr: 'मे (वैशाख / ज्येष्ठ)',
    seasonTitleEn: 'Summer Craft & Auspicious Auspices',
    seasonTitleMr: 'उन्हाळी सण व शुभ कार्ये',
    primaryFestivalId: 'gudi-padwa',
    upcomingFestivalIds: ['raksha-bandhan', 'ganpati']
  },
  {
    monthIndex: 5, // June
    monthNameEn: 'June (Jyeshtha / Ashadha)',
    monthNameMr: 'जून (ज्येष्ठ / आषाढ)',
    seasonTitleEn: 'Pre-Shravan & Monsoon Preparations',
    seasonTitleMr: 'श्रावण पूर्वतयारी व सणांची चाहूल',
    primaryFestivalId: 'raksha-bandhan',
    upcomingFestivalIds: ['ganpati', 'navaratri-dussehra']
  },
  {
    monthIndex: 6, // July
    monthNameEn: 'July (Ashadha / Shravan)',
    monthNameMr: 'जुलै (आषाढ / श्रावण)',
    seasonTitleEn: 'Holy Shravan & Raksha Bandhan',
    seasonTitleMr: 'पवित्र श्रावण मास व नारळी पौर्णिमा',
    primaryFestivalId: 'raksha-bandhan',
    upcomingFestivalIds: ['ganpati', 'navaratri-dussehra']
  },
  {
    monthIndex: 7, // August
    monthNameEn: 'August (Shravan / Bhadrapad)',
    monthNameMr: 'ऑगस्ट (श्रावण / भाद्रपद)',
    seasonTitleEn: 'Raksha Bandhan & Ganeshotsav Welcoming',
    seasonTitleMr: 'रक्षाबंधन व बाप्पाचे आगमन',
    primaryFestivalId: 'ganpati',
    upcomingFestivalIds: ['navaratri-dussehra', 'diwali']
  },
  {
    monthIndex: 8, // September
    monthNameEn: 'September (Bhadrapad / Ashwin)',
    monthNameMr: 'सप्टेंबर (भाद्रपद / अश्विन)',
    seasonTitleEn: 'Ganesh Chaturthi & Navaratri Kick-off',
    seasonTitleMr: 'श्री गणेश चतुर्थी व शारदीय नवरात्र',
    primaryFestivalId: 'ganpati',
    upcomingFestivalIds: ['navaratri-dussehra', 'diwali']
  },
  {
    monthIndex: 9, // October
    monthNameEn: 'October (Ashwin / Kartik)',
    monthNameMr: 'ऑक्टोबर (अश्विन / कार्तिक)',
    seasonTitleEn: 'Navaratri, Dussehra & Diwali Glow',
    seasonTitleMr: 'शारदीय नवरात्र, दसरा व दीपावली प्रारंभ',
    primaryFestivalId: 'navaratri-dussehra',
    upcomingFestivalIds: ['diwali', 'makar-sankranti']
  },
  {
    monthIndex: 10, // November
    monthNameEn: 'November (Kartik / Margashirsha)',
    monthNameMr: 'नोव्हेंबर (कार्तिक / मार्गशीर्ष)',
    seasonTitleEn: 'Grand Diwali & Lakshmi Pujan Season',
    seasonTitleMr: 'भव्य दीपोत्सव व लक्ष्मीपूजन सोहळा',
    primaryFestivalId: 'diwali',
    upcomingFestivalIds: ['makar-sankranti', 'holi']
  },
  {
    monthIndex: 11, // December
    monthNameEn: 'December (Margashirsha / Paush)',
    monthNameMr: 'डिसेंबर (मार्गशीर्ष / पौष)',
    seasonTitleEn: 'Year-End Festive & Makar Sankranti Countdown',
    seasonTitleMr: 'वर्षाखेर व संक्रांत चाहूल',
    primaryFestivalId: 'diwali',
    upcomingFestivalIds: ['makar-sankranti', 'holi']
  }
];

/**
 * Returns prioritized festival slides based on real-time current month.
 * Ordered as:
 * 1. Current Festival (Live Now)
 * 2. Upcoming Festival #1
 * 3. Upcoming Festival #2
 * 4. Remaining festivals in calendar cycle
 */
export function getRealtimeFestivalSlides(festivalsList, targetDate = new Date()) {
  const currentMonth = targetDate.getMonth(); // 0 - 11
  const seasonInfo = FESTIVAL_SEASONS[currentMonth] || FESTIVAL_SEASONS[0];

  const primaryId = seasonInfo.primaryFestivalId;
  const upcomingIds = seasonInfo.upcomingFestivalIds || [];

  // Group festivals
  const currentFest = festivalsList.find(f => f.id === primaryId);
  const upcomingFests = upcomingIds
    .map(id => festivalsList.find(f => f.id === id))
    .filter(Boolean);

  const remainingFests = festivalsList.filter(
    f => f.id !== primaryId && !upcomingIds.includes(f.id)
  );

  const slides = [];

  if (currentFest) {
    slides.push({
      ...currentFest,
      status: 'current',
      statusBadgeEn: '🔴 Live Festive Season',
      statusBadgeMr: '🔴 चालू उत्सव हंगाम',
      seasonNameEn: seasonInfo.monthNameEn,
      seasonNameMr: seasonInfo.monthNameMr,
      seasonTitleEn: seasonInfo.seasonTitleEn,
      seasonTitleMr: seasonInfo.seasonTitleMr
    });
  }

  upcomingFests.forEach((fest, idx) => {
    slides.push({
      ...fest,
      status: 'upcoming',
      statusBadgeEn: idx === 0 ? '✨ Next Upcoming Festival' : '⏳ Approaching Festival',
      statusBadgeMr: idx === 0 ? '✨ पुढील आगामी सण' : '⏳ लवकरच येणारा सण',
      seasonNameEn: 'Upcoming Celebration',
      seasonNameMr: 'आगामी उत्सव',
      seasonTitleEn: 'Pre-Festive Bookings Open',
      seasonTitleMr: 'सणांचे आगाऊ आरक्षण सुरू'
    });
  });

  remainingFests.forEach(fest => {
    slides.push({
      ...fest,
      status: 'celebrate',
      statusBadgeEn: '🌸 Year-Round Cultural Pride',
      statusBadgeMr: '🌸 बाराही महिने पारंपारिक रंग',
      seasonNameEn: 'Annual Celebration',
      seasonNameMr: 'वार्षिक उत्सव',
      seasonTitleEn: 'Festive Specialties',
      seasonTitleMr: 'सणांची विशेष उत्पादने'
    });
  });

  return {
    currentSeason: seasonInfo,
    slides
  };
}
