import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <span>🌸</span> New Rang Rangoli
            </h3>
            <p className="text-xs leading-relaxed max-w-sm">
              {t('heroSubtitle')}
            </p>
            <p className="text-xs">
              © {currentYear} New Rang Rangoli. All rights reserved.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  {t('navShop')}
                </Link>
              </li>
              <li>
                <Link to="/wholesale" className="hover:text-white transition-colors">
                  {t('navWholesale')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop Categories Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              {t('navCategories')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Rangoli')}`} className="hover:text-white transition-colors">
                  {t('catRangoli')}
                </Link>
              </li>
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Sanskar Bharati Rangoli')}`} className="hover:text-white transition-colors">
                  {t('catSanskarBharati')}
                </Link>
              </li>
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Portrait Color')}`} className="hover:text-white transition-colors">
                  {t('catPortraitColor')}
                </Link>
              </li>
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Fluorescent Color')}`} className="hover:text-white transition-colors">
                  {t('catFluorescentColor')}
                </Link>
              </li>
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Tools')}`} className="hover:text-white transition-colors">
                  {t('catTools')}
                </Link>
              </li>
              <li>
                <Link to={`/shop?category=${encodeURIComponent('Holi Color')}`} className="hover:text-white transition-colors">
                  {t('catHoliColor')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Store Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Get In Touch
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed">
              <li>
                <strong>Email:</strong> support@newrangrangoli.com
              </li>
              <li>
                <strong>Phone:</strong> +91 98765 43210
              </li>
              <li>
                <strong>Store Location:</strong> Laxmi Road, Pune, Maharashtra, India
              </li>
              <li className="pt-2 text-[10px] text-orange-500 font-bold tracking-wide uppercase">
                🇮🇳 {t('trustBadgeSupport')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
