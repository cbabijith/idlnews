'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1a1a2e] w-full mt-auto pb-20 md:pb-0">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="max-w-[700px] mx-auto px-5 py-8 flex flex-col gap-6">
        {/* Brand + Description */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img src="/whitelogoidlnewslargesvg.svg" alt="IDL News" className="h-8 w-auto" />
          </div>
          <p className="text-white/60 text-[13px] leading-relaxed">
            സത്യസന്ധവും വേഗമേറിയതുമായ വാർത്തകൾ. കേരളത്തിലെയും ലോകത്തെയും പ്രധാന വാർത്തകൾ അതിവേഗം ലഭിക്കാൻ IDL NEWS.
          </p>
          
          {/* Contact Details */}
          <div className="text-white/70 text-[12.5px] flex flex-col gap-1.5 mt-2 bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="font-semibold text-white">Chief Editor: Binu Karunakaran</p>
            <p>Make over Building</p>
            <p>Kalathilpady Ponpally road, Vadavathoor P.O</p>
            <p>Kottayam - 686010</p>
            <p className="flex items-center gap-1.5 text-white/80">
              <span className="material-symbols-outlined text-[15px] text-primary">call</span>
              Mobile: <a href="tel:9020333222" className="hover:underline text-white font-medium">9020333222</a>
            </p>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-white/5 text-[11px] text-white/50">
              <span>Since 2015</span>
              <span>•</span>
              <a 
                href="https://maps.app.goo.gl/4Nz7YyCZq1ukGeL86" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links - Mobile-first grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Link href="/" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">home</span>
            ഹോം
          </Link>
          <a href="#" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">info</span>
            ഞങ്ങളെക്കുറിച്ച്
          </a>
          <a href="#" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">campaign</span>
            പരസ്യം
          </a>
          <a href="#" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">privacy_tip</span>
            സ്വകാര്യതാ നയം
          </a>
          <a href="#" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
            സമ്പർക്കം
          </a>
          <a href="https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV" target="_blank" rel="noopener noreferrer" className="text-white/70 text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">chat</span>
            WhatsApp ചാനൽ
          </a>
        </div>

        {/* Social / Contact Icons */}
        <div className="flex items-center gap-3 pt-1">
          <a href="https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
            <span className="material-symbols-outlined text-[18px] text-white">chat</span>
          </a>
          <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
            <span className="material-symbols-outlined text-[18px] text-white">share</span>
          </a>
          <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
            <span className="material-symbols-outlined text-[18px] text-white">mail</span>
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-[11px]">
            © 2024 IDL വാർത്തകൾ. All rights reserved.
          </p>
          <p className="text-white/30 text-[10px]">
            Made by <a href="https://abijithcb.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">abijithcb.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
