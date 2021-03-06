/**
 * jQuery Switchable v2.0
 * http://switchable.mrzhang.me/
 *
 * Copyright 2011 mrzhang.me
 * Licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: 2011-10-13 13:51
 */

(function (d) {
    function f(f, a, e) {
        var c = this, b = d(this);
        d.isFunction(a.beforeSwitch) && b.bind("beforeSwitch", a.beforeSwitch);
        d.isFunction(a.onSwitch) && b.bind("onSwitch", a.onSwitch);
        d.extend(c, {_initPlugins: function () {
            for (var a = d.switchable.Plugins, e = a.length, b = 0; b < e; b++)a[b].init && a[b].init(c)
        }, _init: function () {
            c.container = f;
            c.config = a;
            c.panels = a.panels && (a.panels.jquery || d.type(a.panels) === "string") ? f.find(a.panels) : f.children();
            c.length = Math.ceil(c.panels.length / a.steps);
            if (c.length < 1)window.console && console.warn("No panel in " + e); else if (c.index = a.initIndex === null ? void 0 : a.initIndex + (a.initIndex < 0 ? c.length : 0), a.effect === "none" && c.panels.slice(c.index * a.steps, (c.index + 1) * a.steps).show(), a.triggers) {
                var b, h, j;
                if (a.triggers.jquery)c.triggers = a.triggers.slice(0, c.length); else {
                    b = d.type(a.triggers) === "string";
                    var l = [];
                    for (h = 1; h <= c.length; h++)l.push("<li>" + (b ? a.triggers : h) + "</li>");
                    c.triggers = d("<ul/>", {"class": a.triggersWrapCls, html: l.join("")})[a.putTriggers](f).find("li")
                }
                c.triggers.eq(c.index).addClass(a.currentTriggerCls);
                for (h = 0; h < c.length; h++)b = c.triggers.eq(h), b.click({index: h}, function (a) {
                    j = a.data.index;
                    c._triggerIsValid(j) && (c._cancelDelayTimer(), c.switchTo(j))
                }), a.triggerType === "mouse" && b.mouseenter({index: h},function (b) {
                    j = b.data.index;
                    if (c._triggerIsValid(j))c._delayTimer = setTimeout(function () {
                        c.switchTo(j)
                    }, a.delay * 1E3)
                }).mouseleave(function () {
                    c._cancelDelayTimer()
                })
            }
        }, _triggerIsValid: function (a) {
            return c.index !== a
        }, _cancelDelayTimer: function () {
            if (c._delayTimer)clearTimeout(c._delayTimer), c._delayTimer = void 0
        }, _switchTrigger: function (b, e) {
            c.triggers.eq(b).removeClass(a.currentTriggerCls).end().eq(e).addClass(a.currentTriggerCls)
        }, _switchPanels: function (b, e, f) {
            d.switchable.Effects[a.effect].call(c, b, e, f)
        }, willTo: function (b) {
            return b ? c.index > 0 ? c.index - 1 : a.loop ? c.length - 1 : !1 : c.index < c.length - 1 ? c.index + 1 : a.loop ? 0 : !1
        }, switchTo: function (e, f) {
            var j = d.Event("beforeSwitch");
            b.trigger(j, [e]);
            if (!j.isDefaultPrevented())return c._switchPanels(c.index, e, f), a.triggers && c._switchTrigger(c.index, e), c.index = e, j.type = "onSwitch", b.trigger(j, [e]), c
        }});
        c._init();
        c._initPlugins()
    }

    d.switchable = {Config: {triggers: !0, putTriggers: "insertAfter", triggersWrapCls: "switchable-triggers", currentTriggerCls: "current", panels: null, steps: 1, triggerType: "mouse", delay: 0.1, initIndex: 0, effect: "none", easing: "ease", duration: 0.5, loop: !0, beforeSwitch: null, onSwitch: null, api: !1}, Effects: {none: function (d, a) {
        var e = this.config;
        this.panels.slice(d * e.steps, (d + 1) * e.steps).hide().end().slice(a * e.steps, (a + 1) * e.steps).show()
    }}, Plugins: []};
    d.fn.switchable = function (g) {
        var a = d(this), e = a.length, c = a.selector, b = [], i, g = d.extend({}, d.switchable.Config, g);
        g.effect = g.effect.toLowerCase();
        for (i = 0; i < e; i++)b[i] = new f(a.eq(i), g, c + "[" + i + "]");
        return g.api ? b[0] : a
    }
})(jQuery);
(function (d) {
    function f() {
        var d = document.documentElement, a = ["Webkit", "Moz"], e = "transition", c = "", b;
        if (d.style[e] !== void 0)c = e; else for (b = 0; b < 2; b++)if (d.style[e = a[b] + "Transition"] !== void 0) {
            c = e;
            break
        }
        return c
    }

    d.switchable.Anim = function (g, a, e, c, b, i) {
        var h = this, j = {}, l, k;
        if (d.switchable.Transition === void 0)d.switchable.Transition = f();
        l = d.switchable.Transition;
        d.extend(h, {isAnimated: !1, run: function () {
            if (!h.isAnimated) {
                e *= 1E3;
                if (l)j[l + "Property"] = i || "all", j[l + "Duration"] = e + "ms", j[l + "TimingFunction"] = c, g.css(d.extend(a, j)), k = setTimeout(function () {
                    h._clearCss();
                    h._complete()
                }, e); else {
                    var b = /cubic-bezier\(([\s\d.,]+)\)/, f = c.match(b), o = d.switchable.TimingFn[c];
                    if (o || f)c = d.switchable.Easing(f ? f[1] : o.match(b)[1]);
                    g.animate(a, e, c, function () {
                        h._complete()
                    })
                }
                h.isAnimated = !0;
                return h
            }
        }, stop: function (c) {
            if (h.isAnimated)return l ? (clearTimeout(k), k = void 0) : g.stop(!1, c), h.isAnimated = !1, h
        }, _complete: function () {
            b && b()
        }, _clearCss: function () {
            j[l + "Property"] = "none";
            g.css(j)
        }})
    }
})(jQuery);
(function (d) {
    function f(a) {
        return"cubic-bezier(" + a + ")"
    }

    function g(a) {
        var c = [], b;
        for (b = 0; b <= 101; b++)c[b] = a.call(null, b / 101);
        return function (a) {
            if (a === 1)return c[101];
            a *= 101;
            var b = Math.floor(a), e = c[b];
            return e + (c[b + 1] - e) * (a - b)
        }
    }

    function a(a, c, b, d, f, j) {
        function g(a, c) {
            var b, e, d, f;
            d = a;
            for (e = 0; e < 8; e++) {
                f = ((k * d + bx) * d + cx) * d - a;
                if ((f >= 0 ? f : 0 - f) < c)return d;
                b = (3 * k * d + 2 * bx) * d + cx;
                if ((b >= 0 ? b : 0 - b) < 1.0E-6)break;
                d -= f / b
            }
            b = 0;
            e = 1;
            d = a;
            if (d < b)return b;
            if (d > e)return e;
            for (; b < e;) {
                f = ((k * d + bx) * d + cx) * d;
                if ((f - a >= 0 ? f - a : 0 - (f - a)) < c)break;
                a > f ? b = d : e = d;
                d = (e - b) * 0.5 + b
            }
            return d
        }

        var k = bx = cx = ay = by = cy = 0;
        cx = 3 * c;
        bx = 3 * (d - c) - cx;
        k = 1 - cx - bx;
        cy = 3 * b;
        by = 3 * (f - b) - cy;
        ay = 1 - cy - by;
        return function (a, b) {
            var c = g(a, b);
            return((ay * c + by) * c + cy) * c
        }(a, 1 / (200 * j))
    }

    d.switchable.TimingFn = {ease: f(".25, .1, .25, 1"), linear: f("0, 0, 1, 1"), "ease-in": f(".42, 0, 1, 1"), "ease-out": f("0, 0, .58, 1"), "ease-in-out": f(".42, 0, .58, 1")};
    d.switchable.Easing = function (e) {
        var c, b, i = 0, e = e.split(",");
        for (b = e.length; i < b; i++)e[i] = parseFloat(e[i]);
        if (b !== 4)window.console && console.warn(f(e.join(", ")) + " missing argument."); else if (c = "cubic-bezier-" + e.join("-"), !d.easing[c]) {
            var h = g(function (b) {
                return a(b, e[0], e[1], e[2], e[3], 5)
            });
            d.easing[c] = function (b) {
                return h.call(null, b)
            }
        }
        return c
    }
})(jQuery);
(function (d) {
    d.extend(d.switchable.Config, {autoplay: !1, interval: 3, pauseOnHover: !0});
    d.switchable.Plugins.push({name: "autoplay", init: function (f) {
        function g() {
            h = f.willTo(f.isBackward);
            h === !1 ? f._cancelTimers() : f.switchTo(h, f.isBackward ? "backward" : "forward")
        }

        function a() {
            i = setInterval(function () {
                g()
            }, (e.interval + e.duration) * 1E3)
        }

        var e = f.config, c = !1, b, i, h;
        e.autoplay && !(f.length <= 1) && (e.pauseOnHover && f.panels.add(f.triggers).hover(function () {
            f._pause()
        }, function () {
            c || f._play()
        }), d.extend(f, {_play: function () {
            f._cancelTimers();
            f.paused = !1;
            b = setTimeout(function () {
                g();
                a()
            }, e.interval * 1E3)
        }, _pause: function () {
            f._cancelTimers();
            f.paused = !0
        }, _cancelTimers: function () {
            b && (clearTimeout(b), b = void 0);
            i && (clearInterval(i), i = void 0)
        }, play: function () {
            f._play();
            c = !1;
            return f
        }, pause: function () {
            f._pause();
            c = !0;
            return f
        }}), f._play())
    }})
})(jQuery);
(function (d) {
    d.extend(d.switchable.Config, {prev: null, next: null});
    d.switchable.Plugins.push({name: "carousel", init: function (f) {
        var g = f.config, a = ["backward", "forward"], e = ["prev", "next"], c, b, i = 0;
        if (g.prev || g.next)for (; i < 2; i++)if (c = e[i], b = g[c])c = f[c + "Btn"] = b.jquery ? b : d(b), c.click({direction: a[i]}, function (b) {
            b.preventDefault();
            if (!f.anim) {
                var b = b.data.direction, c = f.willTo(b === a[0]);
                c !== !1 && f.switchTo(c, b)
            }
        })
    }})
})(jQuery);
(function (d) {
    d.switchable.Effects.fade = function (f, g) {
        var a = this, e = a.config, c = a.panels, b = c.eq(f), i = c.eq(g);
        a.anim && (a.anim.stop(), c.eq(a.anim.to).css({zIndex: a.length}).end().eq(a.anim.from).css({opacity: 0, zIndex: 1}));
        i.css({opacity: 1});
        a.anim = (new d.switchable.Anim(b, {opacity: 0}, e.duration, e.easing, function () {
            i.css({zIndex: a.length});
            b.css({zIndex: 1});
            a.anim = void 0
        }, "opacity")).run();
        a.anim.from = f;
        a.anim.to = g
    };
    d.switchable.Plugins.push({name: "fade effect", init: function (d) {
        var g = d.config, a = d.panels.eq(d.index);
        g.effect !== "fade" || g.steps !== 1 || (d.panels.not(a).css({opacity: 0, zIndex: 1}), a.css({opacity: 1, zIndex: d.length}))
    }})
})(jQuery);
(function (d) {
    var f = ["scrollleft", "scrollright", "scrollup", "scrolldown"];
    d.extend(d.switchable.Config, {end2end: !1, groupSize: [], visible: null, clonedCls: "switchable-cloned"});
    for (var g = 0; g < 4; g++)d.switchable.Effects[f[g]] = function (a, e, c) {
        var b = this, f = b.config, h = b.length - 1, j = c === "backward", g = f.end2end && (j && a === 0 && e === h || c === "forward" && a === h && e === 0), a = {};
        a[b.isHoriz ? "left" : "top"] = g ? b._adjustPosition(j) : -b.groupSize[b.isHoriz ? 0 : 1] * e;
        b.anim && b.anim.stop();
        b.anim = (new d.switchable.Anim(b.panels.parent(), a, f.duration, f.easing, function () {
            g && b._resetPosition(j);
            b.anim = void 0
        })).run()
    };
    d.switchable.Plugins.push({name: "scroll effect", init: function (a) {
        var e = a.config, c = e.steps, b = a.panels, i = b.parent(), h = d.inArray(e.effect, f), g = h === 0 || h === 1, l = b.eq(0).outerWidth(!0), k = b.eq(0).outerHeight(!0), n = g ? 0 : 1, q = a.length - 1, o = g ? "left" : "top", m = {};
        if (h !== -1) {
            a.groupSize = [e.groupSize[0] || l * c, e.groupSize[1] || k * c];
            if (e.end2end) {
                var r = b.length, s = !g && e.groupSize[0] ? a.groupSize[n] * a.length : (g ? l : k) * r, t = r - q * c, u = !g && e.groupSize[0] ? a.groupSize[n] : (g ? l : k) * t, p;
                e.loop = !0;
                e.visible && e.visible < r && e.visible > t && b.slice(0, e.visible).clone(!0).addClass(e.clonedCls).appendTo(i).click(function (a) {
                    a.preventDefault();
                    b.eq(d(this).index() - r).click()
                });
                d.extend(a, {_adjustPosition: function (a) {
                    p = a ? q : 0;
                    m.position = "relative";
                    m[o] = (a ? -1 : 1) * s;
                    b.slice(p * c, (p + 1) * c).css(m);
                    return a ? u : -s
                }, _resetPosition: function (e) {
                    p = e ? q : 0;
                    m.position = "";
                    m[o] = "";
                    b.slice(p * c, (p + 1) * c).css(m);
                    m.position = void 0;
                    m[o] = e ? -a.groupSize[n] * q : 0;
                    i.css(m)
                }})
            }
            a.container.css("position") == "static" && a.container.css("position", "relative");
            m.position = "absolute";
            m[o] = -a.groupSize[n] * a.index;
            i.css(m).css("width", g ? 2 * a.groupSize[n] * a.length : e.groupSize[0] ? e.groupSize[0] : void 0);
            a.isHoriz = g;
            a.isBackward = h === 1 || h === 3
        }
    }})
})(jQuery);
(function (d) {
    var f = ["accordion", "horizaccordion"], g = [
        ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"],
        ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]
    ];
    d.extend(d.switchable.Config, {multiple: !1, customProps: {}});
    for (var a = 0; a < 2; a++)d.switchable.Effects[f[a]] = function (a, c) {
        var b = this, f = b.config, g = a !== c;
        b.anim && b.anim.stop(g);
        b.anim = (new d.switchable.Anim(b.panels.eq(c), b.triggers.eq(c).hasClass(f.currentTriggerCls) ? b.collapseProps : b.expandProps[c], f.duration, f.easing, function () {
            b.anim = void 0
        })).run();
        if (!f.multiple && a !== void 0 && g)b.anim2 && b.anim2.stop(g), b.anim2 = (new d.switchable.Anim(b.panels.eq(a), b.collapseProps, f.duration, f.easing, function () {
            b.anim2 = void 0
        })).run()
    };
    d.switchable.Plugins.push({name: "accordion effect", init: function (a) {
        var c = a.config, b = d.inArray(c.effect, f);
        if (!(b === -1 || c.steps !== 1)) {
            window.console && console.info("Remember to set the border-width for the accordion's panels, even without border.");
            d.extend(a, {_triggerIsValid: function () {
                return!0
            }, _switchTrigger: function (b, d) {
                var f = a.triggers, g = c.currentTriggerCls;
                f.eq(d).toggleClass(g);
                !c.multiple && b !== void 0 && b !== d && f.eq(b).removeClass(g)
            }});
            a.expandProps = [];
            a.collapseProps = {};
            var i = g[b].length, h = {}, j, l, k;
            for (k = 0; k < i; k++)a.collapseProps[g[b][k]] = 0;
            d.extend(a.collapseProps, c.customProps);
            for (k = 0; k < a.length; k++) {
                j = a.panels.eq(k);
                for (var n = 0; n < i; n++)l = g[b][n], h[l] = j.css(l);
                a.expandProps.push(d.extend({}, h));
                j.css(d.extend({overflow: "hidden"}, k === a.index ? h : a.collapseProps))
            }
        }
    }})
})(jQuery);