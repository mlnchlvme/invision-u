# inVision U — Портал приёмной комиссии

Веб-приложение для подачи заявок и управления приёмной кампанией inVision U 2026.

## Стек

- **React 18** + **Vite 5** — фреймворк и сборщик
- **CSS Custom Properties** — дизайн-токены без сторонних UI-библиотек
- **Fetch API** — HTTP-клиент с Bearer-авторизацией

---

## Быстрый старт

```bash
# 1. Создать .env в корне
echo "VITE_API_URL=http://localhost:8000" > .env

# 2. Установить зависимости
npm install

# 3. Запустить dev-сервер
npm run dev          # http://localhost:5173

# 4. Production-сборка
npm run build
npm run preview
```

---

## Структура проекта

```
src/
├── api/
│   ├── client.js          базовый fetch с Bearer-авторизацией
│   ├── auth.js            POST /api/auth/login, /register
│   ├── applications.js    CRUD заявок, submit, статус, решения
│   ├── questions.js       CRUD вопросов для эссе
│   ├── interview.js       start / message интервью
│   └── admin.js           dashboard, stats, settings, seed
├── context/
│   └── AuthContext.jsx    глобальное состояние авторизации
├── pages/
│   ├── Landing.jsx        публичная лендинг-страница
│   └── Auth.jsx           единая страница входа / регистрации
├── components/
│   ├── icons/index.jsx    27 SVG-иконок (Feather-стиль)
│   ├── layout/
│   │   ├── Header.jsx     шапка без переключателя ролей
│   │   └── Sidebar.jsx    меню с SVG-иконками + мобильный bottom nav
│   ├── candidate/         кабинет абитуриента
│   ├── commission/        кабинет комиссии
│   └── shared/
│       ├── Toast.jsx      всплывающие уведомления
│       ├── StatusBadge.jsx
│       ├── BarChart.jsx
│       └── RadarChart.jsx
├── data/mockData.js       фоллбэк-данные (без эмодзи)
└── styles/
    ├── global.css
    └── components/        Auth, Landing, Layout, RoleBar, Sidebar, Chat, Questions, Video
```

---

## Изменения относительно исходника

### 1. Разделение ролей абитуриента и комиссии

Удалён переключатель ролей из шапки (`RoleBar.jsx` → `Header.jsx`). Роль теперь определяется исключительно полем `role` в JWT-токене:

- `applicant` — видит только кабинет абитуриента
- `commission` — видит только дашборд комиссии

Между ролями переключиться нельзя — нужно выйти и войти под другим аккаунтом. Кнопка выхода в шапке очищает `localStorage` и возвращает на лендинг.

### 2. Единая страница Sign In / Sign Up

`src/pages/Auth.jsx` — два таба на одной странице:

- **Войти** — `POST /api/auth/login`
- **Регистрация** — `POST /api/auth/register` + автоматическое создание заявки (`POST /api/applications`) после успешной регистрации абитуриента
- Валидация полей, отображение ошибок API, индикатор загрузки
- Кнопка показа/скрытия пароля
- Анимированное появление карточки

### 3. Лендинг-страница

`src/pages/Landing.jsx`:

- **Hero**: слоган, кнопки «Подать заявку» / «Уже есть аккаунт»
- **Статистика**: 4 KPI-плашки
- **Возможности**: AI-интервью, анкета, видео, скоринг
- **D.R.I.V.E.**: описание пяти компетенций
- **Как подать заявку**: 5 шагов с вертикальным таймлайном
- **CTA-полоса**: тёмный фон с призывом к действию
- **Footer**: копирайт и ссылки
- Полностью адаптивный (мобильный / планшет / десктоп)

### 4. API-интеграция

Все эндпоинты из `ai_scoring_platform_api.md` подключены:

