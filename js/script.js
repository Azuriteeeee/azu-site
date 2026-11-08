/* ==========================================================================
   Azurite site script（依存ライブラリなし / Vanilla JS）
   --------------------------------------------------------------------------
   1. Icons      : SVG アイコンスプライトの注入（全ページ共通・file:// でも動作）
   2. Header     : スクロール時のガラス背景 / ハンバーガーメニュー
   3. UI         : ページトップ / スクロール表示アニメーション
   4. Video      : 動画モーダル / 遅延埋め込み / ジャンル別タブ
   5. Schedule   : 週間配信スケジュール
   6. Lightbox   : 画像拡大表示
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
    play: [F, '<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z"/>'],
    "arrow-up": [S, '<path d="m5 12 7-7 7 7M12 19V5"/>'],
    "arrow-right": [S, '<path d="M5 12h14M12 5l7 7-7 7"/>'],
    check: [S, '<path d="M20 6 9 17l-5-5"/>'],
    users: [S, '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'],
    eye: [S, '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'],
    mail: [S, '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>'],
    youtube: [F, '<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>'],
    x: [F, '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/>']
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
        '<img src="' + thumb(v.id) + '" alt="' + esc(v.title) + ' サムネイル" loading="lazy" decoding="async" width="480" height="360">' +
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
        if (j >= perPage) html = html.replace('class="card ', 'class="card is-hidden ');
        return html;
      }).join("");

      var body = '<div class="grid grid--3">' + cardsHtml + "</div>";
      if (list.length > perPage) {
        body += '<div class="load-more-wrap"><button type="button" class="btn btn--ghost btn--load-more">もっと見る</button></div>';
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
      host.innerHTML = '<li class="schedule__notice">' + DATA.schedule.noticeHtml + '</li>';
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

  /* ---------- boot ---------- */
  function boot() {
    injectSprite();
    initHeader();
    initNav();
    initScrollSpy();
    initBackToTop();
    initYear();
    initVideoTriggers();
    initVideoTabs();
    initSchedule();
    initLightbox();
    initReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
