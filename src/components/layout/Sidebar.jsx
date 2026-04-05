import { useTranslation } from 'react-i18next';
import '../../styles/components/Sidebar.css';
import {
  IconDashboard, IconUsers, IconBot, IconTrendUp, IconSettings,
  IconClipboard, IconPen, IconMic, IconVideo, IconClock,
} from '../icons';

const ICON_MAP = {
  dashboard: IconDashboard,
  users:     IconUsers,
  bot:       IconBot,
  trendUp:   IconTrendUp,
  settings:  IconSettings,
  clipboard: IconClipboard,
  pen:       IconPen,
  mic:       IconMic,
  video:     IconVideo,
  clock:     IconClock,
};

const NAV_I18N = {
  dashboard:  'nav.dashboard',
  candidates: 'nav.candidates',
  'ai-chat':  'nav.ai_chat',
  analytics:  'nav.analytics',
  settings:   'nav.settings',
  status:     'nav.my_application',
  questions:  'nav.essays',
  interview:  'nav.interview',
  video:      'nav.video',
  processing: 'nav.status',
};

export default function Sidebar({ role, nav, page, setPage }) {
  const { t } = useTranslation();

  return (
    <nav className="sidebar">
      <div className="sidebar__section">
        <div className="sidebar__label">
          {role === 'candidate' ? t('nav.my_application') : t('common.back', { defaultValue: 'Навигация' })}
        </div>
        {nav.map(item => {
          const Icon = ICON_MAP[item.iconKey];
          const label = NAV_I18N[item.id] ? t(NAV_I18N[item.id]) : item.label;
          return (
            <div
              key={item.id}
              className={`sidebar__item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="sidebar__item-icon">
                {Icon && <Icon size={16} />}
              </span>
              <span className="sidebar__item-label">{label}</span>
              {item.badge && (
                <span className="sidebar__badge">{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}