| Компонент            | Эндпоинты                                                     |
|----------------------|---------------------------------------------------------------|
| AuthPage             | `POST /api/auth/login`, `POST /api/auth/register`             |
| AuthContext          | `POST /api/applications` (после регистрации)                  |
| CandidateStatus      | `GET /detail`, `PUT /documents`, `POST /submit`               |
| CandidateQuestions   | `GET /api/questions`, `PUT .../answers`                       |
| CandidateInterview   | `POST /interview/{id}/start`, `POST .../message`              |
| CandidateVideo       | `GET .../video-questions`, `PUT .../video`                    |
| CandidateProcessing  | `GET .../status`                                              |
| CommDashboard        | `GET /api/dashboard`, `POST .../decision`                     |
| CommAnalytics        | `GET /api/stats`                                              |
| CommSettings         | `PUT /api/settings`, `POST /api/seed`                         |

При недоступности бэкенда все компоненты откатываются на mock-данные без ошибок в UI.

### 5. SVG-иконки вместо эмодзи

`src/components/icons/index.jsx` — 27 компонентов в стиле Feather Icons (минималистичный stroke, `currentColor`):

`IconDashboard`, `IconUsers`, `IconBot`, `IconTrendUp`, `IconSettings`, `IconClipboard`, `IconPen`, `IconMic`, `IconVideo`, `IconClock`, `IconZap`, `IconCheck`, `IconInfo`, `IconWarn`, `IconCamera`, `IconStop`, `IconUpload`, `IconSend`, `IconLogOut`, `IconUser`, `IconMail`, `IconLock`, `IconEye`, `IconEyeOff`, `IconArrowRight`, `IconGlobe`, `IconFilter`, `IconDownload`, `IconChevronDown`, `IconChevronUp`, `IconConstruction`, `IconLightbulb`, `IconCelebrate`

Все эмодзи в навигации, кнопках, статусах и заглушках заменены. Навигационные иконки задаются через `iconKey` в `mockData.js`.

### 6. Анимации

Все анимации реализованы на чистом CSS без сторонних библиотек, в едином стиле проекта:

| Класс / эффект         | Применение                                      |
|------------------------|-------------------------------------------------|
| `fadeIn`               | Появление блоков при загрузке страницы          |
| `slideUpGlobal`        | Вход снизу (success-экраны, тосты)              |
| `pageEnter`            | Смена раздела в Sidebar (translateY + opacity)  |
| `.skeleton` + shimmer  | Скелетон-загрузка при ожидании данных с API     |
| `spin`                 | Spinner для кнопок и обработки                  |
| Hover на карточках     | `transform: translateY(-3px)` + shadow          |
| Hover на строках таблицы | `background: var(--surface)`                  |
| Stat-cards stagger     | `animation-delay` 0.05s–0.20s для каждой       |
| Chat-msg появление     | `fadeIn .25s ease both` для каждого сообщения  |

### 7. Toast-уведомления

`src/components/shared/Toast.jsx` — глобальная система уведомлений:

- Три типа: `success` (зелёный), `error` (красный), `info` (тёмный)
- Автоматическое исчезновение через 3.5 секунды
- Анимация появления снизу
- Используется в: сохранение ответов, отправка заявки, решение по кандидату, настройки системы, вход/регистрация

### 8. Страница аналитики комиссии

`src/components/commission/CommAnalytics.jsx`:

- Загружает реальные данные из `GET /api/stats`
- KPI-карточки: всего заявок, средний AI Score, AI-флаги
- Две диаграммы: по статусам и по зонам
- Прогресс-бары распределения по зонам
- Скелетон при загрузке

### 9. Форма документов и кнопка отправки заявки

В `CandidateStatus`:

- Кнопка «+ Заполнить данные» раскрывает форму с полями: ЕНТ балл, IELTS, GPA, год окончания, школа
- Сохранение через `PUT /api/applications/{id}/documents`
- Кнопка «Отправить заявку на рассмотрение» для заявок в статусе `draft`

### 10. Seed-кнопка в настройках комиссии

В `CommSettings` добавлена карточка «Тестовые данные» с кнопкой, вызывающей `POST /api/seed`.

### 11. Мобильный bottom nav

Sidebar на экранах < 768px автоматически трансформируется в нижнее навигационное меню (fixed bottom), иконки + подписи.

---

## Примечания

- В коде отсутствуют комментарии
- Новые дизайн-решения не вводились: все изменения в рамках существующей палитры (`--accent: #C0F11C`, `--text: #0D0F0A`, шрифт Raleway)
- Сторонние UI-библиотеки не добавлялись
