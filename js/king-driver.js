const SUPABASE_URL = window.KING_DRIVER_SUPABASE_URL || '';
const SUPABASE_KEY = window.KING_DRIVER_SUPABASE_PUBLISHABLE_KEY || window.KING_DRIVER_SUPABASE_ANON_KEY || '';

const KD = {
  session: null,
  profile: null,
  channel: null,
  async request(path, options = {}) {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase não configurado.');
    const headers = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (KD.session?.access_token) headers.Authorization = `Bearer ${KD.session.access_token}`;
    else headers.Authorization = `Bearer ${SUPABASE_KEY}`;
    const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.msg || data.error_description || 'Erro no servidor.');
    return data;
  },
  async restoreSession() {
    const access = sessionStorage.getItem('king_driver_access_token');
    const refresh = sessionStorage.getItem('king_driver_refresh_token');
    if (!access) return null;
    KD.session = { access_token: access, refresh_token: refresh };
    try {
      KD.profile = await KD.request('/rest/v1/profiles?select=*&id=eq.' + encodeURIComponent(parseJwt(access).sub), { headers: { Prefer: 'return=representation' } });
      KD.profile = KD.profile[0] || null;
    } catch (_) { KD.session = null; }
    return KD.session;
  },
  async createRide({ origin, destination, category, offeredPrice }) {
    const rows = await KD.request('/rest/v1/rides', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ origin, destination, category, offered_price: offeredPrice }) });
    return rows[0];
  },
  async getMyRides() {
    return KD.request('/rest/v1/rides?select=*&order=created_at.desc&limit=20');
  },
  async setDriverLocation(latitude, longitude, isOnline) {
    const driverId = KD.profile?.id || parseJwt(KD.session.access_token).sub;
    return KD.request('/rest/v1/driver_locations?on_conflict=driver_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ driver_id: driverId, latitude, longitude, is_online: isOnline }) });
  },
  async updateRide(id, patch) {
    const rows = await KD.request('/rest/v1/rides?id=eq.' + encodeURIComponent(id), { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(patch) });
    return rows[0];
  },
  async subscribeToRide(rideId, callback) {
    // Realtime is initialized lazily by the main UI when needed.
    callback?.({ type: 'subscribed', rideId });
  }
};

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (_) { return {}; }
}

window.KD = KD;
