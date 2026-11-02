/** Production Cloud transport. Credentials share Catta's existing login storage. */
const BASE_URL = 'https://st-cattacafe.casa/v1/lorebook';
export function createLorebookCloud({ LorebookError, limits, parseBook, fetcher = globalThis.fetch.bind(globalThis), storage = globalThis.localStorage }) {
    const credentials = () => ({ uid: storage.getItem('catta_uid') || '', token: storage.getItem('catta_auth_token') || '' });
    const fail = code => new LorebookError(code);
    async function request(action, { body, form, creds, signal } = {}) {
        const auth = creds || credentials();
        if (!/^\d{15,22}$/.test(auth.uid) || !auth.token || auth.token.length > 256) throw fail('AUTH_REQUIRED');
        const headers = { 'x-uid': auth.uid, 'x-token': auth.token };
        if (body) headers['Content-Type'] = 'application/json';
        let response;
        try {
            response = await fetcher(`${BASE_URL}/${action}`, {
                method: body || form ? 'POST' : 'GET', headers, body: form || (body ? JSON.stringify(body) : undefined),
                cache: 'no-store', credentials: 'omit', signal: signal || AbortSignal.timeout(25_000),
            });
        } catch { throw fail('CLOUD_UNAVAILABLE'); }
        let result;
        try { result = await response.json(); } catch { throw fail('CLOUD_UNAVAILABLE'); }
        if (!creds) {
            const current = credentials();
            if (auth.uid !== current.uid || auth.token !== current.token) throw fail('AUTH_REQUIRED');
        }
        if (!response.ok || !result.success) throw fail(result.code || 'CLOUD_UNAVAILABLE');
        return result;
    }
    const grantBody = (id, token) => token ? { id, unlock_token: token } : { id };
    return {
        credentials,
        hasCredentials: () => { const value = credentials(); return !!(value.uid && value.token); },
        me: () => request('me'),
        async login(uid, token) {
            const auth = { uid: uid.trim(), token: token.trim() };
            const result = await request('me', { creds: auth });
            storage.setItem('catta_uid', auth.uid); storage.setItem('catta_auth_token', auth.token);
            return result;
        },
        search: (query = '', mine = false, offset = 0) => request(`search?q=${encodeURIComponent(query)}&mine=${mine ? '1' : '0'}&offset=${offset}`),
        async content(id, unlockToken) {
            const result = await request('content', { body: grantBody(id, unlockToken) });
            if (result.schema !== 'catta_lorebook_v1') throw fail('BOOK_FORMAT');
            parseBook(result.book); return result;
        },
        access: (id, unlockToken) => request('access', { body: grantBody(id, unlockToken) }),
        unlock: (id, pin) => request('unlock', { body: { id, pin } }),
        async upload(file, title, policy, requestKey = crypto.randomUUID()) {
            if (!file.name?.toLowerCase().endsWith('.json')) throw fail('WORLD_INFO_JSON_ONLY');
            if (file.size > limits.fileBytes) throw fail('FILE_LIMIT');
            let data;
            try { data = JSON.parse(await file.text()); } catch { throw fail('JSON_INVALID'); }
            if (!data?.entries || data.data || data.character_book) throw fail('WORLD_INFO_JSON_ONLY');
            parseBook(data);
            const form = new FormData();
            form.append('file', file); form.append('title', title.trim());
            form.append('visibility', policy.access_mode === 'all' ? 'members' : 'private');
            form.append('request_key', requestKey); form.append('policy', JSON.stringify(policy));
            return request('upload', { form });
        },
        manage: (id, action, policy) => request('manage', { body: action === 'policy' ? { id, action, policy } : { id, action } }),
    };
}
