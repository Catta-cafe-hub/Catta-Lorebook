/** Catta Lorebook UI. Cloud API remains the authority for all access checks. */
export function createLorebookUI({ target, runtime, context, showError, cloud, LorebookError, limits }) {
    const root = document.createElement('section');
    root.id = 'catta-lorebook';
    root.className = 'extension_container';
    const asset = name => new URL(`./assets/${name}.webp`, import.meta.url).href;
    root.innerHTML = `
      <details class="clb-shell" open>
        <summary class="clb-header"><span class="clb-brand">▤ <span>Catta Lorebook<small>CATTA CAFÉ EXTENSION</small></span></span><span class="clb-chevron">⌄</span></summary>
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
            <button type="button" role="tab" id="clb-tab-upload" data-tab="upload" aria-controls="clb-pane-upload" aria-selected="false" tabindex="-1">↥ อัปโหลด</button>
          </nav>
          <div data-clb="search-wrap" class="clb-search-wrap" hidden><span>⌕</span><input data-clb="search" type="search" aria-label="ค้นหา Lorebook" placeholder="ชื่อ Lorebook / ผู้สร้าง / รหัส…" autocomplete="off"></div>
          <div data-pane="mine" id="clb-pane-mine" role="tabpanel" aria-labelledby="clb-tab-mine">
            <section class="clb-section"><h3>✦ Lorebook ที่เลือก</h3><div data-clb="selected"></div>
              <div data-clb="active" class="clb-active" hidden><label class="clb-enable"><span>เชื่อมกับแชทนี้</span><input data-clb="enabled" type="checkbox" role="switch"><span class="clb-track" aria-hidden="true"></span></label><p data-clb="loaded" class="clb-note"></p></div>
            </section>
            <button type="button" data-clb="start" class="clb-primary clb-start" aria-haspopup="dialog" aria-controls="clb-setup" disabled>⚙ เริ่มใช้งาน <span>✦</span></button>
            <p data-clb="start-hint" class="clb-caption">เลือก Lorebook แล้วเปิดเชื่อมกับแชทนี้</p>
            <section class="clb-section clb-library"><h3>คลังของฉัน</h3><div data-clb="mine-list" class="clb-list"></div></section>
          </div>
          <div data-pane="search" id="clb-pane-search" role="tabpanel" aria-labelledby="clb-tab-search" hidden><section class="clb-section"><h3>☁ ค้นหาใน Cloud Catta</h3><div data-clb="search-list" class="clb-list"></div></section></div>
          <div data-pane="upload" id="clb-pane-upload" role="tabpanel" aria-labelledby="clb-tab-upload" hidden><section class="clb-section"><h3>↥ เพิ่ม Lorebook ใหม่</h3>
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
                <div data-clb="pin-detail" class="clb-share-detail" hidden><label class="clb-field">รหัสตัวเลข 6 หลัก<input data-clb="pin" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="new-password" placeholder="000000" disabled></label></div>
              </fieldset>
              <p data-clb="share-summary" class="clb-share-summary" role="status"></p>
              <label class="clb-drop-zone">↥ เลือกไฟล์ Lorebook JSON<input data-clb="file" type="file" accept=".json,application/json" required><small data-clb="file-name">ยังไม่ได้เลือกไฟล์</small></label>
              <button data-clb="import" type="submit" class="clb-primary">อัปโหลด Lorebook</button>
              <p data-clb="import-status" class="clb-note" role="status">1 Lorebook = 1 สล็อต · Basic 10 / VIP 20 / VVIP 100</p>
            </form>
          </section></div>
          <button type="button" data-clb="more" class="clb-secondary" hidden>โหลดรายการเพิ่ม</button>
          <p data-clb="status" class="clb-status" role="status" aria-live="polite"></p>
          <footer class="clb-footer">CATTA <span>✦</span> LOREBOOK<small>Cloud เก็บไฟล์ในบัญชี · รีโหลดแล้วเลือกใช้ใหม่</small></footer>
          <dialog data-clb="setup" id="clb-setup" class="clb-dialog" aria-labelledby="clb-setup-title"><form data-clb="setup-form">
            <div class="clb-dialog-header"><span>⚙</span><h3 id="clb-setup-title">ตั้งค่าก่อนเริ่มใช้งาน</h3><button type="button" data-clb="close-setup" class="clb-close" aria-label="ปิดการตั้งค่า">×</button></div>
            <p class="clb-note">ตั้งค่าการจับข้อความและงบโทเคนสำหรับ Lorebook ที่เลือก</p>
            <div class="clb-options"><label class="clb-field">สแกนข้อความล่าสุด<input data-clb="scan" type="number" min="1" max="100" required step="1"></label><label class="clb-field">งบโทเคน<input data-clb="budget" type="number" min="64" max="${limits.tokenBudget}" required step="1"></label></div>
            <p class="clb-note">นับข้อความแชทล่าสุดเพื่อจับ Keywords · งบโทเคนกำหนดปริมาณ Lorebook ที่ส่งให้ AI</p>
            <div class="clb-dialog-actions"><button type="button" data-clb="cancel-setup" class="clb-secondary">ยกเลิก</button><button type="submit" class="clb-primary">บันทึกและเริ่มใช้งาน</button></div>
            <p data-clb="setup-status" class="clb-status" role="status"></p>
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
    let account = null, quota = null, pane = 'mine', items = [], offset = 0, hasMore = false;
    let searchEpoch = 0, selectionEpoch = 0, accountEpoch = 0, searchTimer, uploadBusy = false, loading = false;
    let setupKey = null;
    const bindings = new Map();
    const connections = new Map();
    let currentKey = key();
    const selected = () => bindings.get(key());
    const setStatus = text => { el('status').textContent = text; };
    const mode = () => root.querySelector('[name="clb-sharing"]:checked').value;
    const restricted = () => ['roles', 'pin'].includes(mode());

    function sharingChanged() {
        const value = mode();
        el('role-detail').hidden = value !== 'roles';
        el('pin-detail').hidden = value !== 'pin';
        el('pin').disabled = value !== 'pin';
        el('pin').required = value === 'pin';
        if (value !== 'pin') el('pin').value = '';
        el('share-summary').textContent = restricted()
            ? 'ยังเผยแพร่แบบเลือกยศหรือล็อกรหัสไม่ได้ ระบบยังไม่เปิดรองรับสิทธิ์นี้ หนังสือของคุณจะไม่ถูกอัปโหลดหรือเปลี่ยนเป็นแชร์ทุกคน'
            : value === 'all' ? 'สมาชิก Catta ที่เข้าสู่ระบบค้นหาและเลือกใช้ได้' : 'หนังสือนี้เป็นส่วนตัว เฉพาะคุณเท่านั้น';
        el('import').textContent = restricted() ? 'สิทธิ์นี้ยังไม่เปิดใช้งาน' : value === 'all' ? 'เผยแพร่ให้สมาชิก Catta' : 'อัปโหลดแบบส่วนตัว';
        el('import').disabled = uploadBusy || restricted() || !account || quota?.remaining <= 0;
    }
    function renderAccount(data) {
        account = data.user; quota = data.quota;
        el('account').textContent = `${account.name} · ${quota.tier}`;
        el('quota').textContent = `${quota.used} / ${quota.limit} สล็อต · เหลือ ${quota.remaining}`;
        el('author').value = account.name;
        el('login-box').open = false;
        sharingChanged();
    }
    function empty(target, text) {
        const p = document.createElement('p'); p.className = 'clb-empty'; p.textContent = text; target.append(p);
    }
    async function choose(item) {
        const originalKey = key(), epoch = ++selectionEpoch, identityEpoch = accountEpoch;
        if (!originalKey) return showError(error('SELECT_CHARACTER'));
        try {
            const data = await cloud.content(item.id);
            if (epoch !== selectionEpoch || identityEpoch !== accountEpoch) return;
            if (originalKey !== key()) throw error('CONTEXT_CHANGED');
            runtime.importBook(data.book);
            bindings.set(originalKey, data.metadata);
            connections.set(originalKey, false);
            runtime.setEnabled(false);
            switchTab('mine');
            update(runtime.snapshot());
        } catch (err) { showError(err); }
    }
    function card(item, target, active = false) {
        const article = document.createElement('article'); article.className = 'clb-card';
        const title = document.createElement('strong'); title.className = 'clb-card-title'; title.textContent = item.title;
        const meta = document.createElement('small'); meta.className = 'clb-card-meta';
        meta.textContent = `${item.creator_name} · ${new Date(item.created_at).toLocaleDateString('th-TH')}`;
        const id = document.createElement('small'); id.className = 'clb-card-id'; id.textContent = `ID: ${item.id}`;
        const badge = document.createElement('span'); badge.className = 'clb-badge';
        badge.textContent = item.visibility === 'members' ? '☁ แชร์ให้สมาชิก' : '♧ ส่วนตัว';
        article.append(title, meta, id, badge);
        if (!active) {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'clb-select';
            button.textContent = selected()?.id === item.id ? 'เลือกอยู่' : 'เลือกใช้';
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
            if (String(item.owner_id) === String(account?.uid)) options.push([item.visibility === 'members' ? 'private' : 'members', item.visibility === 'members' ? 'ตั้งเป็นส่วนตัว' : 'แชร์ให้สมาชิก'], ['archive', 'เก็บเข้าคลัง (คืนสล็อต)'], ['delete', 'ลบ Lorebook ถาวร']);
            for (const [action, label] of options) {
                const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
                button.addEventListener('click', async () => {
                    const identityEpoch = accountEpoch;
                    menu.open = false;
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
        if (!cloud.hasCredentials() || pane === 'upload') return;
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
        const states = { prepared: `เตรียม ${snapshot.selected} Entries`, sent: `ใส่ ${snapshot.sent} Entries · ข้าม ${snapshot.omitted} Entries`, error: 'หยุดส่งเนื่องจากข้อผิดพลาด' };
        setStatus(states[snapshot.state] || ''); renderLists();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        tab.addEventListener('keydown', event => {
            const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
            if (next !== null) { event.preventDefault(); switchTab(tabs[next].dataset.tab, true); }
        });
    });
    el('search').addEventListener('input', () => { searchEpoch++; clearTimeout(searchTimer); searchTimer = setTimeout(() => void refresh(), 400); });
    el('more').addEventListener('click', () => void refresh(true));
    el('login').addEventListener('click', async () => {
        el('login').disabled = true;
        try { await cloud.login(el('uid').value, el('token').value); el('token').value = ''; location.reload(); }
        catch (err) { showError(err); el('login').disabled = false; }
    });
    root.querySelectorAll('[name="clb-sharing"], [data-role]').forEach(input => input.addEventListener('change', sharingChanged));
    el('file').addEventListener('change', () => { el('file-name').textContent = el('file').files?.[0]?.name || 'ยังไม่ได้เลือกไฟล์'; });
    el('upload-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (uploadBusy) return;
        // Never downgrade a restricted choice to the old members visibility.
        if (restricted()) { setStatus('ยังไม่เปิดเผยแพร่แบบเลือกยศหรือล็อกรหัส'); return; }
        if (!account) return showError(error('AUTH_REQUIRED'));
        const file = el('file').files?.[0], title = el('title').value.trim();
        if (!title) return showError(error('TITLE_INVALID'));
        if (!file) return;
        const identityEpoch = accountEpoch;
        uploadBusy = true; sharingChanged();
        try {
            const data = await cloud.upload(file, title, mode() === 'all' ? 'members' : 'private');
            if (identityEpoch !== accountEpoch) return;
            el('import-status').textContent = `อัปโหลดแล้ว · ID ${data.item.id}`;
            el('upload-form').reset(); el('pin').value = ''; el('file-name').textContent = 'ยังไม่ได้เลือกไฟล์';
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
    sharingChanged(); update(runtime.snapshot());
    // Recover the account card after the membership gate has reverified access.
    const gateObserver = new MutationObserver(() => {
        if (root.dataset.clbMemberGate !== 'authorized' || account) return;
        const epoch = accountEpoch;
        void cloud.me().then(data => {
            if (epoch !== accountEpoch || root.dataset.clbMemberGate !== 'authorized') return;
            renderAccount(data); return refresh();
        }).catch(showError);
    });
    gateObserver.observe(root, { attributes: true, attributeFilter: ['data-clb-member-gate'] });
    window.addEventListener('pagehide', () => gateObserver.disconnect(), { once: true });
    if (cloud.hasCredentials()) { const epoch = accountEpoch; void cloud.me().then(data => { if (epoch !== accountEpoch) return; renderAccount(data); return refresh(); }).catch(showError); }
    return {
        update, setError: setStatus,
        async authorize() {
            const ctx = context(), originalKey = key(), book = selected();
            if (!book || !runtime.snapshot().enabled) return;
            await cloud.access(book.id);
            const current = context();
            if (originalKey !== key() || selected()?.id !== book.id || ctx.mainApi !== current.mainApi || ctx.tokenizerModel !== current.tokenizerModel || ctx.chatCompletionSettings?.chat_completion_source !== current.chatCompletionSettings?.chat_completion_source) throw error('CONTEXT_CHANGED');
        },
        clear() {
            accountEpoch++; searchEpoch++; selectionEpoch++; clearTimeout(searchTimer);
            bindings.clear(); connections.clear(); items = []; account = null; quota = null; hasMore = false; loading = false;
            if (el('setup').open) el('setup').close();
            el('pin').value = ''; el('file').value = ''; el('file-name').textContent = 'ยังไม่ได้เลือกไฟล์'; el('author').value = '';
            el('account').textContent = 'กรุณาเชื่อมบัญชี Catta อีกครั้ง'; el('quota').textContent = '';
            sharingChanged(); update(runtime.snapshot());
        },
    };
}
