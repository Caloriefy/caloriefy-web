(function () {
  var TEXT = [
    ["Calorie App", "Caloriefy AI"],
    ["hello@calorie.framer.website", "hello@caloriefy.ai"],
    ["privacy@calories.framer.website", "privacy@caloriefy.ai"],
  ];

  var COLORS = {
    ff8000: "529344",
    ff8001: "529344",
    ffb74a: "ff9800",
    ff4040: "f61f34",
    e62929: "f61f34",
    "4a80ff": "00bbff",
    "0099ff": "00bbff",
    "2072f3": "00bbff",
    "18bffb": "00bbff",
    "52a7f8": "00bbff",
    f6f6f6: "f0f0f0",
    f5f5f5: "f0f0f0",
    f9f9f9: "f0f0f0",
    "8c8c8c": "909090",
    "999999": "909090",
  };

  var TEXT_ATTRS = ["alt", "title", "aria-label", "content", "href"];
  var COLOR_ATTRS = ["style", "fill", "stroke", "stop-color", "color"];
  var ALL_ATTRS = TEXT_ATTRS.concat(COLOR_ATTRS);

  function hex2(n) {
    return ("0" + Number(n).toString(16)).slice(-2);
  }

  function recolor(value) {
    if (!value) return value;
    return value
      .replace(/rgb(a?)\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g, function (m, a, r, g, b) {
        var to = COLORS[hex2(r) + hex2(g) + hex2(b)];
        if (!to) return m;
        return "rgb" + a + "(" + parseInt(to.slice(0, 2), 16) + ", " + parseInt(to.slice(2, 4), 16) + ", " + parseInt(to.slice(4, 6), 16);
      })
      .replace(/#([0-9a-fA-F]{6})(?=(?:[0-9a-fA-F]{2})?\b)/g, function (m, h) {
        var to = COLORS[h.toLowerCase()];
        return to ? "#" + to : m;
      });
  }

  function retext(value) {
    for (var i = 0; i < TEXT.length; i++) {
      if (value.indexOf(TEXT[i][0]) !== -1) value = value.split(TEXT[i][0]).join(TEXT[i][1]);
    }
    return value;
  }

  function isFramerLink(el) {
    var href = el.getAttribute("href");
    return href && /^https?:\/\/([a-z0-9-]+\.)*framer\.(com|website)(\/|$)/i.test(href);
  }

  function fixOne(node) {
    if (node.nodeType === 3) {
      var parent = node.parentNode;
      if (!parent || parent.nodeName === "SCRIPT") return;
      if (parent.nodeName === "STYLE" && parent.getAttribute("data-caloriefy-keep") === "1") return;
      var v = node.nodeValue;
      var next = parent.nodeName === "STYLE" ? recolor(v) : retext(v);
      if (next !== v) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.nodeName === "A" && isFramerLink(node)) node.removeAttribute("href");
    for (var i = 0; i < TEXT_ATTRS.length; i++) {
      var t = node.getAttribute(TEXT_ATTRS[i]);
      if (t) {
        var nt = retext(t);
        if (nt !== t) node.setAttribute(TEXT_ATTRS[i], nt);
      }
    }
    for (var j = 0; j < COLOR_ATTRS.length; j++) {
      var c = node.getAttribute(COLOR_ATTRS[j]);
      if (c) {
        var nc = recolor(c);
        if (nc !== c) node.setAttribute(COLOR_ATTRS[j], nc);
      }
    }
  }

  function fixTree(root) {
    fixOne(root);
    if (root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var pending = [];
    while (walker.nextNode()) pending.push(walker.currentNode);
    for (var i = 0; i < pending.length; i++) fixOne(pending[i]);
  }

  function fixTitle() {
    var t = retext(document.title);
    if (t !== document.title) document.title = t;
  }

  var insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule, index) {
    return insertRule.call(this, recolor(rule), index);
  };

  var style = document.createElement("style");
  style.setAttribute("data-caloriefy-keep", "1");
  style.textContent = [
    "#__framer-badge-container,.__framer-badge{display:none!important}",
    "html,body{background:#fff!important;background-color:#fff!important}",
    "#main{position:relative;z-index:1;background:transparent!important;background-color:transparent!important}",
    '[data-layout-template="true"]{background:transparent!important;background-color:transparent!important}',
    "html,body{",
    "--token-481d7cd9-a3a3-42ce-a0a1-855606c10e7c:transparent!important;",
    "--token-4c17e1a2-8a4b-4627-91b7-4536ebd9381c:transparent!important;",
    "--token-e15df9b1-4e10-42be-976b-4460742925bf:transparent!important;",
    "--token-6a196a88-2441-45b9-94be-a3ca94f9b3e6:transparent!important;",
    "--token-af5420dc-18a7-4bf0-9a59-32db5770f69b:transparent!important;",
    "--token-da3858f5-be49-44fb-82de-2711692c5d60:transparent!important;",
    "}",
    '.framer-mi5Sd{background-color:#fff!important}',
    '.framer-mi5Sd[data-framer-name="Free"],.framer-mi5Sd[data-framer-name="Gold"]{background-color:#f0f0f0!important}',
    '.framer-mi5Sd[data-framer-name="Pro"]{background-color:#fff!important}',
    '.framer-1g7fdzo.caloriefy-free-name{background-color:#f6f6f6!important}',
    "@property --neon-angle{syntax:'<angle>';initial-value:0deg;inherits:false}",
    "@keyframes caloriefy-neon-spin{to{--neon-angle:360deg}}",
    "@keyframes caloriefy-neon-glow{0%,100%{filter:drop-shadow(0 0 3px #00bbff) drop-shadow(0 0 8px #ff9800)}50%{filter:drop-shadow(0 0 6px #f61f34) drop-shadow(0 0 16px #529344)}}",
    "@keyframes caloriefy-neon-shadow{0%{box-shadow:0 0 10px 0 rgba(82,147,68,.45)}25%{box-shadow:0 0 14px 1px rgba(255,152,0,.4)}50%{box-shadow:0 0 10px 0 rgba(246,31,52,.4)}75%{box-shadow:0 0 14px 1px rgba(0,187,255,.4)}100%{box-shadow:0 0 10px 0 rgba(82,147,68,.45)}}",
    ".caloriefy-neon{position:relative;animation:caloriefy-neon-shadow 6s linear infinite}",
    ".caloriefy-neon::after{content:'';position:absolute;inset:0;padding:2px;border-radius:inherit;pointer-events:none;",
    "background:conic-gradient(from var(--neon-angle),#529344,#ff9800,#f61f34,#00bbff,#529344);",
    "-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;",
    "mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);",
    "animation:caloriefy-neon-spin 2.5s linear infinite,caloriefy-neon-glow 2s ease-in-out infinite}",
  ].join("");
  document.head.appendChild(style);

  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === "childList") {
        for (var k = 0; k < m.addedNodes.length; k++) {
          fixTree(m.addedNodes[k]);
          paintOpaqueCards(m.addedNodes[k]);
          markFreeNames(m.addedNodes[k]);
          markDownloadButtons(m.addedNodes[k]);
        }
      } else {
        fixOne(m.target);
      }
    }
    fixTitle();
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ALL_ATTRS,
  });

  function paintOpaqueCards(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll ? scope.querySelectorAll("#main *") : [];
    if (root && root.nodeType === 1 && root.id !== "main") {
      var list = [root];
      if (root.querySelectorAll) {
        var extra = root.querySelectorAll("*");
        for (var e = 0; e < extra.length; e++) list.push(extra[e]);
      }
      nodes = list;
    }
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.nodeType !== 1) continue;
      var s = window.getComputedStyle(el);
      if (s.boxShadow === "none") continue;
      var r = el.getBoundingClientRect();
      if (r.width < 160 || r.height < 80 || r.width > window.innerWidth * 0.72) continue;
      if (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") continue;
      var name = el.getAttribute("data-framer-name") || "";
      var gray = name === "Free" || name === "Gold";
      el.style.setProperty("background-color", gray ? "#f0f0f0" : "#ffffff", "important");
    }
  }

  function markFreeNames(root) {
    var list = [];
    if (root && root.nodeType === 1 && root.matches && root.matches('.framer-1g7fdzo[data-framer-name="Name"]')) list.push(root);
    var scope = root && root.querySelectorAll ? root : document;
    if (scope.querySelectorAll) {
      var found = scope.querySelectorAll('.framer-1g7fdzo[data-framer-name="Name"]');
      for (var i = 0; i < found.length; i++) list.push(found[i]);
    }
    for (var j = 0; j < list.length; j++) {
      var el = list[j];
      if ((el.textContent || "").replace(/\s+/g, " ").trim() === "Free") el.classList.add("caloriefy-free-name");
    }
  }

  function markDownloadButtons(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var links = scope.querySelectorAll ? scope.querySelectorAll("a[data-framer-name]") : [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var c = a.firstElementChild;
      if (!c || c.classList.contains("caloriefy-neon")) continue;
      if (/^Download for (iPhone|Android)$/.test((a.textContent || "").trim())) c.classList.add("caloriefy-neon");
    }
  }

  function afterPaint() {
    markDownloadButtons(document);
    paintOpaqueCards(document);
    markFreeNames(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", afterPaint);
  } else {
    afterPaint();
  }
  window.addEventListener("load", afterPaint);

  fixTree(document.documentElement);
  fixTitle();
})();
