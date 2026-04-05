export const STEPS = [
  { id: 1, label: 'Регистрация',        desc: 'Аккаунт создан на портале',             status: 'done'   },
  { id: 2, label: 'Анкета и документы', desc: 'Аттестат, рекомендации, видео',         status: 'done'   },
  { id: 3, label: 'Письменные ответы',  desc: '3 мотивационных эссе',                  status: 'done'   },
  { id: 4, label: 'AI-интервью',        desc: 'Адаптивные вопросы по D.R.I.V.E.',      status: 'active' },
  { id: 5, label: 'Видеозапись',        desc: 'Самопрезентация 2–3 минуты',            status: 'wait'   },
  { id: 6, label: 'Обработка',          desc: 'AI-анализ + ревью комиссии',            status: 'wait'   },
  { id: 7, label: 'Решение',            desc: 'Уведомление по email до 30 мая 2026',   status: 'wait'   },
];

export const QUESTIONS = [
  { id: 1, text: 'Опишите ситуацию, когда вам пришлось принять сложное решение под давлением. Каков был результат и что вы узнали о себе?' },
  { id: 2, text: 'Почему вы хотите учиться в inVision U? Как программа Foundation Year поможет вам достичь долгосрочных целей?' },
  { id: 3, text: 'Опишите командный проект или инициативу, которую вы возглавляли. Что вы сделали, чтобы объединить людей вокруг общей цели?' },
];

export const COMM_AI_INIT = [
  { role: 'ai', text: 'Привет! Я AI-ассистент для анализа данных приёмной кампании inVision U. Спроси меня про статистику, кандидатов или попроси сформировать аналитическую сводку.' },
];

export const INTERVIEW_QS = [
  'Расскажите о себе: откуда вы, чем интересуетесь, и что привело вас к решению подать заявку в inVision U?',
  'Назовите свой самый значимый проект или достижение — в школе, сообществе или личной жизни.',
  'Как вы справляетесь с неудачами? Приведите конкретный пример.',
  'Что для вас значит быть лидером? Поделитесь реальным примером из вашего опыта.',
  'Каков ваш главный план на первый год в inVision U?',
];

export const COMM_NAV = [
  { id: 'dashboard',  iconKey: 'dashboard',  label: 'Дашборд' },
  { id: 'candidates', iconKey: 'users',       label: 'Кандидаты', badge: 3 },
  { id: 'ai-chat',    iconKey: 'bot',         label: 'AI-ассистент' },
  { id: 'analytics',  iconKey: 'trendUp',     label: 'Аналитика' },
  { id: 'settings',   iconKey: 'settings',    label: 'Настройки' },
];

export const CAND_NAV = [
  { id: 'status',     iconKey: 'clipboard',  label: 'Моя заявка' },
  { id: 'questions',  iconKey: 'pen',        label: 'Эссе' },
  { id: 'interview',  iconKey: 'mic',        label: 'AI-интервью' },
  { id: 'video',      iconKey: 'video',      label: 'Видео' },
  { id: 'processing', iconKey: 'clock',      label: 'Статус AI' },
];