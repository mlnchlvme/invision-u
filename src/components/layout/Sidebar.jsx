import '../../styles/components/Sidebar.css';
import {
  IconDashboard, IconUsers, IconBot, IconTrendUp, IconSettings,
  IconClipboard, IconPen, IconMic, IconVideo, IconClock, IconGlobe,
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

export default function Sidebar({ role, nav, page, setPage }) {
  return (
    <nav className="sidebar">
      <div className="sidebar__section">
        <div className="sidebar__label">
          {role === 'candidate' ? 'Моя заявка' : 'Навигация'}
        </div>
        {nav.map(item => {
          const Icon = ICON_MAP[item.iconKey];
          return (
            <div
              key={item.id}
              className={`sidebar__item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="sidebar__item-icon">
                {Icon && <Icon size={16} />}
              </span>
              <span className="sidebar__item-label">{item.label}</span>
              {item.badge && (
                <span className="sidebar__badge">{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__lang">
          <IconGlobe size={14} />
          <select defaultValue="ru">
            <option value="ru">Русский</option>
            <option value="kz">Қазақша</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
