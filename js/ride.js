import './config.js';

const SUPABASE_URL = window.KING_DRIVER_SUPABASE_URL;
const SUPABASE_KEY = window.KING_DRIVER_SUPABASE_PUBLISHABLE_KEY;
const ACCESS_TOKEN_KEY = 'king_driver_access_token';

export function getAccessToken() { return sessionStorage.getItem(ACCESS_TOKEN_KEY) || ''; }

async function api(path, options = {}) {
  const token = getAccessToken();
  if (!SUPABASE_URL || !SUPABASE_KEY || !token) throw new Error('Faça login para continuar.');
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.msg || data.error_description || 'Erro na operação.');
  return data;
}

export async function createRide({ origin, destination, category = 'standard', offeredPrice }) {
  const rows = await api('/rest/v1/rides', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ origin, destination, category, offered_price: offeredPrice })
  });
  return rows[0];
}

export async function getMyRides() {
  return api('/rest/v1/rides?select=*&order=created_at.desc&limit=20');
}

export async function acceptRide(rideId) {
  const rows = await api('/rest/v1/rpc/accept_ride', {
    method: 'POST',
    body: JSON.stringify({ p_ride_id: rideId })
  });
  return rows;
}

export async function updateRideStatus(rideId, status) {
  return api('/rest/v1/rpc/update_ride_status', {
    method: 'POST',
    body: JSON.stringify({ p_ride_id: rideId, p_status: status })
  });
}

export function subscribeToRide(rideId, onChange) {
  const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + `/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_KEY)}&vsn=1.0.0`;
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ topic: `realtime:public:rides:id=eq.${rideId}`, event: 'phx_join', payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: 'rides', filter: `id=eq.${rideId}` }] } }, ref: '1' }));
  };
  ws.onmessage = event => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === 'postgres_changes') onChange(msg.payload?.data?.record || msg.payload?.record || msg.payload?.data);
    } catch (_) {}
  };
  return () => { try { ws.close(); } catch (_) {} };
}
