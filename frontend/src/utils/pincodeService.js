/**
 * Postal PIN Code Lookup Service for India
 * Provides instant city & state auto-detection from 6-digit Indian PIN codes
 */

// Instant local cache for fast resolution of common Maharashtra / Indian PIN codes
const QUICK_PINCODE_MAP = {
  // Sangli & Miraj region
  '416416': { city: 'Sangli', district: 'Sangli', state: 'Maharashtra' },
  '416410': { city: 'Miraj', district: 'Sangli', state: 'Maharashtra' },
  '416404': { city: 'Islampur', district: 'Sangli', state: 'Maharashtra' },
  '416415': { city: 'Madhavnagar', district: 'Sangli', state: 'Maharashtra' },
  '416436': { city: 'Vita', district: 'Sangli', state: 'Maharashtra' },
  '416312': { city: 'Tasgaon', district: 'Sangli', state: 'Maharashtra' },
  '416418': { city: 'Kavathe Mahankal', district: 'Sangli', state: 'Maharashtra' },
  '416406': { city: 'Palus', district: 'Sangli', state: 'Maharashtra' },
  '416411': { city: 'Jath', district: 'Sangli', state: 'Maharashtra' },

  // Kolhapur
  '416001': { city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra' },
  '416002': { city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra' },
  '416003': { city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra' },
  '416004': { city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra' },
  '416012': { city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra' },
  '416115': { city: 'Ichalkaranji', district: 'Kolhapur', state: 'Maharashtra' },
  '416116': { city: 'Ichalkaranji', district: 'Kolhapur', state: 'Maharashtra' },
  '416202': { city: 'Jaysingpur', district: 'Kolhapur', state: 'Maharashtra' },

  // Pune
  '411001': { city: 'Pune', district: 'Pune', state: 'Maharashtra' },
  '411002': { city: 'Pune (Budhwar Peth)', district: 'Pune', state: 'Maharashtra' },
  '411004': { city: 'Pune (Deccan Gymkhana)', district: 'Pune', state: 'Maharashtra' },
  '411014': { city: 'Pune (Viman Nagar)', district: 'Pune', state: 'Maharashtra' },
  '411028': { city: 'Pune (Hadapsar)', district: 'Pune', state: 'Maharashtra' },
  '411030': { city: 'Pune (Sadashiv Peth)', district: 'Pune', state: 'Maharashtra' },
  '411038': { city: 'Pune (Kothrud)', district: 'Pune', state: 'Maharashtra' },
  '411045': { city: 'Pune (Baner)', district: 'Pune', state: 'Maharashtra' },
  '411057': { city: 'Pune (Hinjawadi)', district: 'Pune', state: 'Maharashtra' },

  // Mumbai & Thane
  '400001': { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Bandra, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra' },
  '400076': { city: 'Powai, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra' },
  '400601': { city: 'Thane', district: 'Thane', state: 'Maharashtra' },
  '400703': { city: 'Vashi, Navi Mumbai', district: 'Thane', state: 'Maharashtra' },

  // Other Maharashtra Cities
  '415001': { city: 'Satara', district: 'Satara', state: 'Maharashtra' },
  '415002': { city: 'Satara', district: 'Satara', state: 'Maharashtra' },
  '415110': { city: 'Karad', district: 'Satara', state: 'Maharashtra' },
  '413001': { city: 'Solapur', district: 'Solapur', state: 'Maharashtra' },
  '422001': { city: 'Nashik', district: 'Nashik', state: 'Maharashtra' },
  '431001': { city: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  '440001': { city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra' },
  '414001': { city: 'Ahmednagar', district: 'Ahmednagar', state: 'Maharashtra' }
};

/**
 * Lookup PIN code using local instant cache + India Post Official Postal API
 * @param {string} pincode - 6-digit Indian PIN code
 * @returns {Promise<{ success: boolean, city: string, district: string, state: string, localities?: string[], message?: string }>}
 */
export async function lookupPincode(pincode) {
  const cleanPin = (pincode || '').toString().trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    return {
      success: false,
      message: 'PIN code must be exactly 6 digits'
    };
  }

  // 1. Check instant local dictionary
  const cached = QUICK_PINCODE_MAP[cleanPin];

  // 2. Query India Post API for complete and country-wide accuracy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0] && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice || [];
        if (postOffices.length > 0) {
          const first = postOffices[0];
          const district = first.District || cached?.district || '';
          const state = first.State || cached?.state || 'Maharashtra';
          const city = district || first.Block || first.Name || cached?.city || '';

          // Collect unique locality/area names
          const localities = Array.from(
            new Set(postOffices.map((po) => po.Name).filter(Boolean))
          ).slice(0, 10);

          return {
            success: true,
            city,
            district,
            state,
            localities,
            pincode: cleanPin
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Pincode Lookup] Network API failed or timed out:', err.message);
  }

  // 3. Fallback to local cache if network API failed or timed out
  if (cached) {
    return {
      success: true,
      city: cached.city,
      district: cached.district,
      state: cached.state,
      localities: [cached.city],
      pincode: cleanPin,
      isFallback: true
    };
  }

  return {
    success: false,
    message: 'Could not auto-detect city for this PIN code. Please type your city manually.'
  };
}
