/**
 * Catta-Lorebook 0.3 membership gate.
 * UI lock is convenience only; Cloud API is the authoritative access control.
 * Never stores downloaded Lorebook, chat history, or credentials.
 */
export const RECHECK_MS = 120_000;

export function createMemberGate({
    root,
    hasCredentials,
    readCredentials,
    check,
    clearPrivateMemory,
    windowObject = globalThis.window,
    clock = () => Date.now(),
    intervalMs = RECHECK_MS,
    setIntervalFn = globalThis.setInterval?.bind(globalThis),
    clearIntervalFn = globalThis.clearInterval?.bind(globalThis),
}) {
    if (!root || typeof check !== 'function' || typeof readCredentials !== 'function') {
        throw new TypeError('MEMBER_GATE_SETUP');
    }
    const status = root.ownerDocument.createElement('p');
    status.dataset.clbMemberStatus = 'true';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'clb-note clb-member-gate';
    const account = root.querySelector('[data-clb="account"]');
    if (account) account.insertAdjacentElement('afterend', status);
    else root.prepend(status);

    let state = 'checking', verifiedAt = 0, verifiedSignature = null, hadPrivateContent = false;
    let epoch = 0, interval = null, destroyed = false;

    const signature = () => {
        const v = readCredentials();
        return [String(v?.uid || ''), String(v?.token || '')];
    };
    const same = (a, b) => Boolean(a && b && a[0] === b[0] && a[1] === b[1]);
    const setStatus = (next) => {
        if (destroyed) return;
        state = next;
        if (next !== 'authorized') verifiedSignature = null;
        root.dataset.clbMemberGate = next;
        status.textContent = next === 'authorized'
            ? ''
            : next === 'checking'
                ? '⏳ กำลังตรวจสมาชิก Catta…'
                : next === 'missing'
                    ? '🔒 กรุณาเข้าสู่ระบบด้วยบัญชี Catta ที่เป็นสมาชิก Discord ก่อนใช้งาน Lorebook'
                    : '🔒 ยังยืนยันสมาชิก Catta ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่';
        status.hidden = next === 'authorized';
    };
    const reject = (kind) => {
        const previous = state;
        setStatus(kind);
        // Revoke previously downloaded private books when access is lost.
        if (hadPrivateContent) {
            hadPrivateContent = false;
            clearPrivateMemory?.();
        }
    };
    const verify = async ({ force = false } = {}) => {
        if (destroyed) return false;
        const request = ++epoch;
        const prior = signature();
        if (!/^\d{15,22}$/.test(prior[0]) || !prior[1] || prior[1].length > 256 || !hasCredentials()) {
            reject('missing');
            return false;
        }
        if (!force && state === 'authorized' && same(prior, verifiedSignature)
            && clock() - verifiedAt < intervalMs) return true;
        setStatus('checking');
        try {
            const result = await check();
            if (request !== epoch || destroyed) return false;
            if (!same(prior, signature())) {
                reject('missing');
                return false;
            }
            if (!result?.success || String(result?.user?.uid) !== prior[0]) {
                reject('missing');
                return false;
            }
            verifiedSignature = prior;
            verifiedAt = clock();
            setStatus('authorized');
            hadPrivateContent = true;
            return true;
        } catch (error) {
            if (request === epoch && !destroyed) reject('unavailable');
            return false;
        }
    };
    const onFocus = () => { void verify({ force: true }); };
    const onStorage = (event) => {
        if (event?.key === 'catta_uid' || event?.key === 'catta_auth_token') {
            epoch++;
            reject('missing');
            void verify({ force: true });
        }
    };
    const onHide = () => {
        destroyed = true;
        epoch++;
        if (interval != null) clearIntervalFn?.(interval);
        windowObject?.removeEventListener?.('focus', onFocus);
        windowObject?.removeEventListener?.('storage', onStorage);
        windowObject?.removeEventListener?.('pagehide', onHide);
    };
    setStatus('checking');
    windowObject?.addEventListener?.('focus', onFocus);
    windowObject?.addEventListener?.('storage', onStorage);
    windowObject?.addEventListener?.('pagehide', onHide);
    if (setIntervalFn) interval = setIntervalFn(() => { void verify({ force: true }); }, intervalMs);
    void verify();
    return {
        verify,
        snapshot: () => ({
            status: state,
            authorized: state === 'authorized'
                && same(signature(), verifiedSignature)
                && clock() - verifiedAt < intervalMs,
        }),
        dispose: onHide,
    };
}
