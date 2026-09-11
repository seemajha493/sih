import React from 'react';
import type { PublicPageTab } from './PublicHeader';

interface PublicFooterProps {
  onNavigatePage: (page: PublicPageTab) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigatePage }) => {
  return (
    <footer className="bg-[#064E3B] text-slate-200 text-xs py-8 px-4 font-sans select-none border-t-2 border-amber-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">BhumiTrace</div>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div>Department of Land Resources</div>
              <div>Ministry of Rural Development</div>
              <div>Government of India</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Quick Navigation</div>
            <div className="text-[11px] space-y-1">
              <div>
                <button onClick={() => onNavigatePage('land-records')} className="hover:text-white text-left">
                  Search Land Records Directory
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('gis')} className="hover:text-white text-left">
                  Spatial Cadastral GIS Viewer
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('services')} className="hover:text-white text-left">
                  Essential Land Services
                </button>
              </div>
              <div>
                <button onClick={() => onNavigatePage('notices')} className="hover:text-white text-left">
                  Public Gazette & Notices
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Help & Legal</div>
            <div className="text-[11px] space-y-1">
              <div>
                <button onClick={() => onNavigatePage('help')} className="hover:text-white text-left">
                  Help Center & FAQs
                </button>
              </div>
              <div><a href="#" className="hover:text-white">Terms & Conditions</a></div>
              <div><a href="#" className="hover:text-white">Privacy Policy</a></div>
              <div><a href="#" className="hover:text-white">Disclaimer & Copyright</a></div>
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Technical Support</div>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div>Toll Free Helpline: <strong>1800-11-0018</strong></div>
              <div>Email: support-bhumitrace@gov.in</div>
              <div>Hours: Mon - Fri (09:30 AM - 06:00 PM)</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            Designed & Developed for Department of Land Resources (DoLR), MoRD, Govt. of India.
          </div>
          <div>
            © 2026 BhumiTrace. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
