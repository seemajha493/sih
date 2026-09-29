import React from 'react';
import type { PublicPageTab } from './PublicHeader';
import { useTranslation } from '../../i18n/LanguageContext';

interface PublicFooterProps {
  onNavigatePage: (page: PublicPageTab) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigatePage }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#064E3B] text-slate-200 text-xs py-8 px-4 font-sans select-none border-t-2 border-amber-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">BhumiTrace</div>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div>{t('gov.dolr')}</div>
              <div>{t('gov.mord')}</div>
              <div>{t('gov.india')}</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">{t('footer.linksTitle')}</div>
            <div className="text-[11px] space-y-1">
              <div>
                <button onClick={() => onNavigatePage('land-records')} className="hover:text-white text-left">
                  {t('navbar.landRecords')}
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('gis')} className="hover:text-white text-left">
                  {t('navbar.gisMaps')}
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('services')} className="hover:text-white text-left">
                  {t('navbar.services')}
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('notices')} className="hover:text-white text-left">
                  {t('navbar.notices')}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">{t('navbar.help')}</div>
            <div className="text-[11px] space-y-1">
              <div>
                <button onClick={() => onNavigatePage('help')} className="hover:text-white text-left">
                  {t('navbar.help')} & FAQs
                </button>
              </div>
              <div><a href="#" className="hover:text-white">{t('footer.termsOfService')}</a></div>
              <div><a href="#" className="hover:text-white">{t('footer.privacyPolicy')}</a></div>
              <div><a href="#" className="hover:text-white">{t('footer.copyrightPolicy')}</a></div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">{t('footer.helpline')}</div>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div>Toll Free: <strong>1800-180-1551</strong></div>
              <div>Email: support.bhumitrace@nic.in</div>
              <div>Mon - Sat (09:00 AM - 06:00 PM)</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            {t('footer.disclaimer')}
          </div>
          <div>
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};
