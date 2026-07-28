/*
 * UIkit 3 Grid Generator
 * The preview runs in an iframe with the real uikit.css –
 * media queries therefore trigger exactly at the configured width.
 */
(function () {
  'use strict';

  const C = window.UK;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* =====================================================================
   * 1. Model
   * ===================================================================== */

  let uidSeq = 1;
  const uid = () => 'n' + (uidSeq++) + Math.random().toString(36).slice(2, 6);

  const bpMap = () => ({ '': '', s: '', m: '', l: '', xl: '' });

  function newSection() {
    return {
      id: uid(), type: 'section',
      p: {
        style: 'muted', size: '', padTop: '', padBottom: '',
        overlap: false, preserveColor: false, inverse: '',
        classes: '', attrs: ''
      },
      children: [newContainer()]
    };
  }

  function newContainer() {
    return {
      id: uid(), type: 'container',
      p: { size: '', padRemove: [], classes: '', attrs: '' },
      children: [newGrid()]
    };
  }

  function newGrid(cells) {
    const g = {
      id: uid(), type: 'grid',
      p: {
        gutter: '', colGutter: '', rowGutter: '',
        divider: false, match: false,
        masonry: '', parallax: '',
        childWidth: bpMap(),
        flexH: bpMap(), flexV: bpMap(), flexDir: bpMap(),
        flexWrap: '', flexWrapAlign: '',
        marginSize: '', marginSide: '', marginRemove: [], marginRemoveX: bpMap(),
        classes: '', attrs: ''
      },
      children: []
    };
    const n = typeof cells === 'number' ? cells : 3;
    for (let i = 0; i < n; i++) g.children.push(newCell(i + 1));
    /* base stays empty – 100% is the default in UIkit */
    g.p.childWidth.s = '1-2';
    g.p.childWidth.m = '1-' + Math.min(n, 6);
    return g;
  }

  function newCell(i) {
    return {
      id: uid(), type: 'cell',
      p: {
        width: bpMap(),
        itemMatch: false,
        order: bpMap(), flexItem: bpMap(),
        flex: false, flexH: bpMap(), flexV: bpMap(), flexDir: bpMap(),
        height: '',
        padSize: '', padRemove: [],
        marginSize: '', marginSide: '', marginRemove: [], marginRemoveX: bpMap(),
        marginAuto: '', marginAutoBp: '',
        textAlign: bpMap(),
        background: '', inverse: '',
        content: 'card', cardStyle: 'default', cardSize: '', cardHover: false,
        title: 'Column ' + (i || 1),
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        html: '<div class="uk-card uk-card-default uk-card-body">Custom HTML</div>',
        classes: '', attrs: ''
      },
      children: []
    };
  }

  const CONTAINS = {
    root: ['section', 'container', 'grid'],
    section: ['container', 'grid'],
    container: ['grid'],
    grid: ['cell'],
    cell: ['grid']
  };
  const canContain = (parentType, childType) =>
    (CONTAINS[parentType] || []).indexOf(childType) > -1;

  let doc = { root: { id: 'root', type: 'root', p: {}, children: [] }, css: '' };
  let selectedId = null;

  /* tree navigation */
  function walk(node, fn, parent) {
    if (fn(node, parent) === false) return false;
    for (const c of node.children || []) if (walk(c, fn, node) === false) return false;
    return true;
  }
  function findNode(id) {
    let hit = null;
    walk(doc.root, n => { if (n.id === id) { hit = n; return false; } });
    return hit;
  }
  function findParent(id) {
    let hit = null;
    walk(doc.root, (n, p) => { if (n.id === id) { hit = p; return false; } });
    return hit;
  }
  function isAncestor(ancId, id) {
    const a = findNode(ancId);
    if (!a) return false;
    let hit = false;
    walk(a, n => { if (n !== a && n.id === id) { hit = true; return false; } });
    return hit;
  }

  /* =====================================================================
   * 2. Class generation (1:1 UIkit)
   * ===================================================================== */

  const sfx = bp => (bp ? '@' + bp : '');
  const BPS = ['', 's', 'm', 'l', 'xl'];

  function pushResp(out, map, build, allow) {
    for (const bp of BPS) {
      const v = map && map[bp];
      if (!v) continue;
      if (allow && !allow(v, bp)) continue;
      const r = build(v, bp);
      (Array.isArray(r) ? r : [r]).forEach(x => out.push(x));
    }
  }

  /* Some values only exist with or only without a breakpoint suffix.
     The catalogs mark this with noBase / noResp. */
  const W_ALL = C.WIDTHS.concat(C.WIDTHS_BASE_ONLY.map(o => ({ v: o.v, t: o.t, noResp: true })));
  function respAllow(list) {
    const by = {};
    list.forEach(o => { by[o.v] = o; });
    return (v, bp) => {
      const o = by[v];
      if (!o) return true;
      return bp ? !o.noResp : !o.noBase;
    };
  }
  function optsFor(list, bp) {
    return list.filter(o => (bp ? !o.noResp : !o.noBase));
  }
  const ALLOW = {
    width: respAllow(W_ALL),
    childWidth: respAllow(C.CHILD_WIDTHS),
    flexDir: respAllow(C.FLEX_DIR),
    flexItem: respAllow(C.FLEX_ITEM),
    textAlign: respAllow(C.TEXT_ALIGN)
  };

  function customClasses(str) {
    return String(str || '').split(/\s+/).filter(Boolean);
  }

  function sectionClasses(n) {
    const p = n.p, c = ['uk-section'];
    if (p.style) c.push('uk-section-' + p.style);
    if (p.size) c.push('uk-section-' + p.size);
    if (p.padTop) c.push('uk-section-' + p.padTop + '-top');
    if (p.padBottom) c.push('uk-section-' + p.padBottom + '-bottom');
    if (p.overlap) c.push('uk-section-overlap');
    if (p.preserveColor) c.push('uk-preserve-color');
    if (p.inverse) c.push('uk-' + p.inverse);
    return c.concat(customClasses(p.classes));
  }

  function containerClasses(n) {
    const p = n.p, c = ['uk-container'];
    if (p.size) c.push('uk-container-' + p.size);
    (p.padRemove || []).forEach(v => c.push('uk-container-item-padding-' + v));
    return c.concat(customClasses(p.classes));
  }

  function marginClasses(p) {
    const c = [];
    if (p.marginSize) {
      const size = p.marginSize === 'default' ? '' : '-' + p.marginSize;
      const side = p.marginSide ? '-' + p.marginSide : '';
      c.push('uk-margin' + size + side);
    }
    (p.marginRemove || []).forEach(v => c.push('uk-margin-' + v));
    /* uk-margin-remove-left/-right: the only remove classes with breakpoints */
    pushResp(c, p.marginRemoveX, (v, bp) => {
      const parts = [];
      if (v === 'left' || v === 'both') parts.push('uk-margin-remove-left' + sfx(bp));
      if (v === 'right' || v === 'both') parts.push('uk-margin-remove-right' + sfx(bp));
      return parts;
    });
    if (p.marginAuto) {
      const resp = C.MARGIN_AUTO_RESPONSIVE.indexOf(p.marginAuto) > -1;
      c.push('uk-margin-' + p.marginAuto + (resp ? sfx(p.marginAutoBp) : ''));
    }
    return c;
  }

  function paddingClasses(p) {
    const c = [];
    if (p.padSize) c.push(p.padSize === 'default' ? 'uk-padding' : 'uk-padding-' + p.padSize);
    (p.padRemove || []).forEach(v => c.push('uk-padding-' + v));
    return c;
  }

  function flexAlignClasses(p, out) {
    pushResp(out, p.flexH, (v, bp) => 'uk-flex-' + v + sfx(bp));
    pushResp(out, p.flexV, (v, bp) => 'uk-flex-' + v + sfx(bp));
    pushResp(out, p.flexDir, (v, bp) => 'uk-flex-' + v + sfx(bp), ALLOW.flexDir);
  }

  function gridClasses(n) {
    const p = n.p, c = [];
    if (p.gutter) c.push('uk-grid-' + p.gutter);
    if (p.colGutter) c.push('uk-grid-column-' + p.colGutter);
    if (p.rowGutter) c.push('uk-grid-row-' + p.rowGutter);
    if (p.divider) c.push('uk-grid-divider');
    if (p.match) c.push('uk-grid-match');
    pushResp(c, p.childWidth, (v, bp) => 'uk-child-width-' + v + sfx(bp), ALLOW.childWidth);
    flexAlignClasses(p, c);
    if (p.flexWrap) c.push('uk-flex-' + p.flexWrap);
    if (p.flexWrapAlign) c.push('uk-flex-' + p.flexWrapAlign);
    marginClasses(p).forEach(v => c.push(v));
    return c.concat(customClasses(p.classes));
  }

  function gridAttrValue(n) {
    const p = n.p, o = [];
    if (p.masonry) o.push('masonry: ' + p.masonry);
    if (p.parallax) o.push('parallax: ' + p.parallax);
    return o.join('; ');
  }

  function cellClasses(n) {
    const p = n.p, c = [];
    pushResp(c, p.width, (v, bp) => 'uk-width-' + v + sfx(bp), ALLOW.width);
    if (p.itemMatch) c.push('uk-grid-item-match');
    pushResp(c, p.order, (v, bp) => 'uk-flex-' + v + sfx(bp));
    pushResp(c, p.flexItem, (v, bp) => 'uk-flex-' + v + sfx(bp), ALLOW.flexItem);
    if (p.flex) {
      c.push('uk-flex');
      flexAlignClasses(p, c);
    }
    if (p.height) c.push('uk-height-' + p.height);
    paddingClasses(p).forEach(v => c.push(v));
    marginClasses(p).forEach(v => c.push(v));
    pushResp(c, p.textAlign, (v, bp) => 'uk-text-' + v + sfx(bp), ALLOW.textAlign);
    if (p.background) c.push('uk-background-' + p.background);
    if (p.inverse) c.push('uk-' + p.inverse);
    return c.concat(customClasses(p.classes));
  }

  /* =====================================================================
   * 3. Virtual tree → DOM / code
   * ===================================================================== */

  function parseAttrs(str) {
    const out = {};
    const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g;
    let m;
    while ((m = re.exec(String(str || '')))) {
      if (!m[1]) continue;
      out[m[1]] = m[2] === undefined ? '' : m[2];
    }
    return out;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function V(tag, cls, attrs, children, extra) {
    return Object.assign({ tag, cls: (cls || []).filter(Boolean), attrs: attrs || {}, children: children || [] }, extra || {});
  }

  function cellContent(n) {
    const p = n.p, out = [];
    if (p.content === 'card') {
      const cc = ['uk-card', 'uk-card-' + p.cardStyle, 'uk-card-body'];
      if (p.cardSize) cc.push('uk-card-' + p.cardSize);
      if (p.cardHover) cc.push('uk-card-hover');
      const kids = [];
      if (p.title) kids.push(V('h3', ['uk-card-title'], {}, [], { text: p.title }));
      if (p.text) kids.push(V('p', [], {}, [], { text: p.text }));
      out.push(V('div', cc, {}, kids));
    } else if (p.content === 'tile') {
      const kids = [];
      if (p.title) kids.push(V('h3', [], {}, [], { text: p.title }));
      if (p.text) kids.push(V('p', ['uk-margin-remove-bottom'], {}, [], { text: p.text }));
      out.push(V('div', ['uk-padding', 'uk-background-muted'], {}, kids));
    } else if (p.content === 'text') {
      if (p.title) out.push(V('h3', [], {}, [], { text: p.title }));
      if (p.text) out.push(V('p', [], {}, [], { text: p.text }));
    } else if (p.content === 'html') {
      out.push({ rawHTML: p.html || '' });
    }
    return out;
  }

  function build(n) {
    let v;
    if (n.type === 'section') {
      v = V('div', sectionClasses(n), parseAttrs(n.p.attrs), n.children.map(build));
    } else if (n.type === 'container') {
      v = V('div', containerClasses(n), parseAttrs(n.p.attrs), n.children.map(build));
    } else if (n.type === 'grid') {
      const a = parseAttrs(n.p.attrs);
      a['uk-grid'] = gridAttrValue(n);
      v = V('div', gridClasses(n), a, n.children.map(build));
    } else if (n.type === 'cell') {
      v = V('div', cellClasses(n), parseAttrs(n.p.attrs),
        cellContent(n).concat(n.children.map(build)));
    } else {
      return null;
    }
    v.uid = n.id;
    v.ntype = n.type;
    return v;
  }

  /* --- HTML code (indented) --- */
  const IND = '    ';

  function codeOf(v, depth, lines) {
    const pad = IND.repeat(depth);
    if (v.rawHTML !== undefined) {
      String(v.rawHTML).split('\n').forEach(l => lines.push(pad + l));
      return;
    }
    let head = '<' + v.tag;
    if (v.cls.length) head += ' class="' + v.cls.join(' ') + '"';
    for (const k in v.attrs) {
      head += v.attrs[k] === '' ? ' ' + k : ' ' + k + '="' + v.attrs[k] + '"';
    }
    head += '>';
    const hasKids = v.children && v.children.length;
    if (!hasKids && v.text !== undefined) {
      lines.push(pad + head + esc(v.text) + '</' + v.tag + '>');
      return;
    }
    if (!hasKids && v.text === undefined) {
      lines.push(pad + head + '</' + v.tag + '>');
      return;
    }
    lines.push(pad + head);
    if (v.text !== undefined && v.text !== '') lines.push(pad + IND + esc(v.text));
    v.children.forEach(k => codeOf(k, depth + 1, lines));
    lines.push(pad + '</' + v.tag + '>');
  }

  function htmlCode() {
    const lines = [];
    doc.root.children.forEach(n => { const v = build(n); if (v) codeOf(v, 0, lines); });
    const body = lines.join('\n');
    if (!$('#opt-fullpage').checked) return body;
    const css = doc.css.trim();
    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      IND + '<meta charset="utf-8">',
      IND + '<meta name="viewport" content="width=device-width, initial-scale=1">',
      IND + '<title>UIkit Layout</title>',
      IND + '<link rel="stylesheet" href="' + C.CDN.css + '">',
      IND + '<script src="' + C.CDN.js + '"><\/script>',
      IND + '<script src="' + C.CDN.icons + '"><\/script>',
      css ? IND + '<style>\n' + css.split('\n').map(l => IND + IND + l).join('\n') + '\n' + IND + '</style>' : '',
      '</head>',
      '<body>',
      body.split('\n').map(l => IND + l).join('\n'),
      '</body>',
      '</html>'
    ].filter(l => l !== '').join('\n');
  }

  /* --- DOM for the preview (with data-uid) --- */
  function toDOM(v, d) {
    if (v.rawHTML !== undefined) {
      const t = d.createElement('template');
      t.innerHTML = v.rawHTML;
      return Array.prototype.slice.call(t.content.childNodes);
    }
    const el = d.createElement(v.tag);
    if (v.cls.length) el.className = v.cls.join(' ');
    for (const k in v.attrs) el.setAttribute(k, v.attrs[k]);
    if (v.uid) {
      el.setAttribute('data-uid', v.uid);
      el.setAttribute('data-type', v.ntype);
      el.setAttribute('draggable', 'true');
    }
    if (v.text !== undefined) el.textContent = v.text;
    (v.children || []).forEach(k => {
      const r = toDOM(k, d);
      (Array.isArray(r) ? r : [r]).forEach(x => el.appendChild(x));
    });
    return el;
  }

  /* =====================================================================
   * 4. Preview frame
   * ===================================================================== */

  const frameWrap = $('#frame-wrap');
  let frameInner, iframe, fdoc, mount, overlay, frameReady = false;
  let viewportWidth = 0;

  const EDITOR_CSS = `
    html.gg-outline [data-uid]{outline:1px dashed rgba(30,135,240,.4);outline-offset:-1px}
    html.gg-outline [data-type="cell"]{outline-color:rgba(224,138,45,.65)}
    html.gg-outline [data-type="grid"]{outline-color:rgba(30,135,240,.65)}
    html.gg-outline [data-type="container"]{outline-color:rgba(44,182,125,.6)}
    html.gg-outline [data-type="section"]{outline-color:rgba(127,90,240,.6)}
    [data-uid].gg-sel{outline:2px solid #1e87f0 !important;outline-offset:-2px !important}
    [data-uid].gg-drag{opacity:.35}
    [data-uid].gg-before{box-shadow:inset 4px 0 0 #32d296}
    [data-uid].gg-after{box-shadow:inset -4px 0 0 #32d296}
    [data-uid].gg-before-v{box-shadow:inset 0 4px 0 #32d296}
    [data-uid].gg-after-v{box-shadow:inset 0 -4px 0 #32d296}
    [data-uid].gg-into{box-shadow:inset 0 0 0 3px #32d296}
    [data-type="cell"]:empty{min-height:36px;background:repeating-linear-gradient(45deg,rgba(0,0,0,.04) 0 6px,transparent 6px 12px)}
    [data-type="grid"]:empty{min-height:52px;background:repeating-linear-gradient(45deg,rgba(30,135,240,.06) 0 6px,transparent 6px 12px)}
    #gg-ovl{position:fixed;inset:0;pointer-events:none;z-index:2147483000}
    #gg-ovl .gg-lbl{position:absolute;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      color:#fff;padding:1px 5px;border-radius:3px 3px 0 0;white-space:nowrap;transform:translateY(-100%)}
    html.gg-nolabels #gg-ovl{display:none}
    body{margin:0}
  `;

  function initFrame() {
    frameInner = document.createElement('div');
    frameInner.className = 'frame-inner';
    iframe = document.createElement('iframe');
    iframe.title = 'Preview';
    frameInner.appendChild(iframe);
    frameWrap.appendChild(frameInner);

    iframe.src = 'about:blank';
    iframe.addEventListener('load', function once() {
      iframe.removeEventListener('load', once);
      fdoc = iframe.contentDocument;
      fdoc.open();
      fdoc.write(
        '<!DOCTYPE html><html class="gg-outline"><head><meta charset="utf-8">' +
        '<link rel="stylesheet" href="' + C.CDN.css + '">' +
        '<style id="gg-editor">' + EDITOR_CSS + '</style>' +
        '<style id="gg-user"></style>' +
        '</head><body><div id="gg-mount"></div><div id="gg-ovl"></div>' +
        '<script src="' + C.CDN.js + '"><\/script>' +
        '</body></html>'
      );
      fdoc.close();

      /* The document created via document.write is parsed asynchronously –
         so wait until the mount point actually exists. */
      (function waitForMount(tries) {
        mount = fdoc.getElementById('gg-mount');
        overlay = fdoc.getElementById('gg-ovl');
        if (!mount || !overlay) {
          if (tries > 200) return;
          return setTimeout(() => waitForMount(tries + 1), 25);
        }
        bindFrame();
        frameReady = true;
        renderPreview();
        layoutFrame();
      })(0);
    });
  }

  function layoutFrame() {
    if (!frameInner) return;
    const scroll = $('#stage-scroll');
    const avail = Math.max(320, scroll.clientWidth - 28);
    const w = viewportWidth || avail;
    const scale = w > avail ? avail / w : 1;
    const h = Math.max(320, scroll.clientHeight - 28) / scale;
    frameInner.style.width = w + 'px';
    frameInner.style.height = h + 'px';
    frameInner.style.transform = scale < 1 ? 'scale(' + scale + ')' : 'none';
    frameWrap.style.width = Math.round(w * scale) + 'px';
    frameWrap.style.height = Math.round(h * scale) + 'px';
    if (iframe) iframe.style.height = h + 'px';
    const active = C.BREAKPOINTS.filter(b => w >= b.min).pop();
    $('#bp-indicator').textContent = (active.key ? '@' + active.key : 'Base') + ' · ' + Math.round(w) + 'px' +
      (scale < 1 ? ' (zoom ' + Math.round(scale * 100) + '%)' : '');
    updateOverlay();
  }

  function renderPreview() {
    if (!frameReady) return;
    const scrollTop = fdoc.documentElement.scrollTop || fdoc.body.scrollTop;
    mount.textContent = '';
    doc.root.children.forEach(n => {
      const v = build(n);
      if (!v) return;
      const r = toDOM(v, fdoc);
      (Array.isArray(r) ? r : [r]).forEach(x => mount.appendChild(x));
    });
    fdoc.documentElement.scrollTop = scrollTop;
    applySelectionInFrame();
    if (iframe.contentWindow.UIkit) {
      try { iframe.contentWindow.UIkit.update(mount); } catch (e) {}
    }
    updateOverlay();
  }

  function applySelectionInFrame() {
    if (!frameReady) return;
    $$('[data-uid].gg-sel', fdoc).forEach(e => e.classList.remove('gg-sel'));
    if (!selectedId) return;
    const el = fdoc.querySelector('[data-uid="' + selectedId + '"]');
    if (el) el.classList.add('gg-sel');
  }

  const LABEL_COLOR = {
    section: '#7f5af0', container: '#2cb67d', grid: '#1e87f0', cell: '#e08a2d'
  };
  let hoverId = null;

  function updateOverlay() {
    if (!frameReady || !overlay) return;
    overlay.textContent = '';
    [[selectedId, 1], [hoverId, .75]].forEach(([id, op]) => {
      if (!id || (id === hoverId && id === selectedId && op < 1)) return;
      const el = fdoc.querySelector('[data-uid="' + id + '"]');
      const node = findNode(id);
      if (!el || !node) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > fdoc.documentElement.clientHeight) return;
      const lbl = fdoc.createElement('div');
      lbl.className = 'gg-lbl';
      lbl.style.background = LABEL_COLOR[node.type] || '#666';
      lbl.style.opacity = op;
      lbl.style.left = Math.max(0, r.left) + 'px';
      lbl.style.top = Math.max(11, r.top) + 'px';
      lbl.textContent = labelFor(node);
      overlay.appendChild(lbl);
    });
  }

  function labelFor(n) {
    if (n.type === 'section') return 'section' + (n.p.style ? ' · ' + n.p.style : '');
    if (n.type === 'container') return 'container' + (n.p.size ? ' · ' + n.p.size : '');
    if (n.type === 'grid') return 'grid · ' + n.children.length;
    const w = BPS.filter(b => n.p.width[b]).map(b => n.p.width[b] + sfx(b)).join(' ');
    return w || 'cell';
  }

  /* --- interaction inside the frame --- */
  let dragId = null;
  let dropTarget = null;

  function bindFrame() {
    fdoc.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a');
      if (a) e.preventDefault();
      const el = e.target.closest && e.target.closest('[data-uid]');
      select(el ? el.getAttribute('data-uid') : null);
    });
    fdoc.addEventListener('mousemove', e => {
      const el = e.target.closest && e.target.closest('[data-uid]');
      const id = el ? el.getAttribute('data-uid') : null;
      if (id !== hoverId) { hoverId = id; updateOverlay(); }
    });
    fdoc.addEventListener('mouseleave', () => { hoverId = null; updateOverlay(); });
    iframe.contentWindow.addEventListener('scroll', updateOverlay, true);
    iframe.contentWindow.addEventListener('resize', updateOverlay);

    fdoc.addEventListener('dragstart', e => {
      const el = e.target.closest && e.target.closest('[data-uid]');
      if (!el) return;
      dragId = el.getAttribute('data-uid');
      el.classList.add('gg-drag');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragId);
      } catch (err) {}
    });
    fdoc.addEventListener('dragover', e => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const el = fdoc.elementFromPoint(e.clientX, e.clientY);
      const hit = el && el.closest ? el.closest('[data-uid]') : null;
      setDropTarget(hit, e.clientX, e.clientY);
    });
    fdoc.addEventListener('drop', e => {
      if (!dragId) return;
      e.preventDefault();
      commitDrop();
    });
    fdoc.addEventListener('dragend', () => { clearDrag(); });
  }

  function clearDropMarks() {
    if (!frameReady) return;
    $$('.gg-before,.gg-after,.gg-before-v,.gg-after-v,.gg-into', fdoc)
      .forEach(e => e.classList.remove('gg-before', 'gg-after', 'gg-before-v', 'gg-after-v', 'gg-into'));
  }
  function clearDrag() {
    clearDropMarks();
    if (frameReady) $$('.gg-drag', fdoc).forEach(e => e.classList.remove('gg-drag'));
    dragId = null;
    dropTarget = null;
    $$('.tree-row').forEach(r => r.classList.remove('drop-before', 'drop-after', 'drop-into'));
  }

  function horizontalAxis(el) {
    const par = el.parentElement;
    if (!par) return false;
    const r = el.getBoundingClientRect();
    const sibs = Array.prototype.filter.call(par.children, c => c.hasAttribute && c.hasAttribute('data-uid'));
    for (const s of sibs) {
      if (s === el) continue;
      const rs = s.getBoundingClientRect();
      if (Math.abs(rs.top - r.top) < Math.max(6, Math.min(r.height, rs.height) * 0.5)) return true;
    }
    return false;
  }

  function setDropTarget(hitEl, x, y) {
    clearDropMarks();
    dropTarget = null;
    const dragNode = findNode(dragId);
    if (!dragNode) return;

    if (!hitEl) {
      if (canContain('root', dragNode.type)) dropTarget = { parentId: 'root', index: doc.root.children.length };
      return;
    }
    let id = hitEl.getAttribute('data-uid');
    let node = findNode(id);
    if (!node) return;
    if (id === dragId || isAncestor(dragId, id)) return;

    /* 1. drop directly inside? */
    if (canContain(node.type, dragNode.type)) {
      hitEl.classList.add('gg-into');
      dropTarget = { parentId: node.id, index: node.children.length };
      return;
    }
    /* 2. before/after – walk up ancestors if needed */
    let cur = node, curEl = hitEl;
    while (cur) {
      const par = findParent(cur.id) || doc.root;
      if (canContain(par.type, dragNode.type) && !isAncestor(dragId, cur.id) && cur.id !== dragId) {
        const horiz = horizontalAxis(curEl);
        const r = curEl.getBoundingClientRect();
        const after = horiz ? x > r.left + r.width / 2 : y > r.top + r.height / 2;
        curEl.classList.add(horiz ? (after ? 'gg-after' : 'gg-before') : (after ? 'gg-after-v' : 'gg-before-v'));
        let idx = par.children.indexOf(cur) + (after ? 1 : 0);
        dropTarget = { parentId: par.id, index: idx };
        return;
      }
      cur = par === doc.root ? null : par;
      curEl = curEl.parentElement && curEl.parentElement.closest ? curEl.parentElement.closest('[data-uid]') : null;
      if (!curEl) break;
    }
  }

  function commitDrop() {
    if (!dragId || !dropTarget) { clearDrag(); return; }
    const node = findNode(dragId);
    const newParent = dropTarget.parentId === 'root' ? doc.root : findNode(dropTarget.parentId);
    if (!node || !newParent) { clearDrag(); return; }
    if (newParent.id === dragId || isAncestor(dragId, newParent.id)) { clearDrag(); return; }

    const oldParent = findParent(dragId) || doc.root;
    let idx = dropTarget.index;
    const from = oldParent.children.indexOf(node);
    pushUndo();
    oldParent.children.splice(from, 1);
    if (oldParent === newParent && from < idx) idx--;
    newParent.children.splice(Math.max(0, Math.min(idx, newParent.children.length)), 0, node);
    const id = dragId;
    clearDrag();
    render();
    select(id);
  }

  /* =====================================================================
   * 5. Structure tree
   * ===================================================================== */

  const ICON = { section: 'S', container: 'C', grid: 'G', cell: '□' };
  const collapsed = new Set();

  function renderTree() {
    const box = $('#tree');
    box.textContent = '';
    if (!doc.root.children.length) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = 'Still empty – add a section or a grid above.';
      box.appendChild(p);
      return;
    }
    doc.root.children.forEach(n => box.appendChild(treeNode(n)));
  }

  function treeNode(n) {
    const wrap = document.createElement('div');
    wrap.className = 'tree-node';

    const row = document.createElement('div');
    row.className = 'tree-row' + (n.id === selectedId ? ' is-selected' : '');
    row.dataset.uid = n.id;
    row.draggable = true;

    const caret = document.createElement('span');
    caret.className = 'tree-caret';
    caret.textContent = n.children.length ? (collapsed.has(n.id) ? '▶' : '▼') : '';
    caret.addEventListener('click', e => {
      e.stopPropagation();
      if (!n.children.length) return;
      collapsed.has(n.id) ? collapsed.delete(n.id) : collapsed.add(n.id);
      renderTree();
    });

    const ic = document.createElement('span');
    ic.className = 'tree-icon ic-' + n.type;
    ic.textContent = ICON[n.type];

    const lab = document.createElement('span');
    lab.className = 'tree-label';
    lab.textContent = labelFor(n);

    const meta = document.createElement('span');
    meta.className = 'tree-meta';
    meta.textContent = n.type === 'grid' ? n.children.length + '×' : '';

    row.append(caret, ic, lab, meta);
    row.addEventListener('click', () => select(n.id));

    row.addEventListener('dragstart', e => {
      e.stopPropagation();
      dragId = n.id;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', n.id); } catch (err) {}
    });
    row.addEventListener('dragover', e => {
      if (!dragId || dragId === n.id || isAncestor(dragId, n.id)) return;
      e.preventDefault();
      e.stopPropagation();
      $$('.tree-row').forEach(r => r.classList.remove('drop-before', 'drop-after', 'drop-into'));
      const dn = findNode(dragId);
      const r = row.getBoundingClientRect();
      const rel = (e.clientY - r.top) / r.height;
      const par = findParent(n.id) || doc.root;
      const canInto = canContain(n.type, dn.type);
      const canSib = canContain(par.type, dn.type);
      if (canInto && (rel > 0.3 && rel < 0.7 || !canSib)) {
        row.classList.add('drop-into');
        dropTarget = { parentId: n.id, index: n.children.length };
      } else if (canSib) {
        const after = rel > 0.5;
        row.classList.add(after ? 'drop-after' : 'drop-before');
        dropTarget = { parentId: par.id, index: par.children.indexOf(n) + (after ? 1 : 0) };
      } else {
        dropTarget = null;
      }
    });
    row.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); commitDrop(); });
    row.addEventListener('dragend', clearDrag);

    wrap.appendChild(row);
    if (n.children.length && !collapsed.has(n.id)) {
      const kids = document.createElement('div');
      kids.className = 'tree-children';
      n.children.forEach(c => kids.appendChild(treeNode(c)));
      wrap.appendChild(kids);
    }
    return wrap;
  }

  /* =====================================================================
   * 6. Inspector
   * ===================================================================== */

  const openGroups = new Set(['Layout', 'Width', 'Grid', 'Content', 'Section']);
  const rcTab = {};   /* remembers the active breakpoint per control */
  let metaRefreshers = [];

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function group(title, ...kids) {
    const d = el('details', 'insp-group');
    d.open = openGroups.has(title);
    const s = el('summary', '', title);
    d.appendChild(s);
    const inner = el('div', 'insp-inner');
    kids.filter(Boolean).forEach(k => inner.appendChild(k));
    d.appendChild(inner);
    d.addEventListener('toggle', () => {
      d.open ? openGroups.add(title) : openGroups.delete(title);
    });
    return d;
  }

  function selectCtl(label, options, value, onChange) {
    const f = el('div', 'field');
    if (label) f.appendChild(el('label', '', label));
    const s = el('select');
    options.forEach(o => {
      const op = el('option', '', o.t);
      op.value = o.v;
      s.appendChild(op);
    });
    s.value = value || '';
    if (s.value !== (value || '')) { /* value not in list → add it */
      const op = el('option', '', value); op.value = value; s.appendChild(op); s.value = value;
    }
    s.addEventListener('change', () => onChange(s.value));
    f.appendChild(s);
    return f;
  }

  function textCtl(label, value, onInput, opts) {
    const f = el('div', 'field');
    if (label) f.appendChild(el('label', '', label));
    const i = el((opts && opts.area) ? 'textarea' : 'input');
    if (!(opts && opts.area)) i.type = 'text';
    if (opts && opts.ph) i.placeholder = opts.ph;
    i.value = value || '';
    i.addEventListener('input', () => onInput(i.value));
    f.appendChild(i);
    return f;
  }

  function checkCtl(label, value, onChange) {
    const l = el('label', 'chk');
    const i = el('input');
    i.type = 'checkbox';
    i.checked = !!value;
    i.addEventListener('change', () => onChange(i.checked));
    l.appendChild(i);
    l.appendChild(document.createTextNode(' ' + label));
    const f = el('div', 'field');
    f.appendChild(l);
    return f;
  }

  function chipsCtl(label, options, values, onChange) {
    const f = el('div', 'field');
    if (label) f.appendChild(el('label', '', label));
    const box = el('div', 'chips');
    options.forEach(o => {
      const b = el('button', 'chip' + (values.indexOf(o.v) > -1 ? ' is-on' : ''), o.t);
      b.type = 'button';
      b.addEventListener('click', () => {
        const i = values.indexOf(o.v);
        i > -1 ? values.splice(i, 1) : values.push(o.v);
        b.classList.toggle('is-on');
        onChange(values);
      });
      box.appendChild(b);
    });
    f.appendChild(box);
    return f;
  }

  /* responsive control with breakpoint tabs */
  function respCtl(key, label, options, map, onChange, note) {
    const f = el('div', 'rc');
    const head = el('div', 'rc-head');
    const body = el('div', 'rc-body');
    const active = rcTab[key] || '';
    const tabs = [];

    C.BREAKPOINTS.forEach(bp => {
      const t = el('div', 'rc-tab' + (bp.key === active ? ' is-active' : '') + (map[bp.key] ? ' has-value' : ''), bp.label);
      t.title = bp.hint;
      t.addEventListener('click', () => { rcTab[key] = bp.key; buildInspector(); });
      head.appendChild(t);
      tabs.push([bp.key, t]);
    });

    const title = el('div', 'rc-title');
    title.appendChild(el('span', '', label));
    const sum = el('span', 'muted');
    title.appendChild(sum);
    body.appendChild(title);

    const refresh = () => {
      sum.textContent = BPS.filter(b => map[b]).map(b => map[b] + sfx(b)).join(', ') || '–';
      tabs.forEach(([k, t]) => t.classList.toggle('has-value', !!map[k]));
    };
    refresh();
    metaRefreshers.push(refresh);

    const opts = typeof options === 'function' ? options(active) : options;
    body.appendChild(selectCtl('', opts, map[active], v => { map[active] = v; onChange(); }));
    if (note) body.appendChild(el('small', 'muted', note));

    f.append(head, body);
    return f;
  }

  function classString(node) {
    const v = build(node);
    let s = '<' + v.tag;
    if (v.cls.length) s += ' class="' + v.cls.join(' ') + '"';
    for (const k in v.attrs) s += v.attrs[k] === '' ? ' ' + k : ' ' + k + '="' + v.attrs[k] + '"';
    return s + '>';
  }

  function refreshMeta() {
    const box = $('#insp-class');
    const n = selectedId ? findNode(selectedId) : null;
    if (box && n) box.textContent = classString(n);
    metaRefreshers.forEach(f => { try { f(); } catch (e) {} });
  }

  function classPreview(node) {
    const v = build(node);
    const box = el('div', 'classlist');
    box.id = 'insp-class';
    let s = '<' + v.tag;
    if (v.cls.length) s += ' class="' + v.cls.join(' ') + '"';
    for (const k in v.attrs) s += v.attrs[k] === '' ? ' ' + k : ' ' + k + '="' + v.attrs[k] + '"';
    box.textContent = s + '>';
    return box;
  }

  function buildInspector() {
    const box = $('#inspector');
    box.textContent = '';
    metaRefreshers = [];
    const n = selectedId ? findNode(selectedId) : null;
    $('#btn-delete').disabled = !n;
    $('#btn-duplicate').disabled = !n;
    if (!n) {
      $('#inspector-title').textContent = 'Properties';
      box.appendChild(el('p', 'hint', 'Nothing selected. Click an element in the preview or in the structure tree.'));
      return;
    }
    $('#inspector-title').textContent = n.type;
    box.appendChild(classPreview(n));
    box.appendChild(addChildBar(n));

    const p = n.p;
    const upd = () => { touch(); };
    const updFull = () => { touch(); buildInspector(); };

    if (n.type === 'section') {
      box.appendChild(group('Section',
        selectCtl('Style', C.SECTION_STYLE, p.style, v => { p.style = v; upd(); }),
        selectCtl('Size (padding)', C.SECTION_SIZE, p.size, v => { p.size = v; upd(); }),
        (() => {
          const r = el('div', 'row2');
          r.appendChild(selectCtl('Padding top', C.SECTION_EDGE, p.padTop, v => { p.padTop = v; upd(); }));
          r.appendChild(selectCtl('Padding bottom', C.SECTION_EDGE, p.padBottom, v => { p.padBottom = v; upd(); }));
          return r;
        })(),
        checkCtl('uk-section-overlap  (reserved modifier, no default CSS)', p.overlap, v => { p.overlap = v; upd(); }),
        checkCtl('uk-preserve-color', p.preserveColor, v => { p.preserveColor = v; upd(); }),
        selectCtl('Inverse', C.INVERSE, p.inverse, v => { p.inverse = v; upd(); })
      ));
    }

    if (n.type === 'container') {
      box.appendChild(group('Container',
        selectCtl('Width', C.CONTAINER_SIZE, p.size, v => { p.size = v; upd(); }),
        chipsCtl('Remove item padding', [
          { v: 'remove-left', t: 'left' }, { v: 'remove-right', t: 'right' }
        ], p.padRemove, () => upd()),
        el('small', 'muted',
          'uk-width-* also works standalone, without a uk-grid parent – but then there are no ' +
          'gutters and no wrapping. This generator therefore always models widths inside a grid; ' +
          'for columns without gutters use uk-grid-collapse on the grid.')
      ));
    }

    if (n.type === 'grid') {
      box.appendChild(group('Grid',
        selectCtl('Gutter', C.GRID_GUTTER, p.gutter, v => { p.gutter = v; upd(); }),
        (() => {
          const r = el('div', 'row2');
          r.appendChild(selectCtl('columns only', C.GRID_COLUMN_GUTTER, p.colGutter, v => { p.colGutter = v; upd(); }));
          r.appendChild(selectCtl('rows only', C.GRID_ROW_GUTTER, p.rowGutter, v => { p.rowGutter = v; upd(); }));
          return r;
        })(),
        checkCtl('uk-grid-divider', p.divider, v => { p.divider = v; upd(); }),
        checkCtl('uk-grid-match  (equal height)', p.match, v => { p.match = v; upd(); }),
        selectCtl('Masonry', C.GRID_MASONRY, p.masonry, v => { p.masonry = v; upd(); }),
        textCtl('Parallax (px)', p.parallax, v => { p.parallax = v; upd(); }, { ph: 'e.g. 150' })
      ));

      box.appendChild(group('Width',
        respCtl('gw', 'uk-child-width-*', bp => optsFor(C.CHILD_WIDTHS, bp), p.childWidth, upd,
          'Applies to all direct children. Individual columns override this with uk-width-*.')
      ));

      box.appendChild(group('Flex',
        respCtl('gfh', 'Horizontal', C.FLEX_H, p.flexH, upd),
        respCtl('gfv', 'Vertical', C.FLEX_V, p.flexV, upd),
        respCtl('gfd', 'Direction', bp => optsFor(C.FLEX_DIR, bp), p.flexDir, upd,
          'row/column are responsive, *-reverse only without a breakpoint.'),
        selectCtl('Wrap', C.FLEX_WRAP, p.flexWrap, v => { p.flexWrap = v; upd(); }),
        selectCtl('Wrap alignment', C.FLEX_WRAP_ALIGN, p.flexWrapAlign, v => { p.flexWrapAlign = v; upd(); })
      ));

      box.appendChild(marginGroup(p, upd));
    }

    if (n.type === 'cell') {
      box.appendChild(group('Width',
        respCtl('cw', 'uk-width-*', bp => optsFor(W_ALL, bp), p.width, upd,
          'uk-width-1-1 only exists with a breakpoint, fit-/max-/min-content only without.'),
        checkCtl('uk-grid-item-match', p.itemMatch, v => { p.itemMatch = v; upd(); })
      ));

      box.appendChild(group('Layout',
        respCtl('co', 'Order', C.FLEX_ORDER, p.order, upd),
        respCtl('cfi', 'Flex behavior', bp => optsFor(C.FLEX_ITEM, bp), p.flexItem, upd),
        selectCtl('Height', C.HEIGHTS, p.height, v => { p.height = v; upd(); }),
        respCtl('cta', 'Text alignment', bp => optsFor(C.TEXT_ALIGN, bp), p.textAlign, upd),
        selectCtl('Background', C.BACKGROUND, p.background, v => { p.background = v; upd(); }),
        selectCtl('Inverse', C.INVERSE, p.inverse, v => { p.inverse = v; upd(); })
      ));

      box.appendChild(group('Flex-Container',
        checkCtl('uk-flex (align content)', p.flex, v => { p.flex = v; updFull(); }),
        p.flex ? respCtl('cfh', 'Horizontal', C.FLEX_H, p.flexH, upd) : null,
        p.flex ? respCtl('cfv', 'Vertical', C.FLEX_V, p.flexV, upd) : null,
        p.flex ? respCtl('cfd', 'Direction', bp => optsFor(C.FLEX_DIR, bp), p.flexDir, upd) : null
      ));

      box.appendChild(group('Padding',
        selectCtl('Padding', C.PADDING_SIZE, p.padSize, v => { p.padSize = v; upd(); }),
        chipsCtl('remove', C.PADDING_REMOVE, p.padRemove, () => upd()),
        el('small', 'muted',
          'UIkit offers no @breakpoint variants for padding. uk-padding (30→40px) and ' +
          'uk-padding-large (40→70px) grow on their own from 1200px; everything else via the CSS field.')
      ));

      box.appendChild(marginGroup(p, upd));

      box.appendChild(group('Content',
        selectCtl('Type', C.CONTENT_MODE, p.content, v => { p.content = v; updFull(); }),
        p.content === 'card' ? selectCtl('Card style', C.CARD_STYLE, p.cardStyle, v => { p.cardStyle = v; upd(); }) : null,
        p.content === 'card' ? selectCtl('Card size', C.CARD_SIZE, p.cardSize, v => { p.cardSize = v; upd(); }) : null,
        p.content === 'card' ? checkCtl('uk-card-hover', p.cardHover, v => { p.cardHover = v; upd(); }) : null,
        ['card', 'tile', 'text'].indexOf(p.content) > -1 ? textCtl('Heading', p.title, v => { p.title = v; upd(); }) : null,
        ['card', 'tile', 'text'].indexOf(p.content) > -1 ? textCtl('Text', p.text, v => { p.text = v; upd(); }, { area: true }) : null,
        p.content === 'html' ? textCtl('HTML', p.html, v => { p.html = v; upd(); }, { area: true }) : null
      ));
    }

    box.appendChild(group('Custom classes / attributes',
      textCtl('Classes', p.classes, v => { p.classes = v; upd(); }, { ph: 'my-class another-one' }),
      textCtl('Attributes', p.attrs, v => { p.attrs = v; upd(); }, { ph: 'id="hero" data-x="1"' })
    ));
  }

  function marginGroup(p, upd) {
    return group('Margin',
      (() => {
        const r = el('div', 'row2');
        r.appendChild(selectCtl('Size', C.MARGIN_SIZE, p.marginSize, v => { p.marginSize = v; upd(); }));
        r.appendChild(selectCtl('Side', C.MARGIN_SIDE, p.marginSide, v => { p.marginSide = v; upd(); }));
        return r;
      })(),
      (() => {
        const r = el('div', 'row2');
        r.appendChild(selectCtl('auto', C.MARGIN_AUTO, p.marginAuto, v => { p.marginAuto = v; upd(); }));
        r.appendChild(selectCtl('auto @bp', C.BREAKPOINTS.map(b => ({ v: b.key, t: b.label })), p.marginAutoBp,
          v => { p.marginAutoBp = v; upd(); }));
        return r;
      })(),
      chipsCtl('remove', C.MARGIN_REMOVE, p.marginRemove, () => upd()),
      respCtl('mrx', 'remove left/right', C.MARGIN_REMOVE_X, p.marginRemoveX, upd,
        'The only margin classes with breakpoint variants. Sizes (small…xlarge) ' +
        'only exist without a breakpoint in UIkit – they grow automatically from 1200px.')
    );
  }

  function addChildBar(n) {
    const f = el('div', 'field');
    const box = el('div', 'hgroup');
    const allowed = CONTAINS[n.type] || [];
    allowed.forEach(t => {
      const b = el('button', 'btn btn-mini', '+ ' + t);
      b.type = 'button';
      b.addEventListener('click', () => {
        pushUndo();
        const child = t === 'section' ? newSection() : t === 'container' ? newContainer() :
          t === 'grid' ? newGrid(3) : newCell(n.children.length + 1);
        n.children.push(child);
        render();
        select(child.id);
      });
      box.appendChild(b);
    });
    if (n.type === 'grid') {
      const b = el('button', 'btn btn-mini', '+ 1 Column');
      b.type = 'button';
      b.addEventListener('click', () => {
        pushUndo();
        const c = newCell(n.children.length + 1);
        n.children.push(c);
        render();
        select(c.id);
      });
      box.replaceChildren(b);
    }
    if (!box.children.length) return el('div');
    f.appendChild(box);
    return f;
  }

  /* =====================================================================
   * 7. Undo / persistence
   * ===================================================================== */

  const undoStack = [], redoStack = [];
  const snapshot = () => JSON.stringify({ root: doc.root, css: doc.css });

  function pushUndo() {
    undoStack.push(snapshot());
    if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
    updateUndoButtons();
  }
  function restore(json) {
    const d = JSON.parse(json);
    doc.root = d.root;
    doc.css = d.css || '';
    $('#out-css').value = doc.css;
    render();
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restore(undoStack.pop());
    updateUndoButtons();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restore(redoStack.pop());
    updateUndoButtons();
  }
  function updateUndoButtons() {
    $('#btn-undo').disabled = !undoStack.length;
    $('#btn-redo').disabled = !redoStack.length;
  }

  const LS = 'uikit-grid-generator-v1';
  function save() {
    try { localStorage.setItem(LS, snapshot()); } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(LS);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d.root || !d.root.children) return false;
      doc.root = d.root;
      doc.css = d.css || '';
      return true;
    } catch (e) { return false; }
  }

  /* =====================================================================
   * 8. Render pipeline
   * ===================================================================== */

  let touchTimer = null;
  function touch() {
    renderPreview();
    renderCode();
    renderTree();
    refreshMeta();
    clearTimeout(touchTimer);
    touchTimer = setTimeout(save, 400);
  }
  function render() {
    renderPreview();
    renderTree();
    renderCode();
    buildInspector();
    save();
  }
  function renderCode() {
    $('#out-html').value = htmlCode();
    $('#stage-info').textContent =
      doc.root.children.length + ' top-level · ' + countType('grid') + ' grids · ' + countType('cell') + ' columns';
  }
  function countType(t) {
    let c = 0;
    walk(doc.root, n => { if (n.type === t) c++; });
    return c;
  }
  function select(id) {
    selectedId = id;
    applySelectionInFrame();
    updateOverlay();
    renderTree();
    buildInspector();
    const row = $('.tree-row.is-selected');
    if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
  }

  function toast(msg) {
    const t = el('div', 'toast', msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1900);
  }

  /* =====================================================================
   * 9. Presets
   * ===================================================================== */

  function preset(name) {
    pushUndo();
    const s = newSection();
    const cont = s.children[0];
    const g = cont.children[0];

    if (name === 'thirds') {
      g.p.childWidth = { '': '', s: '', m: '1-3', l: '', xl: '' };
      g.children = [newCell(1), newCell(2), newCell(3)];
    } else if (name === 'sidebar') {
      g.p.childWidth = bpMap();
      g.children = [newCell(1), newCell(2)];
      g.children[0].p.width = { '': '', s: '', m: '1-4', l: '', xl: '' };
      g.children[0].p.title = 'Sidebar';
      g.children[1].p.width = { '': '', s: '', m: 'expand', l: '', xl: '' };
      g.children[1].p.title = 'Content';
    } else if (name === 'cards') {
      g.p.childWidth = { '': '', s: '1-2', m: '1-3', l: '1-4', xl: '' };
      g.p.gutter = 'small';
      g.p.match = true;
      g.children = [1, 2, 3, 4, 5, 6, 7, 8].map(i => newCell(i));
    } else if (name === 'hero') {
      s.p.style = 'primary';
      s.p.size = 'large';
      g.p.childWidth = bpMap();
      g.p.flexV[''] = 'middle';
      g.children = [newCell(1), newCell(2)];
      g.children[0].p.width = { '': '', s: '', m: '1-2', l: '', xl: '' };
      g.children[0].p.content = 'text';
      g.children[0].p.title = 'Large heading';
      g.children[1].p.width = { '': '', s: '', m: '1-2', l: '', xl: '' };
      g.children[1].p.height = 'medium';
      g.children[1].p.content = 'empty';
      g.children[1].p.background = 'muted';
    } else if (name === 'divider') {
      g.p.divider = true;
      g.p.childWidth = { '': '', s: '1-2', m: '1-3', l: '', xl: '' };
      g.children = [1, 2, 3, 4, 5, 6].map(i => newCell(i));
      g.children.forEach(c => { c.p.content = 'text'; });
    } else if (name === 'masonry') {
      g.p.masonry = 'pack';
      g.p.childWidth = { '': '', s: '1-2', m: '1-3', l: '', xl: '' };
      g.children = [1, 2, 3, 4, 5, 6].map(i => newCell(i));
      g.children.forEach((c, i) => { c.p.height = ['small', 'medium', 'large'][i % 3]; });
    } else if (name === 'nested') {
      g.p.childWidth = bpMap();
      g.children = [newCell(1), newCell(2)];
      g.children[0].p.width = { '': '', s: '', m: '2-3', l: '', xl: '' };
      g.children[0].p.content = 'empty';
      const inner = newGrid(2);
      inner.p.gutter = 'small';
      inner.p.childWidth = { '': '1-2', s: '', m: '', l: '', xl: '' };
      g.children[0].children = [inner];
      g.children[1].p.width = { '': '', s: '', m: '1-3', l: '', xl: '' };
    }
    doc.root.children.push(s);
    render();
    select(s.id);
  }

  const PRESETS = [
    ['thirds', 'Three columns (1-1 → 1-3@m)'],
    ['cards', 'Card grid (1-2@s 1-3@m 1-4@l, match)'],
    ['sidebar', 'Sidebar + content (1-4 / expand)'],
    ['hero', 'Hero section (primary, middle)'],
    ['divider', 'Grid with dividers'],
    ['masonry', 'Masonry (pack)'],
    ['nested', 'Nested grid']
  ];

  /* =====================================================================
   * 10. UI wiring
   * ===================================================================== */

  function initViewportBar() {
    const bar = $('#viewport-bar');
    C.VIEWPORTS.forEach(v => {
      const b = el('button', 'btn btn-mini' + (v.w === viewportWidth ? ' is-active' : ''), v.label);
      b.addEventListener('click', () => {
        viewportWidth = v.w;
        $$('#viewport-bar .btn').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        layoutFrame();
      });
      bar.appendChild(b);
    });
  }

  const APP_VERSION = '1.0';

  function initEvents() {
    $('#uk-version').textContent = C.VERSION;
    $('#about-version').textContent = APP_VERSION;
    $('#about-uk-version').textContent = C.VERSION;

    const aboutOverlay = $('#about-overlay');
    const openAbout = () => { aboutOverlay.hidden = false; };
    const closeAbout = () => { aboutOverlay.hidden = true; };
    $('#btn-about').addEventListener('click', openAbout);
    $('#about-close').addEventListener('click', closeAbout);
    aboutOverlay.addEventListener('click', e => { if (e.target === aboutOverlay) closeAbout(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !aboutOverlay.hidden) closeAbout();
    });

    $('#add-section').addEventListener('click', () => {
      pushUndo();
      const s = newSection();
      doc.root.children.push(s);
      render();
      select(s.id);
    });
    $('#add-container').addEventListener('click', () => {
      pushUndo();
      const c = newContainer();
      doc.root.children.push(c);
      render();
      select(c.id);
    });
    $('#add-grid').addEventListener('click', () => {
      pushUndo();
      const g = newGrid(3);
      doc.root.children.push(g);
      render();
      select(g.id);
    });

    $('#btn-delete').addEventListener('click', () => {
      if (!selectedId) return;
      const par = findParent(selectedId) || doc.root;
      const n = findNode(selectedId);
      pushUndo();
      par.children.splice(par.children.indexOf(n), 1);
      selectedId = null;
      render();
    });
    $('#btn-duplicate').addEventListener('click', () => {
      if (!selectedId) return;
      const par = findParent(selectedId) || doc.root;
      const n = findNode(selectedId);
      pushUndo();
      const copy = JSON.parse(JSON.stringify(n));
      walk(copy, x => { x.id = uid(); });
      par.children.splice(par.children.indexOf(n) + 1, 0, copy);
      render();
      select(copy.id);
    });

    $('#btn-undo').addEventListener('click', undo);
    $('#btn-redo').addEventListener('click', redo);

    $('#btn-clear').addEventListener('click', () => {
      if (!confirm('Really clear everything?')) return;
      pushUndo();
      doc.root.children = [];
      selectedId = null;
      render();
    });

    $('#opt-outline').addEventListener('change', e => {
      if (frameReady) fdoc.documentElement.classList.toggle('gg-outline', e.target.checked);
    });
    $('#opt-labels').addEventListener('change', e => {
      if (frameReady) fdoc.documentElement.classList.toggle('gg-nolabels', !e.target.checked);
    });
    $('#opt-fullpage').addEventListener('change', renderCode);

    $('#out-css').addEventListener('input', e => {
      doc.css = e.target.value;
      if (frameReady) fdoc.getElementById('gg-user').textContent = doc.css;
      renderCode();
      clearTimeout(touchTimer);
      touchTimer = setTimeout(save, 400);
    });

    $$('[data-copy]').forEach(b => {
      b.addEventListener('click', () => {
        const ta = document.getElementById(b.getAttribute('data-copy'));
        ta.select();
        navigator.clipboard ? navigator.clipboard.writeText(ta.value).then(() => toast('Copied'))
          : (document.execCommand('copy'), toast('Copied'));
      });
    });

    $('#code-toggle').addEventListener('click', () => {
      $('#code-area').classList.toggle('is-collapsed');
      setTimeout(layoutFrame, 180);
    });

    /* presets menu */
    const menu = $('#presets-menu');
    PRESETS.forEach(([k, t]) => {
      const b = el('button', '', t);
      b.addEventListener('click', () => { menu.hidden = true; preset(k); });
      menu.appendChild(b);
    });
    $('#btn-presets').addEventListener('click', e => {
      const r = e.target.getBoundingClientRect();
      menu.hidden = !menu.hidden;
      menu.style.top = (r.bottom + 4) + 'px';
      menu.style.left = Math.min(r.left, window.innerWidth - 250) + 'px';
    });
    document.addEventListener('click', e => {
      if (!menu.hidden && !menu.contains(e.target) && e.target.id !== 'btn-presets') menu.hidden = true;
    });

    /* import / export */
    $('#btn-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ root: doc.root, css: doc.css }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'uikit-grid.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#btn-import').addEventListener('click', () => $('#import-file').click());
    $('#import-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const d = JSON.parse(r.result);
          if (!d.root) throw new Error('bad');
          pushUndo();
          doc.root = d.root;
          doc.css = d.css || '';
          $('#out-css').value = doc.css;
          if (frameReady) fdoc.getElementById('gg-user').textContent = doc.css;
          selectedId = null;
          render();
          toast('Imported');
        } catch (err) { alert('Could not read file.'); }
      };
      r.readAsText(f);
      e.target.value = '';
    });

    /* keyboard */
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (typing) return;
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        e.preventDefault();
        $('#btn-delete').click();
      }
      if (e.key === 'Escape') select(null);
    });

    window.addEventListener('resize', layoutFrame);
    new ResizeObserver(layoutFrame).observe($('#stage-scroll'));
  }

  /* =====================================================================
   * Boot
   * ===================================================================== */

  function boot() {
    initViewportBar();
    initEvents();
    if (!load()) {
      doc.root.children.push(newSection());
    } else {
      /* keep IDs unique */
      walk(doc.root, n => { uidSeq++; });
    }
    $('#out-css').value = doc.css;
    updateUndoButtons();
    initFrame();
    renderTree();
    renderCode();
    buildInspector();
    const first = doc.root.children[0];
    if (first) select(first.id);

    /* apply user CSS once the frame is ready */
    const t = setInterval(() => {
      if (!frameReady) return;
      clearInterval(t);
      fdoc.getElementById('gg-user').textContent = doc.css;
      fdoc.documentElement.classList.toggle('gg-outline', $('#opt-outline').checked);
      fdoc.documentElement.classList.toggle('gg-nolabels', !$('#opt-labels').checked);
    }, 60);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
