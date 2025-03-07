"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from '../hooks/useTranslations';

const SocialIcon = ({ href, label, children }: { href: string, label: string, children: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#FF3333] hover:bg-[#FF3333]/10 transition-all duration-300 transform hover:scale-110 group" 
    aria-label={label}
  >
    <span className="text-[#FF3333] group-hover:text-[#FF3333] transition-colors duration-300">
      {children}
    </span>
  </a>
);

const ContactItem = ({ icon, content, link }: { icon: React.ReactNode, content: string, link?: string }) => {
  const ContentElement = () => (
    <span className="text-gray-600 group-hover:text-[#0f0d0c] transition-colors duration-300">{content}</span>
  );

  return (
    <li className="flex items-center py-2 group">
      <span className="text-[#FF3333] mr-3">
        {icon}
      </span>
      {link ? (
        <a href={link} className="text-gray-600 hover:text-[#0f0d0c] transition-colors duration-300">
          <ContentElement />
        </a>
      ) : (
        <ContentElement />
      )}
    </li>
  );
};

const Footer = () => {
  const { t, language, toggleLanguage } = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#f8f7f4] text-[#0f0d0c] py-16 relative overflow-hidden">
      {/* Points décoratifs */}
      <div className="absolute top-[5%] left-[3%] w-1 h-1 bg-[#FF3333]/30 rounded-full"></div>
      <div className="absolute top-[10%] left-[8%] w-1 h-1 bg-[#FF3333]/20 rounded-full"></div>
      <div className="absolute top-[6%] left-[15%] w-1.5 h-1.5 bg-[#FF3333]/20 rounded-full"></div>
      <div className="absolute bottom-[10%] left-[5%] w-1 h-1 bg-[#FF3333]/30 rounded-full"></div>
      <div className="absolute bottom-[15%] right-[8%] w-1 h-1 bg-[#FF3333]/20 rounded-full"></div>
      <div className="absolute top-[85%] left-[85%] w-1 h-1 bg-[#FF3333]/30 rounded-full"></div>
      
      {/* SUPPRESSION DU SCROLLER VERTICAL */}

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16 max-w-4xl w-full">
          {/* Logo et description */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold text-[#0f0d0c]">PORT<span className="text-[#FF3333]">FOLIO</span></span>
            </Link>
            <p className="text-gray-700 mt-4 text-center md:text-left leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-4 justify-center md:justify-start">
              <SocialIcon href="https://www.instagram.com" label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </SocialIcon>
              
              <SocialIcon href="https://twitter.com" label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </SocialIcon>
              
              <SocialIcon href="https://www.artstation.com" label="ArtStation">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 002.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 00-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z"/>
                </svg>
              </SocialIcon>
              
              <SocialIcon href="https://www.linkedin.com" label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.064-.926-2.064-2.065 0-1.138.92-2.063 2.064-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-semibold mb-6 text-[#0f0d0c] flex items-center">
              <span className="inline-block w-2 h-6 bg-[#FF3333] mr-3 rounded"></span>
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2 w-full">
              <ContactItem 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                } 
                content="valentin.lothe.art@gmail.com" 
                link="mailto:valentin.lothe.art@gmail.com" 
              />
            </ul>
            
            <div className="mt-6 pt-6 border-t border-gray-200 w-full">
              <h4 className="text-sm uppercase text-[#0f0d0c] mb-3 text-center md:text-left">{t('footer.newsletter.title')}</h4>
              <div className="flex items-center shadow-sm">
                <input 
                  type="email" 
                  placeholder={t('footer.newsletter.placeholder')} 
                  className="bg-white text-[#0f0d0c] rounded-l-md py-3 px-4 w-full outline-none border border-gray-200 focus:border-[#FF3333] transition-colors duration-300"
                />
                <button className="bg-[#FF3333] text-white rounded-r-md p-3 hover:bg-[#ff4d4d] transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-3 text-center md:text-left">
                {t('footer.newsletter.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 mt-8 text-center w-full max-w-4xl">
          <p className="text-gray-600 text-sm">
            © {currentYear} <span className="text-[#FF3333]">Valentin Lothe</span>. {t('footer.copyright')}
          </p>
          <div className="mt-4 text-xs text-gray-500 flex flex-wrap justify-center gap-4">
            <span className="hover:text-gray-800 transition-colors duration-300 cursor-pointer">{t('footer.legal.terms')}</span>
            <span className="hover:text-gray-800 transition-colors duration-300 cursor-pointer">{t('footer.legal.privacy')}</span>
            <span className="hover:text-gray-800 transition-colors duration-300 cursor-pointer">{t('footer.legal.legal')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 