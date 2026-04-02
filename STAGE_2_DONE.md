# Этап 2 — Выполнено

## Что сделано в этапе 2

### 1. Auto-create application after register
`AuthContext.jsx` — после успешной регистрации абитуриента автоматически вызывается `POST /api/applications` с `program: 'foundation'`. Полученный `id` сохраняется в `localStorage` как `app_id` и проставляется в контекст пользователя. Все компоненты используют `user.appId` для запросов.

### 2. Форма академических данных + submit заявки
В `CandidateStatus` добавлен встроенный компонент `DocumentsForm`:
- Поля: ЕНТ балл, IELTS, GPA, год окончания, школа
- Сохранение через `PUT /api/applications/{id}/documents`
- Кнопка «Отправить заявку» (`POST /api/applications/{id}/submit`) появляется только при статусе `draft`

### 3. Страница аналитики комиссии
`CommAnalytics.jsx` — подключает `GET /api/stats`:
- KPI-карточки: total, avg_final_score, ai_flagged
- BarChart по статусам и по зонам
- Скелетон при загрузке

### 4. Toast-уведомления
`src/components/shared/Toast.jsx` — глобальная система:
- `success` / `error` / `info` цвета
- Автоскрытие через 3.5с
- Анимация slideUp
- Используется в: Auth, CandidateStatus, CandidateQuestions, CommDashboard, CommSettings

### 5. Seed-кнопка
В `CommSettings` добавлена секция «Тестовые данные» с кнопкой вызова `POST /api/seed`.

---

## Что осталось (Этап 3, низкий приоритет)

- [ ] **i18n** — реальный перевод RU/KZ/EN (переключатель в Sidebar сейчас декоративный)
- [ ] **Детальная страница кандидата** — отдельный экран для `GET /api/applications/{id}/detail` с полным профилем, а не раскрывающаяся строка таблицы
- [ ] **Фильтр и поиск** кандидатов в `CommDashboard`
- [ ] **PWA / offline** — service worker, install prompt
- [ ] **e2e-тесты** — Playwright или Cypress для основных флоу
- [ ] **Refresh token** — сейчас JWT хранится без механизма обновления; при истечении токена нужен редирект на авторизацию
- [ ] **ReactBits анимации** — TextReveal, CountUp для заголовков и счётчиков дашборда при сохранении стиля
