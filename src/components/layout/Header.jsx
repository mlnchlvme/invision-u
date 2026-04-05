import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/RoleBar.css';
import { useAuth } from '../../context/AuthContext';
import { IconZap, IconLogOut, IconUser, IconGlobe } from '../icons';

const LANGS = [
  { code: 'ru', label: 'Русский',  flag: 'RU' },
  { code: 'en', label: 'English',  flag: 'EN' },
  { code: 'kz', label: 'Қазақша', flag: 'KZ' },
];

function LangSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  // Собственный стейт — не зависит от i18n.language,
  // гарантирует ре-рендер флага сразу при выборе
  const [lang, setLang] = useState(
    () => localStorage.getItem('app_lang') || 'ru',
  );
  const ref = useRef(null);

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleSelect = (code) => {
    localStorage.setItem('app_lang', code);
    setLang(code);
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Сменить язык"
        title="Сменить язык"
      >
        <IconGlobe size={16} />
        <span className="lang-current">{current.flag}</span>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`lang-option ${lang === l.code ? 'lang-option--active' : ''}`}
              onClick={() => handleSelect(l.code)}
            >
              <span className="lang-option__flag">{l.flag}</span>
              <span className="lang-option__label">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : user?.role === 'applicant' ? 'АБ' : 'КМ';

  const displayName = user?.fullName || (user?.role === 'applicant' ? 'Абитуриент' : 'Комиссия');
  const roleLabel   = user?.role === 'applicant' ? 'Абитуриент' : 'Приёмная комиссия';

  return (
    <header className="role-bar">
      <div className="role-bar__logo">
        <div className="role-bar__logo-mark">
          <IconZap size={14} />
        </div>
        <div>
          <div className="role-bar__logo-text">
            inVision U<span className="role-bar__logo-dot" />
          </div>
          <div className="role-bar__logo-sub">{roleLabel}</div>
        </div>
      </div>

      <div className="role-bar__user flex items-center gap-8">
        <LangSwitcher />
        <span className="role-bar__user-dot">
          {initials.length ? initials : <IconUser size={14} />}
        </span>
        <span className="role-bar__user-name">{displayName}</span>
        <button className="btn-logout" onClick={logout} title={t('common.logout')}>
          <IconLogOut size={15} />
        </button>
      </div>
    </header>
  );
}