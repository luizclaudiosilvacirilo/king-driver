// King Driver authentication scaffold.
// Configure Supabase URL and anon key before enabling live authentication.
const SUPABASE_URL = window.KING_DRIVER_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.KING_DRIVER_SUPABASE_ANON_KEY || '';

const message = document.getElementById('message');
const email = document.getElementById('email');
const password = document.getElementById('password');
const role = document.getElementById('role');

function setMessage(text) { message.textContent = text; }

async function request(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase ainda não está configurado.');
  }
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
    setMessage('Criando conta...');
    await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });
    setMessage(`Conta criada como ${role.value === 'driver' ? 'motorista' : 'passageiro'}. Confirme o e-mail se solicitado.`);
  } catch (error) { setMessage(error.message); }
});

document.getElementById('login').addEventListener('click', async () => {
  try {
    setMessage('Entrando...');
    const data = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });
    if (data.access_token) sessionStorage.setItem('king_driver_access_token', data.access_token);
    if (data.refresh_token) sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);
    sessionStorage.setItem('king_driver_role', role.value);
    setMessage('Login realizado com sucesso.');
  } catch (error) { setMessage(error.message); }
});
