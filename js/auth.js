import './config.js';

const URL = window.KING_DRIVER_SUPABASE_URL;
const KEY = window.KING_DRIVER_SUPABASE_PUBLISHABLE_KEY;
const SITE_URL = 'https://king-driver.pages.dev';
const REDIRECT_URL = `${SITE_URL}/auth.html`;

const $ = (id) => document.getElementById(id);
const msg = $('message');

function setMessage(text) {
  if (msg) msg.textContent = text;
}

function emailValue() {
  return $('email')?.value.trim().toLowerCase() || '';
}

async function request(path, options = {}) {
  const token = options.accessToken || KEY;
  const response = await fetch(`${URL}${path}`, {
    ...options,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || data.error_description || data.message || 'Falha na operação.');
  }
  return data;
}

async function finish(data, selectedRole = 'passenger') {
  sessionStorage.setItem('king_driver_access_token', data.access_token);
  if (data.refresh_token) sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);
  sessionStorage.setItem('king_driver_role', selectedRole);
  setMessage('Login realizado. Abrindo o King Driver...');
  setTimeout(() => { location.href = selectedRole === 'admin' ? 'admin.html' : 'index.html'; }, 300);
}

async function consumeRedirectSession() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, '?'));
  const accessToken = hash.get('access_token');
  const type = hash.get('type');
  if (!accessToken) return;

  history.replaceState(null, '', location.pathname + location.search);
  if (type === 'recovery') {
    setMessage('Link de recuperação confirmado.');
    return;
  }

  setMessage('E-mail confirmado. Entrando no King Driver...');
  try {
    const profile = await request('/rest/v1/profiles?select=role&limit=1', { accessToken });
    const role = profile[0]?.role || sessionStorage.getItem('king_driver_role') || 'passenger';
    await finish({ access_token: accessToken, refresh_token: hash.get('refresh_token') || '' }, role);
  } catch (error) {
    setMessage(error.message || 'E-mail confirmado. Faça login para continuar.');
  }
}

async function sendMagicLink() {
  const email = emailValue();
  const fullName = $('full_name')?.value.trim() || '';
  const phone = $('phone')?.value.trim() || '';
  const selectedRole = $('role')?.value || 'passenger';
  if (!email) throw new Error('Informe seu e-mail.');

  setMessage(`Enviando link de autorização para ${email}...`);
  await request(`/auth/v1/otp?redirect_to=${encodeURIComponent(REDIRECT_URL)}`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      create_user: true,
      data: { role: selectedRole, full_name: fullName, phone },
    }),
  });

  sessionStorage.setItem('king_driver_role', selectedRole);
  if ($('resend')) {
    $('resend').hidden = false;
    $('resend').dataset.email = email;
  }
  setMessage(`E-mail enviado para ${email}. Verifique Entrada, Spam e Promoções.`);
}

$('signup').onclick = async () => {
  try {
    const email = emailValue();
    const password = $('password')?.value || '';
    const selectedRole = $('role')?.value || 'passenger';
    const fullName = $('full_name')?.value.trim() || '';
    const phone = $('phone')?.value.trim() || '';
    if (!fullName) throw new Error('Informe seu nome completo.');
    if (!email || password.length < 6) throw new Error('Informe e-mail e senha com pelo menos 6 caracteres.');

    setMessage(`Criando conta para ${email}...`);
    const data = await request(`/auth/v1/signup?redirect_to=${encodeURIComponent(REDIRECT_URL)}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { role: selectedRole, full_name: fullName, phone } }),
    });

    if (data.access_token) {
      await finish(data, selectedRole);
      return;
    }

    sessionStorage.setItem('king_driver_role', selectedRole);
    if ($('resend')) {
      $('resend').hidden = false;
      $('resend').dataset.email = email;
    }
    setMessage(`E-mail enviado para ${email}. Verifique Entrada, Spam e Promoções.`);
  } catch (error) {
    setMessage(error.message || 'Não foi possível criar a conta.');
  }
};

$('resend').onclick = async () => {
  try { await sendMagicLink(); }
  catch (error) { setMessage(error.message || 'Não foi possível reenviar o e-mail.'); }
};

if ($('magic_link')) {
  $('magic_link').onclick = async () => {
    try { await sendMagicLink(); }
    catch (error) { setMessage(error.message || 'Não foi possível enviar o link de autorização.'); }
  };
}

$('login').onclick = async () => {
  try {
    const email = emailValue();
    const password = $('password')?.value || '';
    if (!email || !password) throw new Error('Informe e-mail e senha.');
    setMessage('Entrando...');
    const data = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const profile = await request(`/rest/v1/profiles?select=role,full_name&id=eq.${encodeURIComponent(data.user?.id || '')}`, { accessToken: data.access_token });
    await finish(data, profile[0]?.role || $('role')?.value || 'passenger');
  } catch (error) {
    setMessage(error.message || 'Não foi possível entrar.');
  }
};

consumeRedirectSession();
