// The Hive menu (☰): What's new, the dark-mode switch and links to every Hive tool.
// One file for every page. A page adds <div id="hive-menu"></div> where the button goes
// and loads this script; it finds the Learn site (links + changelog.json) from its own URL.
(function () {
  var script = document.currentScript
  var BASE = script ? script.src.replace(/[^/]*$/, '') : ''
  var HUB = 'https://cbell0920.github.io/tptraders-hub/'
  var JOURNAL = 'https://tptraders.vercel.app'
  var THEME_KEY = 'hive-theme'
  var SEEN_KEY = 'hive-seen'

  function get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function put(k, v) { try { localStorage.setItem(k, v) } catch (e) { /* storage off */ } }

  var css = [
    '.hm{position:relative;display:inline-flex}',
    '.hm-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:34px;height:30px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text2);cursor:pointer}',
    '.hm-btn:hover,.hm-btn[aria-expanded="true"]{color:var(--text);border-color:var(--text2)}',
    '.hm-btn svg{width:16px;height:16px;stroke:currentColor;stroke-width:2;stroke-linecap:round;fill:none}',
    '.hm-dot{position:absolute;top:-4px;right:-4px;width:9px;height:9px;border-radius:50%;background:#f5b942;border:2px solid var(--panel)}',
    '.hm-panel{position:absolute;right:0;top:calc(100% + 8px);z-index:70;width:240px;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:6px 0;box-shadow:0 10px 30px rgba(0,0,0,.35);font-family:var(--sans,system-ui,sans-serif)}',
    '.hm-item{display:flex;align-items:center;gap:10px;padding:9px 14px;font-size:13.5px;color:var(--text);text-decoration:none;cursor:pointer;letter-spacing:0;text-transform:none;font-weight:400}',
    '.hm-item:hover{background:var(--panel2,var(--input,rgba(127,127,127,.12)))}',
    '.hm-count{margin-left:auto;font-family:var(--mono,monospace);font-size:11px;font-weight:600;color:#1a1300;background:#f5b942;border-radius:999px;padding:1px 8px}',
    '.hm-switch input{position:absolute;opacity:0;pointer-events:none}',
    '.hm-track{margin-left:auto;position:relative;width:36px;height:20px;border-radius:999px;background:var(--border);transition:background .15s}',
    '.hm-track::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .15s}',
    '.hm-switch input:checked+.hm-track{background:#f5b942}',
    '.hm-switch input:checked+.hm-track::after{transform:translateX(16px)}',
    '.hm-switch input:focus-visible+.hm-track{outline:2px solid #f5b942;outline-offset:2px}',
    '.hm-sep{height:1px;background:var(--border);margin:6px 0}',
    '.hm-label{padding:4px 14px 2px;font-family:var(--mono,monospace);font-size:10px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase}',
    '.hm-link{padding:6px 14px;font-size:13px;color:var(--text2)}',
    '.hm-link:hover{color:var(--text)}',
    '@media print{.hm{display:none!important}}',
  ].join('')
  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  var links = [
    ['The Hive', HUB], ['Learn', BASE + 'index.html'], ['Strategies', BASE + 'strategies.html'],
    ['Daily Checklist', BASE + 'checklist.html'], ['Paper Trading', BASE + 'paper.html'], ['Journal', JOURNAL],
  ]

  function build(slot) {
    var wrap = document.createElement('div')
    wrap.className = 'hm'
    wrap.innerHTML =
      '<button class="hm-btn" type="button" aria-label="Menu" aria-expanded="false" aria-haspopup="true">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      '<span class="hm-dot" hidden></span></button>' +
      '<div class="hm-panel" hidden>' +
      '<a class="hm-item hm-new" href="' + BASE + 'changelog.html">What\'s new<span class="hm-count" hidden></span></a>' +
      '<label class="hm-item hm-switch">Dark mode<input type="checkbox" role="switch"><span class="hm-track" aria-hidden="true"></span></label>' +
      '<div class="hm-sep"></div><div class="hm-label">Go to</div>' +
      links.map(function (l) { return '<a class="hm-item hm-link" href="' + l[1] + '">' + l[0] + '</a>' }).join('') +
      '</div>'
    slot.appendChild(wrap)

    var btn = wrap.querySelector('.hm-btn')
    var panel = wrap.querySelector('.hm-panel')
    function open(on) { panel.hidden = !on; btn.setAttribute('aria-expanded', on ? 'true' : 'false') }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(panel.hidden) })
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) open(false) })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false) })

    // Dark mode switch: on = dark (the default). Same key the pages read before they draw.
    var sw = wrap.querySelector('.hm-switch input')
    var root = document.documentElement
    sw.checked = root.getAttribute('data-theme') !== 'light'
    sw.addEventListener('change', function () {
      if (sw.checked) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', 'light')
      put(THEME_KEY, sw.checked ? 'dark' : 'light')
    })

    // What's new: count changes dated after this reader's last visit to the page.
    fetch(BASE + 'changelog.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : [] })
      .then(function (days) {
        var seen = get(SEEN_KEY)
        if (!seen || !days.length) return
        var n = days.filter(function (d) { return d.date > seen }).reduce(function (a, d) { return a + d.count }, 0)
        if (!n) return
        var c = wrap.querySelector('.hm-count')
        c.textContent = n + ' new'
        c.hidden = false
        wrap.querySelector('.hm-dot').hidden = false
      })
      .catch(function () { /* offline: no badge */ })
  }

  function init() {
    var slot = document.getElementById('hive-menu')
    if (slot && !slot.firstChild) build(slot)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
