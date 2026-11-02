/** Catta Lorebook UI. Cloud API remains the authority for all access checks. */
export function createLorebookUI({ target, runtime, context, showError, cloud, LorebookError, limits }) {
    const root = document.createElement('section');
    root.id = 'catta-lorebook';
    root.className = 'extension_container';
    const asset = name => new URL(`./assets/${name}.webp`, import.meta.url).href;
    root.innerHTML = `
      <details class="clb-shell" open>
        <summary class="clb-header"><span class="clb-brand"><img class="clb-brand-icon" src="${asset('icon_magic_book')}" width="34" height="38" alt="" aria-hidden="true"><span>Catta Lorebook<small>CATTA CAFÉ EXTENSION</small></span></span><span class="clb-chevron">⌄</span></summary>
        <div class="clb-body">
          <section class="clb-hero"><div><small>✦ CATTA CLOUD LIBRARY</small><h2>เรื่องราวของคุณ<br><span>อยู่ใกล้แค่เอื้อม</span></h2><p>จัดเก็บ ค้นหา และเลือกใช้ Lorebook<br>บน SillyTavern ได้ในที่เดียว</p></div><img src="${asset('mascot_reading')}" alt="" aria-hidden="true"></section>
          <section class="clb-account"><div class="clb-account-line"><img src="${asset('mascot_happy')}" alt=""><div><small>บัญชี Catta</small><p data-clb="account">ยังไม่ได้เชื่อมบัญชี Catta</p><span data-clb="quota" class="clb-note"></span></div></div>
            <details data-clb="login-box"><summary>เชื่อมบัญชี / เปลี่ยนบัญชี Catta</summary>
              <label class="clb-field">Discord User ID<input data-clb="uid" inputmode="numeric" autocomplete="off"></label>
              <label class="clb-field">Login Token<input data-clb="token" type="password" autocomplete="off"></label>
              <button data-clb="login" type="button" class="clb-primary">เข้าสู่ระบบและเชื่อมส่วนเสริม</button>
            </details>
          </section>
          <nav class="clb-tabs" role="tablist" aria-label="เมนู Catta Lorebook">
            <button type="button" role="tab" id="clb-tab-mine" data-tab="mine" aria-controls="clb-pane-mine" aria-selected="true">▤ ของฉัน</button>
            <button type="button" role="tab" id="clb-tab-search" data-tab="search" aria-controls="clb-pane-search" aria-selected="false" tabindex="-1">⌕ ค้นหา</button>
            <button type="button" role="tab" id="clb-tab-upload" data-tab="upload" aria-controls="clb-pane-upload" aria-selected="false" tabindex="-1" hidden>↥ อัปโหลด</button>
          </nav>
          <div data-clb="search-wrap" class="clb-search-wrap" hidden><span>⌕</span><input data-clb="search" type="search" aria-label="ค้นหา Lorebook" placeholder="ชื่อ Lorebook / ผู้สร้าง / รหัส…" autocomplete="off"></div>
          <div data-pane="mine" id="clb-pane-mine" role="tabpanel" aria-labelledby="clb-tab-mine">
            <section class="clb-section clb-selected-section"><img class="clb-bookmark" src="${asset('bookmark_paw')}" width="20" height="38" alt="" aria-hidden="true"><h3>✦ Lorebook ที่เลือก</h3><div data-clb="selected"></div>
              <div data-clb="active" class="clb-active" hidden><label class="clb-enable"><span>เชื่อมกับแชทนี้</span><input data-clb="enabled" type="checkbox" role="switch"><span class="clb-track" aria-hidden="true"></span></label><p data-clb="loaded" class="clb-note"></p></div>
            </section>
            <button type="button" data-clb="start" class="clb-primary clb-start" aria-haspopup="dialog" aria-controls="clb-setup" disabled>⚙ เริ่มใช้งาน <span>✦</span></button>
            <p data-clb="start-hint" class="clb-caption">เลือก Lorebook แล้วเปิดเชื่อมกับแชทนี้</p>
            <section class="clb-section clb-library"><h3 class="clb-section-heading"><img src="${asset('icon_folder')}" width="30" height="30" alt="" aria-hidden="true">คลังของฉัน</h3><div data-clb="mine-list" class="clb-list"></div></section>
          </div>
          <div data-pane="search" id="clb-pane-search" role="tabpanel" aria-labelledby="clb-tab-search" hidden><section class="clb-section"><h3 class="clb-section-heading"><img class="clb-cloud-icon" src="${asset('cloud_decor')}" width="34" height="22" alt="" aria-hidden="true">ค้นหาใน Cloud Catta</h3><div data-clb="search-list" class="clb-list"></div></section></div>
          <div data-pane="upload" id="clb-pane-upload" role="tabpanel" aria-labelledby="clb-tab-upload" hidden><section class="clb-section"><h3 class="clb-section-heading"><img src="${asset('icon_cloud_upload')}" width="34" height="30" alt="" aria-hidden="true">เพิ่ม Lorebook ใหม่</h3>
            <div class="clb-upload-intro"><img src="${asset('icon_magic_book')}" alt=""><span><strong>เก็บเรื่องราวไว้บน Cloud</strong><small>ไฟล์ World Info JSON จาก SillyTavern · สูงสุด 2 MB</small></span></div>
            <form data-clb="upload-form">
              <label class="clb-field">ชื่อ Lorebook<input data-clb="title" maxlength="100" required autocomplete="off" placeholder="เช่น เมืองแห่งสายหมอก"></label>
              <label class="clb-field">ผู้สร้าง<input data-clb="author" readonly placeholder="ชื่อบัญชี Discord ที่ยืนยันแล้ว"></label>
              <fieldset class="clb-share"><legend>สิทธิ์การแชร์</legend>
                <label class="clb-share-choice"><input type="radio" name="clb-sharing" value="private" checked><span><strong>ส่วนตัวของฉัน</strong><small>เฉพาะเจ้าของบัญชี</small></span></label>
                <label class="clb-share-choice"><input type="radio" name="clb-sharing" value="all"><span><strong>แชร์ให้ทุกยศ</strong><small>สมาชิก Discord Catta ที่เข้าสู่ระบบใช้ได้</small></span></label>
                <label class="clb-share-choice"><input type="radio" name="clb-sharing" value="roles"><span><strong>เลือกยศที่เข้าใช้ได้</strong><small>เลือก Basic / VIP / VVIP ได้มากกว่าหนึ่งยศ</small></span></label>
                <div data-clb="role-detail" class="clb-share-detail" hidden><div class="clb-role-options">${['Basic', 'VIP', 'VVIP'].map(role => `<label><input type="checkbox" data-role="${role}">${role}</label>`).join('')}</div><p class="clb-note">ตรวจตรงตามยศที่เลือก เช่น เลือก Basic จะไม่รวม VIP อัตโนมัติ</p></div>
                <label class="clb-share-choice"><input type="radio" name="clb-sharing" value="pin"><span><strong>ล็อกใส่รหัส 6 ตัว</strong><small>สมาชิกต้องใส่รหัสก่อนเลือกใช้ โดยไม่จำกัดยศ</small></span></label>
                <div data-clb="pin-detail" class="clb-share-detail" hidden><label class="clb-field">รหัสตัวเลข 6 หลัก<input data-clb="pin" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="new-password" placeholder="กรอกรหัส 6 หลัก" disabled></label></div>
              </fieldset>
              <p data-clb="share-summary" class="clb-share-summary" role="status"></p>
              <label class="clb-drop-zone">↥ เลือกไฟล์ Lorebook JSON<input data-clb="file" type="file" accept=".json,application/json" required><small data-clb="file-name">ยังไม่ได้เลือกไฟล์</small></label>
              <button data-clb="import" type="submit" class="clb-primary">อัปโหลด Lorebook</button>
              <p data-clb="import-status" class="clb-note" role="status">1 Lorebook = 1 สล็อต · Basic 10 / VIP 20 / VVIP 100</p>
            </form>
          </section></div>
          <button type="button" data-clb="more" class="clb-secondary" hidden>โหลดรายการเพิ่ม</button>
          <p data-clb="status" class="clb-status" role="status" aria-live="polite"></p>
          <footer class="clb-footer"><div class="clb-footer-art" aria-hidden="true"><img class="clb-cuddle" src="${asset('mascot_cuddling_cat')}" width="76" height="78" alt=""><img class="clb-paw-stars" src="${asset('paw_stars_decor')}" width="72" height="36" alt=""></div>CATTA <span>✦</span> LOREBOOK<small>สิทธิ์เนื้อหา · เนื้อหาและงานเขียน Prompt ใน Lorebook เป็นผลงานและทรัพย์สินทางปัญญาของผู้สร้างแต่ละราย โปรดใช้งานตามสิทธิ์ที่ผู้สร้างกำหนด ห้ามคัดลอก ดัดแปลง เผยแพร่ หรือนำเนื้อหาไปใช้ต่อนอกสิทธิ์ที่ได้รับ</small></footer>
          <dialog data-clb="setup" id="clb-setup" class="clb-dialog" aria-labelledby="clb-setup-title"><form data-clb="setup-form">
            <div class="clb-dialog-header"><span>⚙</span><h3 id="clb-setup-title">ตั้งค่าก่อนเริ่มใช้งาน</h3><button type="button" data-clb="close-setup" class="clb-close" aria-label="ปิดการตั้งค่า">×</button></div>
            <p class="clb-note">ตั้งค่าการจับข้อความและงบโทเคนสำหรับ Lorebook ที่เลือก</p>
            <div class="clb-options"><label class="clb-field">สแกนข้อความล่าสุด<input data-clb="scan" type="number" min="1" max="100" required step="1"></label><label class="clb-field">งบโทเคน<input data-clb="budget" type="number" min="64" max="${limits.tokenBudget}" required step="1"></label></div>
            <p class="clb-note">นับข้อความแชทล่าสุดเพื่อจับ Keywords · งบโทเคนกำหนดปริมาณ Lorebook ที่ส่งให้ AI</p>
            <div class="clb-dialog-actions"><button type="button" data-clb="cancel-setup" class="clb-secondary">ยกเลิก</button><button type="submit" class="clb-primary">บันทึกและเริ่มใช้งาน</button></div>
            <p data-clb="setup-status" class="clb-status" role="status"></p>
          </form></dialog>
          <dialog data-clb="unlock-dialog" class="clb-dialog" aria-labelledby="clb-unlock-title"><form data-clb="unlock-form">
            <div class="clb-dialog-header"><span>♧</span><h3 id="clb-unlock-title">ปลดล็อก Lorebook</h3><button type="button" data-clb="close-unlock" class="clb-close" aria-label="ปิดหน้าปลดล็อก">×</button></div>
            <p data-clb="unlock-book" class="clb-note"></p>
            <label class="clb-field">รหัสตัวเลข 6 หลัก<input data-clb="unlock-pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="off" placeholder="กรอกรหัสจากผู้สร้าง"></label>
            <p data-clb="unlock-status" class="clb-status" role="status"></p>
            <div class="clb-dialog-actions"><button type="button" data-clb="cancel-unlock" class="clb-secondary">ยกเลิก</button><button type="submit" data-clb="unlock-submit" class="clb-primary">ปลดล็อกและเลือกใช้</button></div>
          </form></dialog>
          <dialog data-clb="policy-dialog" class="clb-dialog" aria-labelledby="clb-policy-title"><form data-clb="policy-form">
            <div class="clb-dialog-header"><span>⚙</span><h3 id="clb-policy-title">สิทธิ์การแชร์ Lorebook</h3><button type="button" data-clb="close-policy" class="clb-close" aria-label="ปิดการตั้งค่าสิทธิ์">×</button></div>
            <p data-clb="policy-book" class="clb-note"></p>
            <label class="clb-field">ให้ใครเข้าใช้ได้<select data-clb="policy-mode"><option value="private">ส่วนตัวของฉัน</option><option value="all">แชร์ให้ทุกยศ</option><option value="roles">เลือกยศที่เข้าใช้ได้</option><option value="pin">ล็อกรหัส 6 หลัก</option></select></label>
            <div data-clb="policy-roles" class="clb-role-options">${['Basic','VIP','VVIP'].map(role => `<label><input type="checkbox" data-policy-role="${role}">${role}</label>`).join('')}</div>
            <label data-clb="policy-pin-wrap" class="clb-field">กำหนดรหัสใหม่ 6 หลัก<input data-clb="policy-pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="new-password"><small>การบันทึกโหมดล็อกรหัสจะเปลี่ยนรหัสและยกเลิกการปลดล็อกเดิม</small></label>
            <p data-clb="policy-status" class="clb-status" role="status"></p>
            <div class="clb-dialog-actions"><button type="button" data-clb="cancel-policy" class="clb-secondary">ยกเลิก</button><button type="submit" data-clb="policy-submit" class="clb-primary">บันทึกสิทธิ์</button></div>
          </form></dialog>
        </div>
      </details>`;
    target.appendChild(root);
    const el = name => root.querySelector(`[data-clb="${name}"]`);
    const tabs = [...root.querySelectorAll('[data-tab]')];
    const key = () => {
        const ctx = context();
        const avatar = ctx.characters?.[ctx.characterId]?.avatar;
        return !ctx.groupId && avatar && ctx.chatId != null ? JSON.stringify([avatar, ctx.chatId]) : null;
    };
    const error = code => new LorebookError(code);
    let account = null, quota = null, capabilities = null, pane = 'mine', items = [], offset = 0, hasMore = false;
    let searchEpoch = 0, selectionEpoch = 0, accountEpoch = 0, searchTimer, uploadBusy = false, loading = false;
    let setupKey = null;
    let pendingUnlock = null, pendingPolicy = null, uploadRequestKey = null;
    const bindings = new Map();
    const connections = new Map();
    const grants = new Map();
    let currentKey = key();
    const selected = () => bindings.get(key());
    const setStatus = text => { el('status').textContent = text; };
    const mode = () => root.querySelector('[name="clb-sharing"]:checked').value;
    const canUpload = () => quota?.can_upload === true;
    function syncUploadPermission() {
        const allowed = canUpload();
        root.dataset.clbCanUpload = String(allowed);
        tabs.find(tab => tab.dataset.tab === 'upload').hidden = !allowed;
        if (!allowed && pane === 'upload') switchTab('mine');
    }
    const sharingReady = () => capabilities?.sharing_version === 1 && ['private','all','roles','pin'].every(value => capabilities.access_modes?.includes(value));
    const readPolicy = () => {
        if (!canUpload()) throw error('UPLOAD_ROLE_REQUIRED');
        const value = mode();
        if (!sharingReady()) throw error('SHARING_UNAVAILABLE');
        if (value === 'roles') {
            const roles = [...root.querySelectorAll('[data-role]:checked')].map(input => input.dataset.role);
            if (!roles.length) throw error('POLICY_INVALID');
            return { access_mode: value, allowed_roles: roles };
        }
        if (value === 'pin') {
            if (!/^[0-9]{6}$/.test(el('pin').value)) throw error('PIN_INVALID');
            return { access_mode: value, pin: el('pin').value };
        }
        return { access_mode: value };
    };

    function sharingChanged() {
        const value = mode();
        el('role-detail').hidden = value !== 'roles';
        el('pin-detail').hidden = value !== 'pin';
        el('pin').disabled = uploadBusy || !canUpload() || value !== 'pin';
        el('pin').required = value === 'pin';
        if (value !== 'pin') el('pin').value = '';
        const roles = [...root.querySelectorAll('[data-role]:checked')].map(input => input.dataset.role);
        el('share-summary').textContent = !sharingReady() ? 'กำลังตรวจความพร้อมของระบบแชร์ กรุณารอสักครู่หรือลองเชื่อมบัญชีใหม่'
            : value === 'roles' ? roles.length ? `เปิดให้ยศ ${roles.join(' / ')} เท่านั้น` : 'เลือกอย่างน้อยหนึ่งยศเพื่อเผยแพร่'
            : value === 'pin' ? 'สมาชิก Catta ต้องกรอกรหัสก่อนเลือกใช้ ไม่จำกัดยศแพ็กเกจ'
            : value === 'all' ? 'สมาชิก Catta ที่เข้าสู่ระบบค้นหาและเลือกใช้ได้' : 'หนังสือนี้เป็นส่วนตัว เฉพาะคุณเท่านั้น';
        el('import').textContent = value === 'private' ? 'อัปโหลดแบบส่วนตัว' : value === 'pin' ? 'เผยแพร่แบบล็อกรหัส' : 'เผยแพร่ให้สมาชิก Catta';
        el('import').disabled = uploadBusy || !canUpload() || !sharingReady() || !account || quota?.remaining <= 0 || (value === 'roles' && !roles.length);
        root.querySelectorAll('[name="clb-sharing"], [data-role], [data-clb="title"], [data-clb="file"]').forEach(input => { input.disabled = uploadBusy || !canUpload(); });
    }
    function renderAccount(data, { preserveLogin = false } = {}) {
        account = data.user; quota = data.quota; capabilities = data.capabilities;
        el('account').textContent = `${account.name} · ${quota.tier}${quota.is_chef ? ' · เชฟ' : ''}`;
        el('quota').textContent = canUpload() ? `${quota.used} / ${quota.limit} สล็อต · เหลือ ${quota.remaining}` : 'เลือกใช้ Lorebook ได้ตามสิทธิ์ที่ผู้สร้างกำหนด';
        el('author').value = account.name;
        if (!preserveLogin) el('login-box').open = false;
        syncUploadPermission();
        sharingChanged();
    }
    function policyChanged() {
        const value = el('policy-mode').value;
        el('policy-roles').hidden = value !== 'roles';
        el('policy-pin-wrap').hidden = value !== 'pin';
        el('policy-pin').disabled = value !== 'pin';
        el('policy-pin').required = value === 'pin';
        if (value !== 'pin') el('policy-pin').value = '';
    }
    function openPolicy(item) {
        if (!sharingReady()) { showError(error('SHARING_UNAVAILABLE')); return; }
        pendingPolicy = { item, accountEpoch };
        el('policy-book').textContent = item.title;
        el('policy-mode').value = item.access_mode || (item.visibility === 'members' ? 'all' : 'private');
        root.querySelectorAll('[data-policy-role]').forEach(input => { input.checked = (item.allowed_roles || []).includes(input.dataset.policyRole); });
        el('policy-pin').value = ''; el('policy-status').textContent = ''; el('policy-submit').disabled = false;
        policyChanged(); el('policy-dialog').showModal();
    }
    function empty(target, text) {
        const p = document.createElement('p'); p.className = 'clb-empty'; p.textContent = text; target.append(p);
    }
    function grantFor(id) {
        const grant = grants.get(id);
        if (grant && grant.expiresAt > Date.now()) return grant.token;
        grants.delete(id); return undefined;
    }
    function openUnlock(item) {
        pendingUnlock = { item, key: key(), accountEpoch };
        el('unlock-book').textContent = item.title;
        el('unlock-pin').value = ''; el('unlock-status').textContent = '';
        el('unlock-submit').disabled = false;
        if (!el('unlock-dialog').open) el('unlock-dialog').showModal();
        el('unlock-pin').focus();
    }
    function revokeMemory() {
        selectionEpoch++; bindings.clear(); connections.clear(); grants.clear(); runtime.clearAll();
    }
    async function choose(item, unlockedToken) {
        const originalKey = key(), epoch = ++selectionEpoch, identityEpoch = accountEpoch;
        if (!originalKey) return showError(error('SELECT_CHARACTER'));
        const token = unlockedToken || grantFor(item.id);
        if (item.access_mode === 'pin' && String(item.owner_id) !== String(account?.uid) && !token) { openUnlock(item); return; }
        try {
            const data = await cloud.content(item.id, token);
            if (epoch !== selectionEpoch || identityEpoch !== accountEpoch) return;
            if (originalKey !== key()) throw error('CONTEXT_CHANGED');
            runtime.importBook(data.book);
            bindings.set(originalKey, data.metadata);
            connections.set(originalKey, false);
            runtime.setEnabled(false);
            switchTab('mine');
            update(runtime.snapshot());
        } catch (err) {
            if (identityEpoch !== accountEpoch || epoch !== selectionEpoch || originalKey !== key()) return;
            if (err.code === 'PIN_REQUIRED') { grants.delete(item.id); openUnlock(item); }
            else showError(err);
        }
    }
    function card(item, target, active = false) {
        const article = document.createElement('article'); article.className = 'clb-card';
        const title = document.createElement('strong'); title.className = 'clb-card-title'; title.textContent = item.title;
        const meta = document.createElement('small'); meta.className = 'clb-card-meta';
        meta.textContent = `${item.creator_name} · ${new Date(item.created_at).toLocaleDateString('th-TH')}`;
        const id = document.createElement('small'); id.className = 'clb-card-id'; id.textContent = `ID: ${item.id}`;
        const badge = document.createElement('span'); badge.className = 'clb-badge';
        badge.textContent = item.access_mode === 'pin' ? '♧ ล็อกรหัส 6 หลัก' : item.access_mode === 'roles' ? `✦ ${(item.allowed_roles || []).join(' / ')}` : item.visibility === 'members' ? '☁ แชร์ให้สมาชิก' : '♧ ส่วนตัว';
        article.append(title, meta, id, badge);
        if (!active) {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'clb-select';
            button.textContent = selected()?.id === item.id ? 'เลือกอยู่' : item.access_mode === 'pin' && String(item.owner_id) !== String(account?.uid) ? 'ใส่รหัสเพื่อเลือกใช้' : 'เลือกใช้';
            button.disabled = selected()?.id === item.id;
            button.addEventListener('click', () => { button.disabled = true; void choose(item).finally(() => { button.disabled = selected()?.id === item.id; }); });
            article.append(button);
        }
        if (active || String(item.owner_id) === String(account?.uid)) {
            const menu = document.createElement('details'); menu.className = 'clb-book-menu';
            const summary = document.createElement('summary'); summary.textContent = '•••'; summary.setAttribute('aria-label', `จัดการ ${item.title}`);
            const actions = document.createElement('div'); actions.className = 'clb-book-actions';
            const options = [];
            if (active) options.push(['unlink', 'เลิกใช้กับแชทนี้']);
            if (String(item.owner_id) === String(account?.uid)) options.push(['policy', 'ตั้งค่าสิทธิ์การแชร์'], ['archive', 'เก็บเข้าคลัง (คืนสล็อต)'], ['delete', 'ลบ Lorebook ถาวร']);
            for (const [action, label] of options) {
                const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
                button.addEventListener('click', async () => {
                    const identityEpoch = accountEpoch;
                    menu.open = false;
                    if (action === 'policy') { openPolicy(item); return; }
                    if (action === 'unlink') { selectionEpoch++; bindings.delete(key()); connections.delete(key()); runtime.clear(); update(runtime.snapshot()); return; }
                    if (action === 'archive' && !confirm('เก็บ Lorebook นี้เข้าคลังเพื่อคืนสล็อต? ข้อมูลยังเก็บไว้ แต่จะเลือกใช้ไม่ได้')) return;
                    if (action === 'delete' && !confirm('ลบ Lorebook ของคุณถาวร? การลบไม่สามารถกู้คืนได้')) return;
                    button.disabled = true;
                    try {
                        await cloud.manage(item.id, action);
                        if (identityEpoch !== accountEpoch) return;
                        if (action === 'archive' || action === 'delete') {
                            // An owner action revokes every in-memory chat binding for this book.
                            for (const [bindingKey, book] of bindings) if (book.id === item.id) bindings.delete(bindingKey);
                            runtime.clearAll();
                            bindings.clear();
                            connections.clear();
                            grants.clear();
                        }
                        const data = await cloud.me();
                        if (identityEpoch !== accountEpoch) return;
                        renderAccount(data); await refresh(); update(runtime.snapshot());
                    } catch (err) { showError(err); }
                    finally { button.disabled = false; }
                });
                actions.append(button);
            }
            menu.append(summary, actions); article.append(menu);
        }
        target.append(article);
    }
    function renderLists() {
        for (const [name, books] of [['mine-list', pane === 'mine' ? items : []], ['search-list', pane === 'search' ? items : []]]) {
            const target = el(name); target.replaceChildren();
            books.forEach(item => card(item, target));
            if (!books.length) empty(target, loading ? 'กำลังโหลดคลัง…' : name === 'mine-list' ? 'ยังไม่มี Lorebook ในคลังของคุณ' : 'ไม่พบ Lorebook ที่ตรงกับคำค้น');
        }
        el('more').hidden = !hasMore || pane === 'upload';
    }
    async function refresh(append = false) {
        if (!account || !cloud.hasCredentials() || pane === 'upload') return;
        const epoch = ++searchEpoch, activePane = pane;
        loading = true; renderLists(); el('more').disabled = true;
        try {
            const data = await cloud.search(activePane === 'search' ? el('search').value : '', activePane === 'mine', append ? offset : 0);
            if (epoch !== searchEpoch) return;
            const incoming = append ? [...items, ...data.items] : data.items;
            items = [...new Map(incoming.map(item => [item.id, item])).values()];
            offset = data.offset + data.items.length; hasMore = data.has_more;
        } catch (err) { if (epoch === searchEpoch) showError(err); }
        finally { if (epoch === searchEpoch) { loading = false; renderLists(); el('more').disabled = false; } }
    }
    function switchTab(next, focus = false) {
        if (next === 'upload' && !canUpload()) next = 'mine';
        pane = next; searchEpoch++; items = []; hasMore = false; loading = false;
        clearTimeout(searchTimer);
        tabs.forEach(tab => { const active = tab.dataset.tab === next; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
        root.querySelectorAll('[data-pane]').forEach(panel => { panel.hidden = panel.dataset.pane !== next; });
        el('search-wrap').hidden = next !== 'search';
        renderLists(); void refresh();
    }
    function update(snapshot) {
        const nextKey = key();
        if (nextKey !== currentKey) {
            currentKey = nextKey;
            const enabled = snapshot.loaded && connections.get(nextKey) === true;
            if (snapshot.enabled !== enabled) { runtime.setEnabled(enabled); return; }
        }
        const book = snapshot.loaded ? selected() : null;
        const target = el('selected'); target.replaceChildren();
        if (book) card(book, target, true); else empty(target, 'เลือก Lorebook จากคลังของฉันหรือแถบค้นหา');
        el('active').hidden = !book;
        el('enabled').checked = snapshot.enabled && !!book;
        el('loaded').textContent = book ? `${snapshot.count} Entries · ${snapshot.enabled ? 'เชื่อมกับแชทนี้แล้ว' : 'ยังไม่เชื่อมกับแชทนี้'}` : '';
        el('start').disabled = !book || !snapshot.enabled;
        el('start-hint').textContent = book && snapshot.enabled ? 'กดเริ่มใช้งานเพื่อตั้งค่าการสแกนและงบโทเคน' : 'เลือก Lorebook แล้วเปิดเชื่อมกับแชทนี้';
        if (el('setup').open && (setupKey !== key() || !book || !snapshot.enabled)) el('setup').close();
        if (el('unlock-dialog').open && pendingUnlock?.key !== key()) el('unlock-dialog').close();
        const states = { prepared: `เตรียม ${snapshot.selected} Entries`, sent: `ใส่ ${snapshot.sent} Entries · ข้าม ${snapshot.omitted} Entries`, error: 'หยุดส่งเนื่องจากข้อผิดพลาด' };
        setStatus(states[snapshot.state] || ''); renderLists();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        tab.addEventListener('keydown', event => {
            const available = tabs.filter(item => !item.hidden), position = available.indexOf(tab);
            if (position < 0) return;
            const next = event.key === 'ArrowRight' ? (position + 1) % available.length : event.key === 'ArrowLeft' ? (position + available.length - 1) % available.length : event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1 : null;
            if (next !== null) { event.preventDefault(); switchTab(available[next].dataset.tab, true); }
        });
    });
    el('search').addEventListener('input', () => { searchEpoch++; clearTimeout(searchTimer); searchTimer = setTimeout(() => void refresh(), 400); });
    el('more').addEventListener('click', () => void refresh(true));
    el('login').addEventListener('click', async () => {
        el('login').disabled = true;
        try { await cloud.login(el('uid').value, el('token').value); el('token').value = ''; location.reload(); }
        catch (err) { showError(err); el('login').disabled = false; }
    });
    root.querySelectorAll('[name="clb-sharing"], [data-role]').forEach(input => input.addEventListener('change', () => { uploadRequestKey = null; sharingChanged(); }));
    el('upload-form').addEventListener('input', () => { uploadRequestKey = null; });
    el('file').addEventListener('change', () => { uploadRequestKey = null; el('file-name').textContent = el('file').files?.[0]?.name || 'ยังไม่ได้เลือกไฟล์'; });
    el('upload-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (uploadBusy) return;
        if (!account) return showError(error('AUTH_REQUIRED'));
        if (!canUpload()) return showError(error('UPLOAD_ROLE_REQUIRED'));
        const file = el('file').files?.[0], title = el('title').value.trim();
        if (!title) return showError(error('TITLE_INVALID'));
        if (!file) return;
        const identityEpoch = accountEpoch;
        try {
            const policy = readPolicy();
            uploadRequestKey ||= crypto.randomUUID();
            uploadBusy = true; sharingChanged();
            const data = await cloud.upload(file, title, policy, uploadRequestKey);
            if (identityEpoch !== accountEpoch) return;
            el('import-status').textContent = `อัปโหลดแล้ว · ID ${data.item.id}`;
            el('upload-form').reset(); el('pin').value = ''; el('file-name').textContent = 'ยังไม่ได้เลือกไฟล์';
            uploadRequestKey = null;
            const accountData = await cloud.me();
            if (identityEpoch !== accountEpoch) return;
            renderAccount(accountData); switchTab('mine'); setStatus('อัปโหลดสำเร็จ · เลือกใช้จากคลังของฉันได้');
        } catch (err) { if (identityEpoch === accountEpoch) showError(err); }
        finally { uploadBusy = false; sharingChanged(); }
    });
    el('enabled').addEventListener('change', event => {
        try { runtime.setEnabled(event.target.checked); connections.set(key(), event.target.checked); }
        catch (err) { showError(err); }
        update(runtime.snapshot());
    });
    el('start').addEventListener('click', () => {
        const snapshot = runtime.snapshot(); if (!snapshot.loaded || !snapshot.enabled || !selected()) return;
        setupKey = key(); el('scan').value = snapshot.options.scanDepth; el('budget').value = snapshot.options.tokenBudget;
        el('setup-status').textContent = ''; el('setup').showModal(); el('scan').focus();
    });
    for (const name of ['close-setup', 'cancel-setup']) el(name).addEventListener('click', () => el('setup').close());
    el('setup-form').addEventListener('submit', event => {
        event.preventDefault();
        try {
            if (setupKey !== key() || !selected() || !runtime.snapshot().enabled) throw error('CONTEXT_CHANGED');
            runtime.setOptions({ scanDepth: Number(el('scan').value), tokenBudget: Number(el('budget').value) });
            el('setup').close(); setStatus('บันทึกแล้ว · พร้อมใช้งานกับแชทนี้');
        } catch (err) { el('setup-status').textContent = 'บันทึกไม่สำเร็จ ตรวจค่าหรือเลือกแชทใหม่'; showError(err); }
    });
    for (const name of ['close-unlock','cancel-unlock']) el(name).addEventListener('click', () => el('unlock-dialog').close());
    el('unlock-dialog').addEventListener('close', () => { pendingUnlock = null; el('unlock-pin').value = ''; });
    el('unlock-form').addEventListener('submit', async event => {
        event.preventDefault();
        const pending = pendingUnlock;
        if (!pending || el('unlock-submit').disabled) return;
        if (pending.key !== key() || pending.accountEpoch !== accountEpoch) { el('unlock-dialog').close(); return; }
        const pin = el('unlock-pin').value;
        if (!/^[0-9]{6}$/.test(pin)) { el('unlock-status').textContent = 'กรอกรหัสตัวเลข 6 หลัก'; return; }
        el('unlock-submit').disabled = true; el('unlock-pin').value = '';
        el('unlock-status').textContent = 'กำลังตรวจรหัส…';
        try {
            const result = await cloud.unlock(pending.item.id,pin);
            if (pending !== pendingUnlock || pending.key !== key() || pending.accountEpoch !== accountEpoch) return;
            grants.set(pending.item.id,{ token:result.unlock_token, expiresAt:Date.now()+result.expires_in*1000 });
            el('unlock-dialog').close();
            await choose(result.metadata,result.unlock_token);
        } catch (err) {
            if (pending !== pendingUnlock || pending.accountEpoch !== accountEpoch) return;
            el('unlock-status').textContent = err.code === 'PIN_INCORRECT' ? 'รหัสไม่ถูกต้อง กรุณาลองใหม่' : err.code === 'PIN_RATE_LIMIT' ? 'ลองรหัสเกินจำนวนที่กำหนด กรุณารอ 15 นาที' : 'ปลดล็อกไม่สำเร็จ ตรวจการเชื่อมต่อหรือขอรหัสล่าสุดจากผู้สร้าง';
            el('unlock-pin').focus();
        } finally { if (pending === pendingUnlock) el('unlock-submit').disabled = false; }
    });
    el('policy-mode').addEventListener('change',policyChanged);
    for (const name of ['close-policy','cancel-policy']) el(name).addEventListener('click', () => el('policy-dialog').close());
    el('policy-dialog').addEventListener('close', () => { pendingPolicy = null; el('policy-pin').value = ''; });
    el('policy-form').addEventListener('submit', async event => {
        event.preventDefault();
        const pending = pendingPolicy;
        if (!pending || el('policy-submit').disabled || pending.accountEpoch !== accountEpoch) return;
        const value = el('policy-mode').value, policy = { access_mode:value };
        if (value === 'roles') {
            policy.allowed_roles = [...root.querySelectorAll('[data-policy-role]:checked')].map(input => input.dataset.policyRole);
            if (!policy.allowed_roles.length) { el('policy-status').textContent = 'เลือกอย่างน้อยหนึ่งยศ'; return; }
        }
        if (value === 'pin') {
            if (!/^[0-9]{6}$/.test(el('policy-pin').value)) { el('policy-status').textContent = 'กรอกรหัสใหม่เป็นตัวเลข 6 หลัก'; return; }
            policy.pin = el('policy-pin').value;
        }
        el('policy-submit').disabled = true;
        try {
            const result = await cloud.manage(pending.item.id,'policy',policy);
            if (pending !== pendingPolicy || pending.accountEpoch !== accountEpoch) return;
            grants.delete(pending.item.id);
            for (const [bindingKey,book] of bindings) if (book.id === pending.item.id) bindings.set(bindingKey,result.item);
            el('policy-dialog').close(); await refresh(); update(runtime.snapshot()); setStatus('บันทึกสิทธิ์การแชร์แล้ว');
        } catch (err) {
            if (pending === pendingPolicy && pending.accountEpoch === accountEpoch) { el('policy-status').textContent = 'บันทึกสิทธิ์ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่'; showError(err); }
        } finally { if (pending === pendingPolicy) el('policy-submit').disabled = false; }
    });
    syncUploadPermission(); sharingChanged(); update(runtime.snapshot());
    // The membership gate is the single source of the initial account request.
    return {
        update, setError: setStatus,
        refreshAccount(data) {
            if (data?.success && String(data.user?.uid) === cloud.credentials().uid) {
                const initial = !account;
                renderAccount(data, { preserveLogin:true });
                if (initial) void refresh();
            }
        },
        async authorize() {
            const ctx = context(), originalKey = key(), book = selected();
            if (!book || !runtime.snapshot().enabled) return;
            try { await cloud.access(book.id,grantFor(book.id)); }
            catch (err) {
                if (['PIN_REQUIRED','ROLE_REQUIRED','NOT_FOUND','AUTH_EXPIRED','ACCESS_DENIED','NOT_A_MEMBER'].includes(err.code)) revokeMemory();
                throw err;
            }
            const current = context();
            if (originalKey !== key() || selected()?.id !== book.id || ctx.mainApi !== current.mainApi || ctx.tokenizerModel !== current.tokenizerModel || ctx.chatCompletionSettings?.chat_completion_source !== current.chatCompletionSettings?.chat_completion_source) throw error('CONTEXT_CHANGED');
        },
        clear() {
            accountEpoch++; searchEpoch++; selectionEpoch++; clearTimeout(searchTimer);
            bindings.clear(); connections.clear(); grants.clear(); items = []; account = null; quota = null; capabilities = null; hasMore = false; loading = false;
            syncUploadPermission();
            for (const name of ['setup','unlock-dialog','policy-dialog']) if (el(name).open) el(name).close();
            pendingUnlock = null; pendingPolicy = null; uploadRequestKey = null;
            el('pin').value = ''; el('file').value = ''; el('file-name').textContent = 'ยังไม่ได้เลือกไฟล์'; el('author').value = '';
            el('account').textContent = 'กรุณาเชื่อมบัญชี Catta อีกครั้ง'; el('quota').textContent = '';
            sharingChanged(); update(runtime.snapshot());
        },
    };
}
