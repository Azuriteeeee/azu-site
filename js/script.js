/* ==========================================================================
   Azurite site script（依存ライブラリなし / Vanilla JS）
   --------------------------------------------------------------------------
   1. Icons      : SVG アイコンスプライトの注入（全ページ共通・file:// でも動作）
   2. Header     : スクロール時のガラス背景 / ハンバーガーメニュー
   3. Theme      : ダーク / ライト切替（localStorage に保存）
   4. UI         : ページトップ / スクロール表示アニメーション / ハッシュタグコピー
   5. Video      : 動画モーダル / 遅延埋め込み / ジャンル別タブ
   6. Schedule   : 週間配信スケジュール
   7. Lightbox   : 画像拡大表示
   8. Contact    : 問い合わせフォーム（文面生成 → コピー / X / メール）
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.SITE_DATA || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icon(name, extra) {
    return '<svg class="icon ' + (extra || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }
  function thumb(id) { return "https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/maxresdefault.jpg"; }
  function embedSrc(id) {
    return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1&enablejsapi=1";
  }

  /* =========================================================
     1. Icons
     ========================================================= */
  var S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var F = 'fill="currentColor"';
  var ICONS = {
    menu: [S, '<path d="M4 7h16M4 12h16M4 17h16"/>'],
    close: [S, '<path d="M18 6 6 18M6 6l12 12"/>'],
    sun: [S, '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'],
    moon: [S, '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'],
    play: [F, '<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z"/>'],
    "arrow-up": [S, '<path d="m5 12 7-7 7 7M12 19V5"/>'],
    "arrow-right": [S, '<path d="M5 12h14M12 5l7 7-7 7"/>'],
    external: [S, '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'],
    copy: [S, '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'],
    check: [S, '<path d="M20 6 9 17l-5-5"/>'],
    users: [S, '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'],
    eye: [S, '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'],
    calendar: [S, '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'],
    flag: [S, '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>'],
    mail: [S, '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>'],
    bag: [S, '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>'],
    heart: [S, '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'],
    instagram: [S, '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'],
    info: [S, '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'],
    alert: [S, '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>'],
    gamepad: [S, '<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/>'],
    star: [S, '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'],
    scissors: [S, '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>'],
    palette: [S, '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"/>'],
    briefcase: [S, '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'],
    hash: [S, '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'],
    film: [S, '<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>'],
    cpu: [S, '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>'],
    youtube: [F, '<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>'],
    x: [F, '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/>'],
    twitch: [F, '<path d="M11.57 4.71h1.72v5.15h-1.72zm4.72 0H18v5.15h-1.71zM6 0 1.71 4.29v15.42h5.15V24l4.28-4.29h3.43L22.29 12V0zm14.57 11.14-3.43 3.43h-3.43l-3 3v-3H6.86V1.71h13.71z"/>'],
    tiktok: [F, '<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>']
  };

  function injectSprite() {
    var symbols = Object.keys(ICONS).map(function (k) {
      return '<symbol id="i-' + k + '" viewBox="0 0 24 24" ' + ICONS[k][0] + ">" + ICONS[k][1] + "</symbol>";
    }).join("");
    var wrap = document.createElement("div");
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' + symbols + "</svg>";
    document.body.insertBefore(wrap.firstChild, document.body.firstChild);
  }

  /* =========================================================
     2. Header & Navigation
     ========================================================= */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;
    var desktop = window.matchMedia("(min-width: 1025px)");

    function setOpen(open, restoreFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
      $(".site-header").classList.toggle("is-solid", open);
      if (open) {
        var first = $("a", nav);
        if (first) first.focus({ preventScroll: true });
      } else if (restoreFocus) {
        toggle.focus();
      }
    }

    // モバイル時はドロワーが閉じている間フォーカス不可にする
    function syncInert() {
      var hidden = !desktop.matches && !nav.classList.contains("is-open");
      if (hidden) nav.setAttribute("inert", ""); else nav.removeAttribute("inert");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
      syncInert();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { setOpen(false, false); syncInert(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false, true); syncInert(); }
    });
    var onBp = function () { if (desktop.matches) setOpen(false, false); syncInert(); };
    if (desktop.addEventListener) desktop.addEventListener("change", onBp); else desktop.addListener(onBp);
    syncInert();
  }

  function initScrollSpy() {
    var links = $$(".site-nav__link");
    var targets = [];
    links.forEach(function(link) {
      var href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        var el = $(href);
        if (el) targets.push({ link: link, el: el });
      }
    });

    if (!("IntersectionObserver" in window)) return;

    var homeLink = null;
    links.forEach(function(l) {
      var h = l.getAttribute("href");
      if (h === "index.html" || h === "/" || h === "#") homeLink = l;
    });

    if (targets.length) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            links.forEach(function(l) { l.removeAttribute("aria-current"); });
            var target = targets.filter(function(t) { return t.el === entry.target; })[0];
            if (target) {
              target.link.setAttribute("aria-current", "page");
            }
          }
        });
      }, { rootMargin: "-50% 0px -50% 0px" });

      targets.forEach(function(t) { observer.observe(t.el); });
    }

    var hero = $(".hero");
    if (hero && homeLink) {
      var heroObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          links.forEach(function(l) { l.removeAttribute("aria-current"); });
          homeLink.setAttribute("aria-current", "page");
        }
      }, { rootMargin: "-10% 0px -90% 0px" });
      heroObserver.observe(hero);
    }
  }


  /* =========================================================
     4. UI helpers
     ========================================================= */
  function initBackToTop() {
    var btn = $(".back-to-top");
    if (!btn) return;
    var onScroll = function () { btn.classList.toggle("is-visible", window.scrollY > 600); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  var toastTimer;
  function toast(message) {
    var el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = icon("check", "icon--stroke") + "<span>" + esc(message) + "</span>";
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;
      var text = btn.getAttribute("data-copy");
      copyText(text).then(function () { toast("「" + text + "」をコピーしました"); },
        function () { toast("コピーできませんでした"); });
    });
  }

  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* =========================================================
     5. Video: modal / lite embed / tabs
     ========================================================= */
  var videoModal;
  function getVideoModal() {
    if (videoModal) return videoModal;
    videoModal = document.createElement("dialog");
    videoModal.className = "modal";
    videoModal.setAttribute("aria-labelledby", "video-modal-title");
    videoModal.innerHTML =
      '<div class="modal__header">' +
        '<p class="modal__title" id="video-modal-title"></p>' +
        '<button type="button" class="icon-btn" data-close aria-label="閉じる">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="modal__body"><div class="embed"></div></div>' +
      '<div class="modal__footer"><a class="btn btn--youtube btn--sm" target="_blank" rel="noopener" data-yt-link>' +
        icon("youtube") + "YouTubeで見る</a></div>";
    document.body.appendChild(videoModal);

    var close = function () { videoModal.close(); };
    $("[data-close]", videoModal).addEventListener("click", close);
    // 背景（::backdrop）クリックで閉じる
    videoModal.addEventListener("click", function (e) { if (e.target === videoModal) close(); });
    videoModal.addEventListener("close", function () {
      $(".embed", videoModal).innerHTML = ""; // 再生停止
      document.body.classList.remove("is-locked");
    });
    return videoModal;
  }

  function openVideo(id, title) {
    var url = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
    var modal = getVideoModal();
    if (typeof modal.showModal !== "function") { window.open(url, "_blank", "noopener"); return; }
    $(".modal__title", modal).textContent = title || "";
    $("[data-yt-link]", modal).href = url;
    var iframe = document.createElement("iframe");
    iframe.src = embedSrc(id);
    iframe.title = esc(title || "YouTube 動画");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.onload = function() {
      var win = this.contentWindow;
      var msg = JSON.stringify({event:'command',func:'setVolume',args:[30]});
      win.postMessage(msg, '*');
      setTimeout(function() { win.postMessage(msg, '*'); }, 500);
    };
    $(".embed", modal).appendChild(iframe);
    modal.showModal();
    document.body.classList.add("is-locked");
  }

  function initVideoTriggers() {
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-video-modal]");
      if (trigger) {
        e.preventDefault();
        openVideo(trigger.getAttribute("data-video-modal"), trigger.getAttribute("data-video-title"));
        return;
      }
      var lite = e.target.closest(".embed-lite[data-video-id]");
      if (lite) {
        var id = lite.getAttribute("data-video-id");
        var title = lite.getAttribute("data-video-title") || "YouTube 動画";
        var iframe = document.createElement("iframe");
        iframe.src = embedSrc(id);
        iframe.title = title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.onload = function() {
          var win = this.contentWindow;
          var msgVol = JSON.stringify({event:'command',func:'setVolume',args:[30]});
          var msgPlay = JSON.stringify({event:'command',func:'playVideo'});
          win.postMessage(msgVol, '*');
          win.postMessage(msgPlay, '*');
          setTimeout(function() { 
            win.postMessage(msgVol, '*'); 
            win.postMessage(msgPlay, '*');
          }, 500);
        };
        var box = document.createElement("div");
        box.className = "embed";
        box.appendChild(iframe);
        lite.replaceWith(box);
        iframe.focus();
      }
    });
  }

  function videoCardHTML(v) {
    return '<button type="button" class="card card--interactive video-card reveal" data-video-modal="' + esc(v.id) +
      '" data-video-title="' + esc(v.title) + '">' +
      '<span class="card__media">' +
        '<img src="' + thumb(v.id) + '" alt="" loading="lazy" decoding="async" width="480" height="360">' +
        '<span class="play-icon">' + icon("play") + "</span>" +
        (v.label ? '<span class="badge badge--accent">' + esc(v.label) + "</span>" : "") +
      "</span>" +
      '<span class="card__body"><span class="card__title">' + esc(v.title) + "</span>" +
      '<span class="card__meta"><span class="badge badge--neutral">' + icon("youtube") + "YouTube</span></span></span>" +
      "</button>";
  }

  function initVideoTabs() {
    var host = $("#video-tabs");
    if (!host || !DATA.videos) return;
    var cats = [{ key: "all", label: "すべて" }].concat(
      (DATA.videoCategories || []).filter(function (c) {
        return DATA.videos.some(function (v) { return v.category === c.key; });
      })
    );

    var tabs = cats.map(function (c, i) {
      var count = c.key === "all" ? DATA.videos.length
        : DATA.videos.filter(function (v) { return v.category === c.key; }).length;
      return '<button type="button" role="tab" class="tabs__tab" id="tab-' + c.key + '" aria-controls="panel-' + c.key +
        '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(c.label) +
        '<span class="tabs__count">' + count + "</span></button>";
    }).join("");

    var perPage = window.innerWidth >= 1025 ? 6 : 3;

    var panels = cats.map(function (c, i) {
      var list = c.key === "all" ? DATA.videos : DATA.videos.filter(function (v) { return v.category === c.key; });
      if (!list.length) {
        return '<div role="tabpanel" class="tabs__panel" id="panel-' + c.key + '" aria-labelledby="tab-' + c.key + '"' +
          (i === 0 ? "" : " hidden") + '><p class="empty-state">このカテゴリの動画は準備中です。</p></div>';
      }

      var cardsHtml = list.map(function (v, j) {
        var html = videoCardHTML(v);
        if (j >= perPage) html = html.replace('class="card ', 'style="display:none;" class="card is-hidden ');
        return html;
      }).join("");

      var body = '<div class="grid grid--3">' + cardsHtml + "</div>";
      if (list.length > perPage) {
        body += '<div class="load-more-wrap" style="text-align:center; margin-top: var(--space-8);"><button type="button" class="btn btn--outline btn--load-more">もっと見る</button></div>';
      }

      return '<div role="tabpanel" class="tabs__panel" id="panel-' + c.key + '" aria-labelledby="tab-' + c.key + '"' +
        (i === 0 ? "" : " hidden") + ">" + body + "</div>";
    }).join("");

    host.innerHTML = '<div class="tabs__list" role="tablist" aria-label="動画のジャンル">' + tabs + "</div>" + panels;

    var tabEls = $$('[role="tab"]', host);
    function select(tab) {
      tabEls.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        if (on) $$(".reveal", panel).forEach(function (el) { el.classList.add("is-visible"); });
      });
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
    tabEls.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabEls[(i + 1) % tabEls.length];
        if (e.key === "ArrowLeft") next = tabEls[(i - 1 + tabEls.length) % tabEls.length];
        if (e.key === "Home") next = tabEls[0];
        if (e.key === "End") next = tabEls[tabEls.length - 1];
        if (next) { e.preventDefault(); next.focus(); select(next); }
      });
    });

    // 「もっと見る」ボタンの処理
    var loadMoreBtns = $$(".btn--load-more", host);
    loadMoreBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var perPage = window.innerWidth >= 1025 ? 6 : 3;
        var panel = btn.closest(".tabs__panel");
        var hiddenCards = $$(".is-hidden", panel);
        var toShow = Array.prototype.slice.call(hiddenCards, 0, perPage);
        
        toShow.forEach(function(card, idx) {
          card.style.display = ""; // remove inline display:none
          card.classList.remove("is-hidden");
          // 少し遅らせてアニメーションクラスを付与
          setTimeout(function() {
            card.classList.add("is-visible");
          }, idx * 50);
        });
        
        if (hiddenCards.length <= perPage) {
          btn.parentElement.remove(); // 残りがなければボタンを削除
        }
      });
    });
  }

  /* =========================================================
     6. Schedule
     ========================================================= */
  function initSchedule() {
    var host = $("#schedule");
    if (!host || !DATA.schedule) return;

    if (DATA.schedule.useNotice && DATA.schedule.noticeHtml) {
      host.innerHTML = '<li style="grid-column: 1 / -1; padding: var(--space-8); text-align: center; background: var(--color-surface); border-radius: var(--radius-lg);">' + DATA.schedule.noticeHtml + '</li>';
      var note = $("#schedule-note");
      if (note) note.hidden = true;
      return;
    }

    var keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    var jp = { mon: "月", tue: "火", wed: "水", thu: "木", fri: "金", sat: "土", sun: "日" };
    var typeLabel = { live: "配信", video: "動画", collab: "コラボ" };

    var today = new Date();
    var monday;
    if (DATA.schedule.startDate) {
      var d = new Date(DATA.schedule.startDate);
      var offset = (d.getDay() + 6) % 7; // 月曜始まり
      monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
    } else {
      var offset = (today.getDay() + 6) % 7;
      monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    }

    host.innerHTML = keys.map(function (k, i) {
      var d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      var events = DATA.schedule.weekly[k] || [];
      var isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      var body = events.length
        ? events.map(function (ev) {
            return '<div class="schedule__event" data-type="' + esc(ev.type || "live") + '">' +
              '<span class="schedule__time">' + esc(ev.time) + " ・ " + esc(typeLabel[ev.type] || "配信") + "</span>" +
              '<span class="schedule__title">' + esc(ev.title) + "</span></div>";
          }).join("")
        : '<span class="schedule__rest">おやすみ</span>';
      return '<li class="schedule__day' + (isToday ? " is-today" : "") + (events.length ? "" : " is-off") + '"' +
        (isToday ? ' aria-current="date"' : "") + ">" +
        '<div class="schedule__date"><span class="schedule__dow">' + jp[k] + "</span>" +
          '<span class="schedule__num">' + (d.getMonth() + 1) + "/" + d.getDate() + "</span></div>" +
        '<div class="schedule__events">' + body + "</div></li>";
    }).join("");

    var note = $("#schedule-note");
    if (note && DATA.schedule.note) note.textContent = DATA.schedule.note;
  }

  /* =========================================================
     7. Lightbox
     ========================================================= */
  function initLightbox() {
    var triggers = $$("[data-lightbox]");
    if (!triggers.length) return;
    var dlg = document.createElement("dialog");
    dlg.className = "modal";
    dlg.setAttribute("aria-labelledby", "lightbox-title");
    dlg.innerHTML =
      '<div class="modal__header"><p class="modal__title" id="lightbox-title"></p>' +
      '<button type="button" class="icon-btn" data-close aria-label="閉じる">' + icon("close") + "</button></div>" +
      '<div class="modal__body"><img class="lightbox-img" alt=""></div>';
    document.body.appendChild(dlg);
    var close = function () { dlg.close(); };
    $("[data-close]", dlg).addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener("close", function () { document.body.classList.remove("is-locked"); });

    triggers.forEach(function (t) {
      t.addEventListener("click", function () {
        if (typeof dlg.showModal !== "function") return;
        var img = $(".lightbox-img", dlg);
        img.src = t.getAttribute("data-lightbox");
        img.alt = t.getAttribute("data-caption") || "";
        $(".modal__title", dlg).textContent = t.getAttribute("data-caption") || "";
        dlg.showModal();
        document.body.classList.add("is-locked");
      });
    });
  }

  /* =========================================================
     8. Contact form
     ========================================================= */
  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;
    var result = $("#contact-result");
    var output = $("#contact-output");
    var mailBtn = $("#contact-mail");
    var email = form.getAttribute("data-email") || "";
    if (!email && mailBtn) mailBtn.hidden = true;

    function fieldOf(input) { return input.closest(".field"); }
    function validate(input) {
      var ok = input.checkValidity();
      var f = fieldOf(input);
      if (f) f.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    }

    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value) validate(el); });
      el.addEventListener("input", function () {
        var f = fieldOf(el);
        if (f && f.classList.contains("is-invalid")) validate(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = $$("[required]", form);
      var firstInvalid = null;
      fields.forEach(function (el) { if (!validate(el) && !firstInvalid) firstInvalid = el; });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var fd = new FormData(form);
      var text =
        "【お問い合わせ】" + (fd.get("type") || "") + "\n" +
        "お名前／団体名：" + (fd.get("name") || "") + "\n" +
        (fd.get("company") ? "会社・チャンネル：" + fd.get("company") + "\n" : "") +
        "連絡先：" + (fd.get("reply") || "") + "\n" +
        (fd.get("deadline") ? "希望時期：" + fd.get("deadline") + "\n" : "") +
        (fd.get("budget") ? "ご予算：" + fd.get("budget") + "\n" : "") +
        "\n" + (fd.get("message") || "");

      output.textContent = text;
      result.hidden = false;
      if (mailBtn && email) {
        mailBtn.href = "mailto:" + email + "?subject=" + encodeURIComponent("【お問い合わせ】" + (fd.get("type") || "")) +
          "&body=" + encodeURIComponent(text);
      }
      result.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });

    var copyBtn = $("#contact-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyText(output.textContent).then(function () {
          toast("文面をコピーしました。X の DM に貼り付けてください");
          var url = copyBtn.getAttribute("data-open");
          if (url) window.open(url, "_blank", "noopener");
        }, function () { toast("コピーできませんでした。手動で選択してください"); });
      });
    }
  }

  /* ---------- contents more ---------- */
  function initContentsMore() {
    var grid = $(".contents-grid");
    var btn = $("#btn-more-contents");
    if (!grid || !btn) return;
    var items = Array.prototype.slice.call(grid.children);
    var isExpanded = false;
    var limit = window.innerWidth <= 768 ? 3 : 4;

    function update() {
      items.forEach(function (el, i) {
        el.style.display = (isExpanded || i < limit) ? "" : "none";
      });
      btn.textContent = isExpanded ? "閉じる" : "もっと見る";
      btn.style.display = items.length <= limit ? "none" : "";
    }

    update();
    btn.addEventListener("click", function () {
      isExpanded = !isExpanded;
      update();
    });

    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var newLimit = window.innerWidth <= 768 ? 3 : 4;
        if (limit !== newLimit) {
          limit = newLimit;
          update();
        }
      }, 100);
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    injectSprite();
    initHeader();
    initNav();
    initScrollSpy();
    initBackToTop();
    initCopy();
    initYear();
    initVideoTriggers();
    initVideoTabs();
    initSchedule();
    initLightbox();
    initContactForm();
    initReveal();
    initContentsMore();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
