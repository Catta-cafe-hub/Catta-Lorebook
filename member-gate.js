/**
 * Verify the shared Catta login at page load or account change only.
 * No timer, focus check, or automatic retry. API authorization remains required.
 * Private books and unlock grants are never persisted by this module.
 */
export function createMemberGate({
    root, hasCredentials, readCredentials, check, clearPrivateMemory,
    windowObject = globalThis.window,
}) {
    if (!root || typeof check !== 'function' || typeof readCredentials !== 'function') {
        throw new TypeError('MEMBER_GATE_SETUP');
    }
    const status = root.ownerDocument.createElement('p');
    status.dataset.clbMemberStatus = 'true';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'clb-note clb-member-gate';
    const retry = root.ownerDocument.createElement('button');
    retry.type = 'button';
    retry.className = 'clb-secondary';
    retry.dataset.clbMemberRetry = 'true';
    retry.textContent = 'ลองเชื่อมต่ออีกครั้ง';
    retry.hidden = true;
    const account = root.querySelector('[data-clb="account"]');
    if (account) account.insertAdjacentElement('afterend', status);
    else root.prepend(status);
    status.insertAdjacentElement('afterend', retry);

    let state = 'checking', verifiedSignature = null, hadPrivateContent = false;
    let epoch = 0, destroyed = false, inFlight = null;
    const signature = () => {
        const value = readCredentials();
        return [String(value?.uid || ''), String(value?.token || '')];
    };
    const same = (left, right) => Boolean(left && right && left[0] === right[0] && left[1] === right[1]);
    const valid = value => /^\d{15,22}$/.test(value[0]) && value[1].length >= 8 && value[1].length <= 256 && hasCredentials();
    const setStatus = next => {
        if (destroyed) return;
        state = next;
        if (next !== 'authorized') verifiedSignature = null;
        root.dataset.clbMemberGate = next;
        status.textContent = next === 'authorized' ? '' : next === 'checking'
            ? '⏳ กำลังเชื่อมบัญชี Catta…' : next === 'missing'
                ? '🔒 กรุณาเข้าสู่ระบบด้วยบัญชี Catta ที่เป็นสมาชิก Discord ก่อนใช้งาน Lorebook'
                : 'ยังเชื่อมต่อ Catta ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่';
        status.hidden = next === 'authorized';
        retry.hidden = next !== 'unavailable';
        retry.disabled = false;
    };
    const reject = kind => {
        setStatus(kind);
        if (hadPrivateContent) {
            hadPrivateContent = false;
            clearPrivateMemory?.();
        }
    };
    const verify = ({ force = false } = {}) => {
        if (destroyed) return Promise.resolve(false);
        const prior = signature();
        if (!valid(prior)) {
            epoch++; inFlight = null; reject('missing');
            return Promise.resolve(false);
        }
        if (inFlight && same(prior, inFlight.signature)) return inFlight.promise;
        const trusted = state === 'authorized' && same(prior, verifiedSignature);
        if (!force && trusted) return Promise.resolve(true);
        if (!trusted && hadPrivateContent) reject('missing');
        const request = ++epoch;
        if (!trusted) setStatus('checking');
        retry.disabled = true;
        const promise = (async () => {
            try {
                const result = await Promise.resolve().then(check);
                if (request !== epoch || destroyed) return false;
                if (!same(prior, signature())) { reject('missing'); return false; }
                if (!result?.success || String(result.user?.uid) !== prior[0]) { reject('missing'); return false; }
                verifiedSignature = prior;
                setStatus('authorized');
                hadPrivateContent = true;
                return true;
            } catch (error) {
                if (request !== epoch || destroyed) return false;
                if (!same(prior, signature())) { reject('missing'); return false; }
                const denied = ['AUTH_REQUIRED','AUTH_EXPIRED','ACCESS_DENIED','NOT_A_MEMBER'].includes(error?.code);
                if (denied) reject('missing');
                else if (trusted && same(prior, verifiedSignature)) {
                    // A timeout is not proof that the member lost access.
                    // Each content/generation/upload request still checks the server.
                    status.textContent = 'ติดต่อ Catta ไม่สำเร็จ ลอร์บุ๊กที่เลือกยังอยู่ กรุณาลองใหม่';
                    status.hidden = false; retry.hidden = false;
                } else setStatus('unavailable');
                return false;
            } finally {
                if (request === epoch && !destroyed) { inFlight = null; retry.disabled = false; }
            }
        })();
        inFlight = { signature: prior, promise };
        return promise;
    };
    const onStorage = event => {
        if (event?.key != null && !['catta_uid','catta_auth_token'].includes(event.key)) return;
        const current = signature();
        if (state === 'authorized' && same(current, verifiedSignature)) return;
        if (inFlight && same(current, inFlight.signature)) return;
        epoch++; inFlight = null; reject('missing');
        void verify();
    };
    const onHide = () => {
        destroyed = true; epoch++; inFlight = null; verifiedSignature = null;
        windowObject?.removeEventListener?.('storage', onStorage);
        windowObject?.removeEventListener?.('pagehide', onHide);
    };
    retry.addEventListener('click', () => { void verify({ force:true }); });
    setStatus('checking');
    windowObject?.addEventListener?.('storage', onStorage);
    windowObject?.addEventListener?.('pagehide', onHide);
    void verify();
    return {
        verify,
        snapshot: () => ({ status:state, authorized:!destroyed && state === 'authorized' && same(signature(), verifiedSignature) }),
        dispose: onHide,
    };
}
