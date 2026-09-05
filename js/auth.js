import './config.js';

const SUPABASE_URL = window.KING_DRIVER_SUPABASE_URL || '';
const SUPABASE_KEY = window.KING_DRIVER_SUPABASE_PUBLISHABLE_KEY || window.KING_DRIVER_SUPABASE_ANON_KEY || '';

const message = document.getElementById('message');
const email = document.getElementById('email');
const password = document.getElementById('password');
const role = document.getElementById('role');

function setMessage(text) { message.textContent = text; }
function jwtPayload(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (_) { return {}; }
}

async function request(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase não está configurado.');
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${options.accessToken || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || 'Falha na autenticação.');
  return data;
}

document.getElementById('signup').addEventListener('click', async () => {
  try {
    const selectedRole = role.value;
    if (!email.value.trim() || password.value.length < 6) throw new Error('Informe um e-mail e uma senha com pelo menos 6 caracteres.');
    setMessage('Criando conta...');
    const data = await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value, data: { role: selectedRole } })
    });
    if (data.access_token) {
      sessionStorage.setItem('king_driver_access_token', data.access_token);
      if (data.refresh_token) sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);
      sessionStorage.setItem('king_driver_role', selectedRole);
      setMessage('Conta criada e login realizado.');
    } else {
      setMessage('Conta criada. Confirme o e-mail para continuar.');
    }
  } catch (error) { setMessage(error.message); }
});

document.getElementById('login').addEventListener('click', async () => {
  try {
    setMessage('Entrando...');
    const data = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });
    sessionStorage.setItem('king_driver_access_token', data.access_token);
    if (data.refresh_token) sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);
    const userId = jwtPayload(data.access_token).sub;
    const profiles = await request(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(userId)}`, { accessToken: data.access_token });
    const profile = profiles[0];
    if (profile?.role) role.value = profile.role;
    sessionStorage.setItem('king_driver_role', profile?.role || role.value);
    setMessage('Login realizado com sucesso.');
    setTimeout(() => { window.location.href = 'index.html'; }, 500);
  } catch (error) { setMessage(error.message); }
});
