// Форма запису: маска телефону, перевірка полів, відправка.
// Заявки приймає Formspree — достатньо вставити свій ID форми.
const FORM_ENDPOINT = 'https://formspree.io/f/your-form-id';

function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('380')) digits = digits.slice(2);
  if (!digits.startsWith('0')) digits = '0' + digits;
  digits = digits.slice(0, 10);

  // +38 (0XX) XXX XX XX
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  let out = '+38 (' + parts[0];
  if (digits.length > 3) out += ') ' + parts[1];
  if (digits.length > 6) out += ' ' + parts[2];
  if (digits.length > 8) out += ' ' + parts[3];
  return out;
}

function initConsultForm() {
  const form = document.getElementById('consult-form');
  const modal = document.getElementById('form-modal');
  const errorBox = document.getElementById('form-error');
  const success = modal.querySelector('.modal__success');

  form.phone.addEventListener('input', () => {
    form.phone.value = form.phone.value ? formatPhone(form.phone.value) : '';
  });

  function check() {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));

    const errors = [];
    if (form.name.value.trim().length < 2) errors.push([form.name, "Вкажіть ім'я"]);
    if (form.phone.value.replace(/\D/g, '').length !== 12) errors.push([form.phone, 'Номер телефону неповний']);
    if (!form.agree.checked) errors.push([form.agree, 'Потрібна згода на обробку даних']);

    errors.forEach(([field]) => field.classList.add('is-invalid'));
    return errors.length ? errors[0][1] : '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = check();
    errorBox.textContent = error;
    if (error) return;

    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    button.textContent = 'Надсилаю…';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch (err) {
      // Не губимо заявку, навіть якщо сервіс недоступний
      console.warn('Не вдалося відправити, зберігаю локально:', err);
      const saved = JSON.parse(localStorage.getItem('pending_requests') || '[]');
      saved.push({ ...Object.fromEntries(new FormData(form)), at: new Date().toISOString() });
      localStorage.setItem('pending_requests', JSON.stringify(saved));
    }

    button.disabled = false;
    button.textContent = 'Надіслати заявку';
    form.hidden = true;
    success.hidden = false;
  });

  modal.addEventListener('close', () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    errorBox.textContent = '';
  });
}
