document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initModals();
  initServiceDetails();
  initConsultForm();
  initCounters();
  initReveal();
  document.getElementById('year').textContent = new Date().getFullYear();
});

function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const header = document.getElementById('header');

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') document.body.classList.remove('menu-open');
  });

  // тінь у шапки після початку прокрутки
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

function initModals() {
  const formModal = document.getElementById('form-modal');

  document.querySelectorAll('[data-open-form]').forEach((btn) => {
    btn.addEventListener('click', () => formModal.showModal());
  });

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      // клік по фону (за межами вмісту) закриває вікно
      if (e.target === dialog || e.target.hasAttribute('data-close')) dialog.close();
    });
  });
}

function initServiceDetails() {
  const modal = document.getElementById('service-modal');
  const box = modal.querySelector('.service-details');

  document.querySelectorAll('.service').forEach((card) => {
    card.addEventListener('click', () => {
      const data = SERVICES[card.dataset.service];
      box.innerHTML = `
        <h3>${data.title}</h3>
        <table class="price-table">
          ${data.items.map(([name, price]) => `<tr><td>${name}</td><td>${price}</td></tr>`).join('')}
        </table>
        <p class="form__hint">Точну вартість назву після першої консультації.</p>
        <button class="btn btn--gold" data-switch-form data-topic="${card.dataset.service}">Записатися</button>
      `;
      modal.showModal();
    });
  });

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-switch-form]');
    if (!btn) return;
    modal.close();
    const formModal = document.getElementById('form-modal');
    formModal.querySelector('[name=topic]').value = btn.dataset.topic;
    formModal.showModal();
  });
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / 1200, 1);
        el.textContent = Math.round(target * progress) + (progress === 1 && target >= 100 ? '+' : '');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach((c) => observer.observe(c));
}

function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('.service, .steps li, .about, .faq details');
  items.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => observer.observe(el));
}
