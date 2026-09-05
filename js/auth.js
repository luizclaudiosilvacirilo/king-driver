// King Driver live authentication client.
// The publishable key is safe for browser use when RLS protects the database.
const SUPABASE_URL = 'https://zfsvctjqljxchxbnuvui.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_17rKbweYH7V1E0C0-TPivg_8w4hUx5A';

const message = document.getElementById('message');
const email = document.getElementById('email');
const password = document.getElementById('password');
const role = document.getElementById('role');

function setMessage(text) { message.textContent = text; }

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || data.error_description || data.message || 'Falha na autenticação.');
  }
  return data;
}

document.getElementById('signup').addEventListener('click', async () => {
  const selectedRole = role.value;
  try {
    if (!email.value.trim() || !password.value) throw new Error('Informe e-mail e senha.');
    if (password.value.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

    setMessage('Criando conta...');
    const data = await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
        data: { role: selectedRole }
      })
    });

    if (data.access_token && data.refresh_token) {
      sessionStorage.setItem('king_driver_access_token', data.access_token);
      sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);
      sessionStorage.setItem('king_driver_role', selectedRole);
      setMessage('Conta criada e login realizado.');
    } else {
      setMessage('Conta criada. Confirme o e-mail para concluir o acesso.');
    }
  } catch (error) { setMessage(error.message); }
});

document.getElementById('login').addEventListener('click', async () => {
  try {
    if (!email.value.trim() || !password.value) throw new Error('Informe e-mail e senha.');

    setMessage('Entrando...');
    const data = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });

    if (data.access_token) sessionStorage.setItem('king_driver_access_token', data.access_token);
    if (data.refresh_token) sessionStorage.setItem('king_driver_refresh_token', data.refresh_token);

    // The profile is authoritative for the user's role; the selector is only a fallback.
    if (data.user?.id && data.access_token) {
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(data.user.id)}&select=role`, {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${data.access_token}`
        }
      });
      const profiles = await profileResponse.json().catch(() => []);
      const savedRole = profiles?.[0]?.role || role.value;
      sessionStorage.setItem('king_driver_role', savedRole);
    } else {
      sessionStorage.setItem('king_driver_role', role.value);
    }

    setMessage('Login realizado com sucesso.');
  } catch (error) { setMessage(error.message); }
});
