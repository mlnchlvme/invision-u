import '../styles/components/Landing.css';
import { IconZap, IconBot, IconClipboard, IconMic, IconVideo, IconTrendUp, IconArrowRight } from '../components/icons';

export default function Landing({ onSignIn, onSignUp }) {
  const features = [
    {
      icon: <IconBot size={22} />,
      title: 'AI-интервью',
      desc: 'Адаптивные вопросы на основе ваших ответов. Система D.R.I.V.E. оценивает компетенции объективно.',
    },
    {
      icon: <IconClipboard size={22} />,
      title: 'Умная анкета',
      desc: 'Структурированная заявка с загрузкой документов, мотивационными эссе и академическими данными.',
    },
    {
      icon: <IconVideo size={22} />,
      title: 'Видео-презентация',
      desc: 'Запишите самопрезентацию прямо в браузере. Встроенная проверка личности гарантирует честность.',
    },
    {
      icon: <IconTrendUp size={22} />,
      title: 'Прозрачный скоринг',
      desc: 'Каждый аспект заявки оценивается по прозрачным критериям. Вы видите статус в реальном времени.',
    },
  ];

  const steps = [
    { title: 'Регистрация', desc: 'Создайте аккаунт и заполните основные данные о себе.' },
    { title: 'Документы и эссе', desc: 'Загрузите документы, аттестат и напишите три мотивационных эссе.' },
    { title: 'AI-интервью', desc: 'Пройдите адаптивное интервью — система задаст вопросы по методологии D.R.I.V.E.' },
    { title: 'Видео-представление', desc: 'Запишите короткое видео, где расскажете о себе и своих целях.' },
    { title: 'Решение комиссии', desc: 'AI анализирует заявку, комиссия принимает финальное решение в течение 2–3 недель.' },
  ];

  const drive = [
    { letter: 'D', name: 'Disciplined Resilience', desc: 'Стойкость и самодисциплина в достижении целей' },
    { letter: 'R', name: 'Responsible Innovation', desc: 'Ответственный подход к новым идеям и решениям' },
    { letter: 'I', name: 'Insightful Vision', desc: 'Способность видеть суть и мыслить стратегически' },
    { letter: 'V', name: 'Values-Driven Leadership', desc: 'Лидерство, основанное на ценностях' },
    { letter: 'E', name: 'Entrepreneurial Execution', desc: 'Воплощение идей в конкретные результаты' },
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-mark">
            <IconZap size={16} />
          </div>
          <span className="landing-nav-name">inVision U</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={onSignIn}>Войти</button>
          <button className="btn btn-primary btn-sm" onClick={onSignUp}>Подать заявку</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-tag">
          <IconZap size={12} />
          Приёмная кампания 2026
        </div>
        <h1>
          Поступите в <span>inVision U</span><br />— будущее начинается здесь
        </h1>
        <p>
          Умная платформа для поступления с AI-интервью, прозрачным скорингом и мгновенной обратной связью.
          Мы ищем лидеров, готовых изменить Казахстан.
        </p>
        <div className="landing-hero-cta">
          <button className="btn btn-dark btn-lg" onClick={onSignUp}>
            Подать заявку
            <IconArrowRight size={16} />
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onSignIn}>
            Уже есть аккаунт
          </button>
        </div>
      </section>

      <div className="landing-stats">
        {[
          { val: '142+', lbl: 'Кандидатов 2026' },
          { val: '5',    lbl: 'Направлений' },
          { val: '61%',  lbl: 'Из регионов' },
          { val: 'AI',   lbl: 'Оценка D.R.I.V.E.' },
        ].map((s, i) => (
          <div key={i} className="landing-stat">
            <div className="landing-stat-val">{s.val}</div>
            <div className="landing-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <section className="landing-section">
        <div className="landing-section-tag">Возможности платформы</div>
        <h2>Всё необходимое для поступления</h2>
        <p>Единый портал от подачи заявки до финального решения — без лишней бумажной волокиты.</p>
        <div className="landing-features">
          {features.map((f, i) => (
            <div key={i} className="landing-feature">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" style={{ background: 'var(--surface)', maxWidth: '100%', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="landing-section-tag">Методология оценки</div>
          <h2>Система D.R.I.V.E.</h2>
          <p>Пять ключевых компетенций, которые мы оцениваем при отборе. AI-анализ интервью и эссе даёт объективный срез.</p>
          <div className="landing-drive">
            {drive.map((d, i) => (
              <div key={i} className="landing-drive-item">
                <div className="landing-drive-letter">{d.letter}</div>
                <h4>{d.name}</h4>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-tag">Процесс</div>
        <h2>Как подать заявку</h2>
        <p>Весь процесс занимает 30–60 минут. Проходите этапы в удобном для вас темпе.</p>
        <div className="landing-steps">
          {steps.map((s, i) => (
            <div key={i} className="landing-step">
              <div className="landing-step-line" />
              <div className="landing-step-num">{i + 1}</div>
              <div className="landing-step-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-cta-band">
        <h2>Готовы начать?</h2>
        <p>Регистрация займёт 2 минуты. Дедлайн подачи — 1 мая 2026.</p>
        <button className="btn btn-primary" onClick={onSignUp}>
          Зарегистрироваться
          <IconArrowRight size={16} />
        </button>
      </div>

      <footer className="landing-footer">
        <div className="landing-footer-copy">© 2026 inVision U. Все права защищены.</div>
        <div className="landing-footer-links">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Условия использования</a>
          <a href="#">Контакты</a>
        </div>
      </footer>
    </div>
  );
}
