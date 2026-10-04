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
  style.textContent = "#__framer-badge-container,.__framer-badge{display:none!important}";
  document.head.appendChild(style);

  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === "childList") {
        for (var k = 0; k < m.addedNodes.length; k++) fixTree(m.addedNodes[k]);
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

  fixTree(document.documentElement);
  fixTitle();
})();
