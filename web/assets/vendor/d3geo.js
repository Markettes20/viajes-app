var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __yieldStar = (value) => {
  var obj = value[__knownSymbol("asyncIterator")], isAwait = false, method, it = {};
  if (obj == null) {
    obj = value[__knownSymbol("iterator")]();
    method = (k) => it[k] = (x) => obj[k](x);
  } else {
    obj = obj.call(value);
    method = (k) => it[k] = (v) => {
      if (isAwait) {
        isAwait = false;
        if (k === "throw") throw v;
        return v;
      }
      isAwait = true;
      return {
        done: false,
        value: new __await(new Promise((resolve) => {
          var x = obj[k](v);
          if (!(x instanceof Object)) __typeError("Object expected");
          resolve(x);
        }), 1)
      };
    };
  }
  return it[__knownSymbol("iterator")] = () => it, method("next"), "throw" in obj ? method("throw") : it.throw = (x) => {
    throw x;
  }, "return" in obj && method("return"), it;
};
var d3 = (() => {
  var sn = Object.defineProperty;
  var Ur = Object.getOwnPropertyDescriptor;
  var Jr = Object.getOwnPropertyNames;
  var Kr = Object.prototype.hasOwnProperty;
  var Qr = (t, n) => {
    for (var e in n) sn(t, e, { get: n[e], enumerable: true });
  }, Vr = (t, n, e, r) => {
    if (n && typeof n == "object" || typeof n == "function") for (let o of Jr(n)) !Kr.call(t, o) && o !== e && sn(t, o, { get: () => n[o], enumerable: !(r = Ur(n, o)) || r.enumerable });
    return t;
  };
  var br = (t) => Vr(sn({}, "__esModule", { value: true }), t);
  var De = {};
  Qr(De, { feature: () => bn, geoCentroid: () => En, geoDistance: () => qn, geoGraticule10: () => zn, geoInterpolate: () => In, geoOrthographic: () => Qn, geoPath: () => Zn });
  var Y = class {
    constructor() {
      this._partials = new Float64Array(32), this._n = 0;
    }
    add(n) {
      let e = this._partials, r = 0;
      for (let o = 0; o < this._n && o < 32; o++) {
        let a = e[o], f = n + a, l = Math.abs(n) < Math.abs(a) ? n - (f - a) : a - (f - n);
        l && (e[r++] = l), n = f;
      }
      return e[r] = n, this._n = r + 1, this;
    }
    valueOf() {
      let n = this._partials, e = this._n, r, o, a, f = 0;
      if (e > 0) {
        for (f = n[--e]; e > 0 && (r = f, o = n[--e], f = r + o, a = o - (f - r), !a); ) ;
        e > 0 && (a < 0 && n[e - 1] < 0 || a > 0 && n[e - 1] > 0) && (o = a * 2, r = f + o, o == r - f && (f = r));
      }
      return f;
    }
  };
  function* te(t) {
    for (let n of t) yield* __yieldStar(n);
  }
  function pt(t) {
    return Array.from(te(t));
  }
  function ft(t, n, e) {
    t = +t, n = +n, e = (o = arguments.length) < 2 ? (n = t, t = 0, 1) : o < 3 ? 1 : +e;
    for (var r = -1, o = Math.max(0, Math.ceil((n - t) / e)) | 0, a = new Array(o); ++r < o; ) a[r] = t + r * e;
    return a;
  }
  var P = 1e-6, St = 1e-12, z = Math.PI, H = z / 2, pn = z / 4, W = z * 2, X = 180 / z, C = z / 180, I = Math.abs, nr = Math.atan, B = Math.atan2, w = Math.cos, wt = Math.ceil;
  var kt = Math.hypot;
  var E = Math.sin, rr = Math.sign || function(t) {
    return t > 0 ? 1 : t < 0 ? -1 : 0;
  }, D = Math.sqrt;
  function er(t) {
    return t > 1 ? 0 : t < -1 ? z : Math.acos(t);
  }
  function Z(t) {
    return t > 1 ? H : t < -1 ? -H : Math.asin(t);
  }
  function mn(t) {
    return (t = E(t / 2)) * t;
  }
  function T() {
  }
  function Xt(t, n) {
    t && ir.hasOwnProperty(t.type) && ir[t.type](t, n);
  }
  var or = { Feature: function(t, n) {
    Xt(t.geometry, n);
  }, FeatureCollection: function(t, n) {
    for (var e = t.features, r = -1, o = e.length; ++r < o; ) Xt(e[r].geometry, n);
  } }, ir = { Sphere: function(t, n) {
    n.sphere();
  }, Point: function(t, n) {
    t = t.coordinates, n.point(t[0], t[1], t[2]);
  }, MultiPoint: function(t, n) {
    for (var e = t.coordinates, r = -1, o = e.length; ++r < o; ) t = e[r], n.point(t[0], t[1], t[2]);
  }, LineString: function(t, n) {
    dn(t.coordinates, n, 0);
  }, MultiLineString: function(t, n) {
    for (var e = t.coordinates, r = -1, o = e.length; ++r < o; ) dn(e[r], n, 0);
  }, Polygon: function(t, n) {
    ar(t.coordinates, n);
  }, MultiPolygon: function(t, n) {
    for (var e = t.coordinates, r = -1, o = e.length; ++r < o; ) ar(e[r], n);
  }, GeometryCollection: function(t, n) {
    for (var e = t.geometries, r = -1, o = e.length; ++r < o; ) Xt(e[r], n);
  } };
  function dn(t, n, e) {
    var r = -1, o = t.length - e, a;
    for (n.lineStart(); ++r < o; ) a = t[r], n.point(a[0], a[1], a[2]);
    n.lineEnd();
  }
  function ar(t, n) {
    var e = -1, r = t.length;
    for (n.polygonStart(); ++e < r; ) dn(t[e], n, 1);
    n.polygonEnd();
  }
  function b(t, n) {
    t && or.hasOwnProperty(t.type) ? or[t.type](t, n) : Xt(t, n);
  }
  function Mt(t) {
    return [B(t[1], t[0]), Z(t[2])];
  }
  function rt(t) {
    var n = t[0], e = t[1], r = w(e);
    return [r * w(n), r * E(n), E(e)];
  }
  function Pt(t, n) {
    return t[0] * n[0] + t[1] * n[1] + t[2] * n[2];
  }
  function mt(t, n) {
    return [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
  }
  function Yt(t, n) {
    t[0] += n[0], t[1] += n[1], t[2] += n[2];
  }
  function Rt(t, n) {
    return [t[0] * n, t[1] * n, t[2] * n];
  }
  function At(t) {
    var n = D(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
    t[0] /= n, t[1] /= n, t[2] /= n;
  }
  var qt, Bt, Ot, Zt, Wt, Ht, jt, Ut, hn, gn, vn, lr, cr, j, U, J, tt = { sphere: T, point: xn, lineStart: fr, lineEnd: ur, polygonStart: function() {
    tt.lineStart = ee, tt.lineEnd = oe;
  }, polygonEnd: function() {
    tt.lineStart = fr, tt.lineEnd = ur;
  } };
  function xn(t, n) {
    t *= C, n *= C;
    var e = w(n);
    Ct(e * w(t), e * E(t), E(n));
  }
  function Ct(t, n, e) {
    ++qt, Ot += (t - Ot) / qt, Zt += (n - Zt) / qt, Wt += (e - Wt) / qt;
  }
  function fr() {
    tt.point = ne;
  }
  function ne(t, n) {
    t *= C, n *= C;
    var e = w(n);
    j = e * w(t), U = e * E(t), J = E(n), tt.point = re, Ct(j, U, J);
  }
  function re(t, n) {
    t *= C, n *= C;
    var e = w(n), r = e * w(t), o = e * E(t), a = E(n), f = B(D((f = U * a - J * o) * f + (f = J * r - j * a) * f + (f = j * o - U * r) * f), j * r + U * o + J * a);
    Bt += f, Ht += f * (j + (j = r)), jt += f * (U + (U = o)), Ut += f * (J + (J = a)), Ct(j, U, J);
  }
  function ur() {
    tt.point = xn;
  }
  function ee() {
    tt.point = ie;
  }
  function oe() {
    sr(lr, cr), tt.point = xn;
  }
  function ie(t, n) {
    lr = t, cr = n, t *= C, n *= C, tt.point = sr;
    var e = w(n);
    j = e * w(t), U = e * E(t), J = E(n), Ct(j, U, J);
  }
  function sr(t, n) {
    t *= C, n *= C;
    var e = w(n), r = e * w(t), o = e * E(t), a = E(n), f = U * a - J * o, l = J * r - j * a, g = j * o - U * r, d = kt(f, l, g), i = Z(d), u = d && -i / d;
    hn.add(u * f), gn.add(u * l), vn.add(u * g), Bt += i, Ht += i * (j + (j = r)), jt += i * (U + (U = o)), Ut += i * (J + (J = a)), Ct(j, U, J);
  }
  function En(t) {
    qt = Bt = Ot = Zt = Wt = Ht = jt = Ut = 0, hn = new Y(), gn = new Y(), vn = new Y(), b(t, tt);
    var n = +hn, e = +gn, r = +vn, o = kt(n, e, r);
    return o < St && (n = Ht, e = jt, r = Ut, Bt < P && (n = Ot, e = Zt, r = Wt), o = kt(n, e, r), o < St) ? [NaN, NaN] : [B(e, n) * X, Z(r / o) * X];
  }
  function zt(t, n) {
    function e(r, o) {
      return r = t(r, o), n(r[0], r[1]);
    }
    return t.invert && n.invert && (e.invert = function(r, o) {
      return r = n.invert(r, o), r && t.invert(r[0], r[1]);
    }), e;
  }
  function yn(t, n) {
    return I(t) > z && (t -= Math.round(t / W) * W), [t, n];
  }
  yn.invert = yn;
  function hr(t, n, e) {
    return (t %= W) ? n || e ? zt(mr(t), dr(n, e)) : mr(t) : n || e ? dr(n, e) : yn;
  }
  function pr(t) {
    return function(n, e) {
      return n += t, I(n) > z && (n -= Math.round(n / W) * W), [n, e];
    };
  }
  function mr(t) {
    var n = pr(t);
    return n.invert = pr(-t), n;
  }
  function dr(t, n) {
    var e = w(t), r = E(t), o = w(n), a = E(n);
    function f(l, g) {
      var d = w(g), i = w(l) * d, u = E(l) * d, c = E(g), p = c * e + i * r;
      return [B(u * o - p * a, i * e - c * r), Z(p * o + u * a)];
    }
    return f.invert = function(l, g) {
      var d = w(g), i = w(l) * d, u = E(l) * d, c = E(g), p = c * o - u * a;
      return [B(u * o + c * a, i * e + p * r), Z(p * e - i * r)];
    }, f;
  }
  function vr(t, n, e, r, o, a) {
    if (e) {
      var f = w(n), l = E(n), g = r * e;
      o == null ? (o = n + r * W, a = n - g / 2) : (o = gr(f, o), a = gr(f, a), (r > 0 ? o < a : o > a) && (o += r * W));
      for (var d, i = o; r > 0 ? i > a : i < a; i -= g) d = Mt([f, -l * w(i), -l * E(i)]), t.point(d[0], d[1]);
    }
  }
  function gr(t, n) {
    n = rt(n), n[0] -= t, At(n);
    var e = er(-n[1]);
    return ((-n[2] < 0 ? -e : e) + W - P) % W;
  }
  function Jt() {
    var t = [], n;
    return { point: function(e, r, o) {
      n.push([e, r, o]);
    }, lineStart: function() {
      t.push(n = []);
    }, lineEnd: T, rejoin: function() {
      t.length > 1 && t.push(t.pop().concat(t.shift()));
    }, result: function() {
      var e = t;
      return t = [], n = null, e;
    } };
  }
  function dt(t, n) {
    return I(t[0] - n[0]) < P && I(t[1] - n[1]) < P;
  }
  function Kt(t, n, e, r) {
    this.x = t, this.z = n, this.o = e, this.e = r, this.v = false, this.n = this.p = null;
  }
  function Qt(t, n, e, r, o) {
    var a = [], f = [], l, g;
    if (t.forEach(function(s) {
      if (!((M = s.length - 1) <= 0)) {
        var M, v = s[0], x = s[M], S;
        if (dt(v, x)) {
          if (!v[2] && !x[2]) {
            for (o.lineStart(), l = 0; l < M; ++l) o.point((v = s[l])[0], v[1]);
            o.lineEnd();
            return;
          }
          x[0] += 2 * P;
        }
        a.push(S = new Kt(v, s, null, true)), f.push(S.o = new Kt(v, null, S, false)), a.push(S = new Kt(x, s, null, false)), f.push(S.o = new Kt(x, null, S, true));
      }
    }), !!a.length) {
      for (f.sort(n), xr(a), xr(f), l = 0, g = f.length; l < g; ++l) f[l].e = e = !e;
      for (var d = a[0], i, u; ; ) {
        for (var c = d, p = true; c.v; ) if ((c = c.n) === d) return;
        i = c.z, o.lineStart();
        do {
          if (c.v = c.o.v = true, c.e) {
            if (p) for (l = 0, g = i.length; l < g; ++l) o.point((u = i[l])[0], u[1]);
            else r(c.x, c.n.x, 1, o);
            c = c.n;
          } else {
            if (p) for (i = c.p.z, l = i.length - 1; l >= 0; --l) o.point((u = i[l])[0], u[1]);
            else r(c.x, c.p.x, -1, o);
            c = c.p;
          }
          c = c.o, i = c.z, p = !p;
        } while (!c.v);
        o.lineEnd();
      }
    }
  }
  function xr(t) {
    if (n = t.length) {
      for (var n, e = 0, r = t[0], o; ++e < n; ) r.n = o = t[e], o.p = r, r = o;
      r.n = o = t[0], o.p = r;
    }
  }
  function Sn(t) {
    return I(t[0]) <= z ? t[0] : rr(t[0]) * ((I(t[0]) + z) % W - z);
  }
  function Er(t, n) {
    var e = Sn(n), r = n[1], o = E(r), a = [E(e), -w(e), 0], f = 0, l = 0, g = new Y();
    o === 1 ? r = H + P : o === -1 && (r = -H - P);
    for (var d = 0, i = t.length; d < i; ++d) if (c = (u = t[d]).length) for (var u, c, p = u[c - 1], s = Sn(p), M = p[1] / 2 + pn, v = E(M), x = w(M), S = 0; S < c; ++S, s = y, v = q, x = G, p = h) {
      var h = u[S], y = Sn(h), R = h[1] / 2 + pn, q = E(R), G = w(R), L = y - s, _ = L >= 0 ? 1 : -1, $ = _ * L, A = $ > z, K = v * q;
      if (g.add(B(K * _ * E($), x * G + K * w($))), f += A ? L + _ * W : L, A ^ s >= e ^ y >= e) {
        var k = mt(rt(p), rt(h));
        At(k);
        var F = mt(a, k);
        At(F);
        var m = (A ^ L >= 0 ? -1 : 1) * Z(F[2]);
        (r > m || r === m && (k[0] || k[1])) && (l += A ^ L >= 0 ? 1 : -1);
      }
    }
    return (f < -P || f < P && g < -St) ^ l & 1;
  }
  function Vt(t, n, e, r) {
    return function(o) {
      var a = n(o), f = Jt(), l = n(f), g = false, d, i, u, c = { point: p, lineStart: M, lineEnd: v, polygonStart: function() {
        c.point = x, c.lineStart = S, c.lineEnd = h, i = [], d = [];
      }, polygonEnd: function() {
        c.point = p, c.lineStart = M, c.lineEnd = v, i = pt(i);
        var y = Er(d, r);
        i.length ? (g || (o.polygonStart(), g = true), Qt(i, fe, y, e, o)) : y && (g || (o.polygonStart(), g = true), o.lineStart(), e(null, null, 1, o), o.lineEnd()), g && (o.polygonEnd(), g = false), i = d = null;
      }, sphere: function() {
        o.polygonStart(), o.lineStart(), e(null, null, 1, o), o.lineEnd(), o.polygonEnd();
      } };
      function p(y, R) {
        t(y, R) && o.point(y, R);
      }
      function s(y, R) {
        a.point(y, R);
      }
      function M() {
        c.point = s, a.lineStart();
      }
      function v() {
        c.point = p, a.lineEnd();
      }
      function x(y, R) {
        u.push([y, R]), l.point(y, R);
      }
      function S() {
        l.lineStart(), u = [];
      }
      function h() {
        x(u[0][0], u[0][1]), l.lineEnd();
        var y = l.clean(), R = f.result(), q, G = R.length, L, _, $;
        if (u.pop(), d.push(u), u = null, !!G) {
          if (y & 1) {
            if (_ = R[0], (L = _.length - 1) > 0) {
              for (g || (o.polygonStart(), g = true), o.lineStart(), q = 0; q < L; ++q) o.point(($ = _[q])[0], $[1]);
              o.lineEnd();
            }
            return;
          }
          G > 1 && y & 2 && R.push(R.pop().concat(R.shift())), i.push(R.filter(ae));
        }
      }
      return c;
    };
  }
  function ae(t) {
    return t.length > 1;
  }
  function fe(t, n) {
    return ((t = t.x)[0] < 0 ? t[1] - H - P : H - t[1]) - ((n = n.x)[0] < 0 ? n[1] - H - P : H - n[1]);
  }
  var wn = Vt(function() {
    return true;
  }, ue, ce, [-z, -H]);
  function ue(t) {
    var n = NaN, e = NaN, r = NaN, o;
    return { lineStart: function() {
      t.lineStart(), o = 1;
    }, point: function(a, f) {
      var l = a > 0 ? z : -z, g = I(a - n);
      I(g - z) < P ? (t.point(n, e = (e + f) / 2 > 0 ? H : -H), t.point(r, e), t.lineEnd(), t.lineStart(), t.point(l, e), t.point(a, e), o = 0) : r !== l && g >= z && (I(n - r) < P && (n -= r * P), I(a - l) < P && (a -= l * P), e = le(n, e, a, f), t.point(r, e), t.lineEnd(), t.lineStart(), t.point(l, e), o = 0), t.point(n = a, e = f), r = l;
    }, lineEnd: function() {
      t.lineEnd(), n = e = NaN;
    }, clean: function() {
      return 2 - o;
    } };
  }
  function le(t, n, e, r) {
    var o, a, f = E(t - e);
    return I(f) > P ? nr((E(n) * (a = w(r)) * E(e) - E(r) * (o = w(n)) * E(t)) / (o * a * f)) : (n + r) / 2;
  }
  function ce(t, n, e, r) {
    var o;
    if (t == null) o = e * H, r.point(-z, o), r.point(0, o), r.point(z, o), r.point(z, 0), r.point(z, -o), r.point(0, -o), r.point(-z, -o), r.point(-z, 0), r.point(-z, o);
    else if (I(t[0] - n[0]) > P) {
      var a = t[0] < n[0] ? z : -z;
      o = e * a / 2, r.point(-a, o), r.point(0, o), r.point(a, o);
    } else r.point(n[0], n[1]);
  }
  function yr(t) {
    var n = w(t), e = 2 * C, r = n > 0, o = I(n) > P;
    function a(i, u, c, p) {
      vr(p, t, e, c, i, u);
    }
    function f(i, u) {
      return w(i) * w(u) > n;
    }
    function l(i) {
      var u, c, p, s, M;
      return { lineStart: function() {
        s = p = false, M = 1;
      }, point: function(v, x) {
        var S = [v, x], h, y = f(v, x), R = r ? y ? 0 : d(v, x) : y ? d(v + (v < 0 ? z : -z), x) : 0;
        if (!u && (s = p = y) && i.lineStart(), y !== p && (h = g(u, S), (!h || dt(u, h) || dt(S, h)) && (S[2] = 1)), y !== p) M = 0, y ? (i.lineStart(), h = g(S, u), i.point(h[0], h[1])) : (h = g(u, S), i.point(h[0], h[1], 2), i.lineEnd()), u = h;
        else if (o && u && r ^ y) {
          var q;
          !(R & c) && (q = g(S, u, true)) && (M = 0, r ? (i.lineStart(), i.point(q[0][0], q[0][1]), i.point(q[1][0], q[1][1]), i.lineEnd()) : (i.point(q[1][0], q[1][1]), i.lineEnd(), i.lineStart(), i.point(q[0][0], q[0][1], 3)));
        }
        y && (!u || !dt(u, S)) && i.point(S[0], S[1]), u = S, p = y, c = R;
      }, lineEnd: function() {
        p && i.lineEnd(), u = null;
      }, clean: function() {
        return M | (s && p) << 1;
      } };
    }
    function g(i, u, c) {
      var p = rt(i), s = rt(u), M = [1, 0, 0], v = mt(p, s), x = Pt(v, v), S = v[0], h = x - S * S;
      if (!h) return !c && i;
      var y = n * x / h, R = -n * S / h, q = mt(M, v), G = Rt(M, y), L = Rt(v, R);
      Yt(G, L);
      var _ = q, $ = Pt(G, _), A = Pt(_, _), K = $ * $ - A * (Pt(G, G) - 1);
      if (!(K < 0)) {
        var k = D(K), F = Rt(_, (-$ - k) / A);
        if (Yt(F, G), F = Mt(F), !c) return F;
        var m = i[0], N = u[0], O = i[1], Q = u[1], V;
        N < m && (V = m, m = N, N = V);
        var yt = N - m, it = I(yt - z) < P, lt = it || yt < P;
        if (!it && Q < O && (V = O, O = Q, Q = V), lt ? it ? O + Q > 0 ^ F[1] < (I(F[0] - m) < P ? O : Q) : O <= F[1] && F[1] <= Q : yt > z ^ (m <= F[0] && F[0] <= N)) {
          var at = Rt(_, (-$ + k) / A);
          return Yt(at, G), [F, Mt(at)];
        }
      }
    }
    function d(i, u) {
      var c = r ? t : z - t, p = 0;
      return i < -c ? p |= 1 : i > c && (p |= 2), u < -c ? p |= 4 : u > c && (p |= 8), p;
    }
    return Vt(f, l, a, r ? [0, -t] : [-z, t - z]);
  }
  function Sr(t, n, e, r, o, a) {
    var f = t[0], l = t[1], g = n[0], d = n[1], i = 0, u = 1, c = g - f, p = d - l, s;
    if (s = e - f, !(!c && s > 0)) {
      if (s /= c, c < 0) {
        if (s < i) return;
        s < u && (u = s);
      } else if (c > 0) {
        if (s > u) return;
        s > i && (i = s);
      }
      if (s = o - f, !(!c && s < 0)) {
        if (s /= c, c < 0) {
          if (s > u) return;
          s > i && (i = s);
        } else if (c > 0) {
          if (s < i) return;
          s < u && (u = s);
        }
        if (s = r - l, !(!p && s > 0)) {
          if (s /= p, p < 0) {
            if (s < i) return;
            s < u && (u = s);
          } else if (p > 0) {
            if (s > u) return;
            s > i && (i = s);
          }
          if (s = a - l, !(!p && s < 0)) {
            if (s /= p, p < 0) {
              if (s > u) return;
              s > i && (i = s);
            } else if (p > 0) {
              if (s < i) return;
              s < u && (u = s);
            }
            return i > 0 && (t[0] = f + i * c, t[1] = l + i * p), u < 1 && (n[0] = f + u * c, n[1] = l + u * p), true;
          }
        }
      }
    }
  }
  var It = 1e9, bt = -It;
  function Mn(t, n, e, r) {
    function o(d, i) {
      return t <= d && d <= e && n <= i && i <= r;
    }
    function a(d, i, u, c) {
      var p = 0, s = 0;
      if (d == null || (p = f(d, u)) !== (s = f(i, u)) || g(d, i) < 0 ^ u > 0) do
        c.point(p === 0 || p === 3 ? t : e, p > 1 ? r : n);
      while ((p = (p + u + 4) % 4) !== s);
      else c.point(i[0], i[1]);
    }
    function f(d, i) {
      return I(d[0] - t) < P ? i > 0 ? 0 : 3 : I(d[0] - e) < P ? i > 0 ? 2 : 1 : I(d[1] - n) < P ? i > 0 ? 1 : 0 : i > 0 ? 3 : 2;
    }
    function l(d, i) {
      return g(d.x, i.x);
    }
    function g(d, i) {
      var u = f(d, 1), c = f(i, 1);
      return u !== c ? u - c : u === 0 ? i[1] - d[1] : u === 1 ? d[0] - i[0] : u === 2 ? d[1] - i[1] : i[0] - d[0];
    }
    return function(d) {
      var i = d, u = Jt(), c, p, s, M, v, x, S, h, y, R, q, G = { point: L, lineStart: K, lineEnd: k, polygonStart: $, polygonEnd: A };
      function L(m, N) {
        o(m, N) && i.point(m, N);
      }
      function _() {
        for (var m = 0, N = 0, O = p.length; N < O; ++N) for (var Q = p[N], V = 1, yt = Q.length, it = Q[0], lt, at, Dt = it[0], st = it[1]; V < yt; ++V) lt = Dt, at = st, it = Q[V], Dt = it[0], st = it[1], at <= r ? st > r && (Dt - lt) * (r - at) > (st - at) * (t - lt) && ++m : st <= r && (Dt - lt) * (r - at) < (st - at) * (t - lt) && --m;
        return m;
      }
      function $() {
        i = u, c = [], p = [], q = true;
      }
      function A() {
        var m = _(), N = q && m, O = (c = pt(c)).length;
        (N || O) && (d.polygonStart(), N && (d.lineStart(), a(null, null, 1, d), d.lineEnd()), O && Qt(c, l, m, a, d), d.polygonEnd()), i = d, c = p = s = null;
      }
      function K() {
        G.point = F, p && p.push(s = []), R = true, y = false, S = h = NaN;
      }
      function k() {
        c && (F(M, v), x && y && u.rejoin(), c.push(u.result())), G.point = L, y && i.lineEnd();
      }
      function F(m, N) {
        var O = o(m, N);
        if (p && s.push([m, N]), R) M = m, v = N, x = O, R = false, O && (i.lineStart(), i.point(m, N));
        else if (O && y) i.point(m, N);
        else {
          var Q = [S = Math.max(bt, Math.min(It, S)), h = Math.max(bt, Math.min(It, h))], V = [m = Math.max(bt, Math.min(It, m)), N = Math.max(bt, Math.min(It, N))];
          Sr(Q, V, t, n, e, r) ? (y || (i.lineStart(), i.point(Q[0], Q[1])), i.point(V[0], V[1]), O || i.lineEnd(), q = false) : O && (i.lineStart(), i.point(m, N), q = false);
        }
        S = m, h = N, y = O;
      }
      return G;
    };
  }
  var Pn, Rn, tn, nn, ht = { sphere: T, point: T, lineStart: se, lineEnd: T, polygonStart: T, polygonEnd: T };
  function se() {
    ht.point = me, ht.lineEnd = pe;
  }
  function pe() {
    ht.point = ht.lineEnd = T;
  }
  function me(t, n) {
    t *= C, n *= C, Rn = t, tn = E(n), nn = w(n), ht.point = de;
  }
  function de(t, n) {
    t *= C, n *= C;
    var e = E(n), r = w(n), o = I(t - Rn), a = w(o), f = E(o), l = r * f, g = nn * e - tn * r * a, d = tn * e + nn * r * a;
    Pn.add(B(D(l * l + g * g), d)), Rn = t, tn = e, nn = r;
  }
  function wr(t) {
    return Pn = new Y(), b(t, ht), +Pn;
  }
  var An = [null, null], he = { type: "LineString", coordinates: An };
  function qn(t, n) {
    return An[0] = t, An[1] = n, wr(he);
  }
  function Mr(t, n, e) {
    var r = ft(t, n - P, e).concat(n);
    return function(o) {
      return r.map(function(a) {
        return [o, a];
      });
    };
  }
  function Pr(t, n, e) {
    var r = ft(t, n - P, e).concat(n);
    return function(o) {
      return r.map(function(a) {
        return [a, o];
      });
    };
  }
  function Cn() {
    var t, n, e, r, o, a, f, l, g = 10, d = g, i = 90, u = 360, c, p, s, M, v = 2.5;
    function x() {
      return { type: "MultiLineString", coordinates: S() };
    }
    function S() {
      return ft(wt(r / i) * i, e, i).map(s).concat(ft(wt(l / u) * u, f, u).map(M)).concat(ft(wt(n / g) * g, t, g).filter(function(h) {
        return I(h % i) > P;
      }).map(c)).concat(ft(wt(a / d) * d, o, d).filter(function(h) {
        return I(h % u) > P;
      }).map(p));
    }
    return x.lines = function() {
      return S().map(function(h) {
        return { type: "LineString", coordinates: h };
      });
    }, x.outline = function() {
      return { type: "Polygon", coordinates: [s(r).concat(M(f).slice(1), s(e).reverse().slice(1), M(l).reverse().slice(1))] };
    }, x.extent = function(h) {
      return arguments.length ? x.extentMajor(h).extentMinor(h) : x.extentMinor();
    }, x.extentMajor = function(h) {
      return arguments.length ? (r = +h[0][0], e = +h[1][0], l = +h[0][1], f = +h[1][1], r > e && (h = r, r = e, e = h), l > f && (h = l, l = f, f = h), x.precision(v)) : [[r, l], [e, f]];
    }, x.extentMinor = function(h) {
      return arguments.length ? (n = +h[0][0], t = +h[1][0], a = +h[0][1], o = +h[1][1], n > t && (h = n, n = t, t = h), a > o && (h = a, a = o, o = h), x.precision(v)) : [[n, a], [t, o]];
    }, x.step = function(h) {
      return arguments.length ? x.stepMajor(h).stepMinor(h) : x.stepMinor();
    }, x.stepMajor = function(h) {
      return arguments.length ? (i = +h[0], u = +h[1], x) : [i, u];
    }, x.stepMinor = function(h) {
      return arguments.length ? (g = +h[0], d = +h[1], x) : [g, d];
    }, x.precision = function(h) {
      return arguments.length ? (v = +h, c = Mr(a, o, 90), p = Pr(n, t, v), s = Mr(l, f, 90), M = Pr(r, e, v), x) : v;
    }, x.extentMajor([[-180, -90 + P], [180, 90 - P]]).extentMinor([[-180, -80 - P], [180, 80 + P]]);
  }
  function zn() {
    return Cn()();
  }
  function In(t, n) {
    var e = t[0] * C, r = t[1] * C, o = n[0] * C, a = n[1] * C, f = w(r), l = E(r), g = w(a), d = E(a), i = f * w(e), u = f * E(e), c = g * w(o), p = g * E(o), s = 2 * Z(D(mn(a - r) + f * g * mn(o - e))), M = E(s), v = s ? function(x) {
      var S = E(x *= s) / M, h = E(s - x) / M, y = h * i + S * c, R = h * u + S * p, q = h * l + S * d;
      return [B(R, y) * X, B(q, D(y * y + R * R)) * X];
    } : function() {
      return [e * X, r * X];
    };
    return v.distance = s, v;
  }
  var Nt = (t) => t;
  var Nn = new Y(), Ln = new Y(), Rr, Ar, _n, Gn, ut = { point: T, lineStart: T, lineEnd: T, polygonStart: function() {
    ut.lineStart = ge, ut.lineEnd = xe;
  }, polygonEnd: function() {
    ut.lineStart = ut.lineEnd = ut.point = T, Nn.add(I(Ln)), Ln = new Y();
  }, result: function() {
    var t = Nn / 2;
    return Nn = new Y(), t;
  } };
  function ge() {
    ut.point = ve;
  }
  function ve(t, n) {
    ut.point = qr, Rr = _n = t, Ar = Gn = n;
  }
  function qr(t, n) {
    Ln.add(Gn * t - _n * n), _n = t, Gn = n;
  }
  function xe() {
    qr(Rr, Ar);
  }
  var Fn = ut;
  var gt = 1 / 0, rn = gt, Lt = -gt, en = Lt, Ee = { point: ye, lineStart: T, lineEnd: T, polygonStart: T, polygonEnd: T, result: function() {
    var t = [[gt, rn], [Lt, en]];
    return Lt = en = -(rn = gt = 1 / 0), t;
  } };
  function ye(t, n) {
    t < gt && (gt = t), t > Lt && (Lt = t), n < rn && (rn = n), n > en && (en = n);
  }
  var vt = Ee;
  var Tn = 0, $n = 0, _t = 0, on = 0, an = 0, xt = 0, Dn = 0, kn = 0, Gt = 0, Ir, Nr, et, ot, nt = { point: ct, lineStart: Cr, lineEnd: zr, polygonStart: function() {
    nt.lineStart = Me, nt.lineEnd = Pe;
  }, polygonEnd: function() {
    nt.point = ct, nt.lineStart = Cr, nt.lineEnd = zr;
  }, result: function() {
    var t = Gt ? [Dn / Gt, kn / Gt] : xt ? [on / xt, an / xt] : _t ? [Tn / _t, $n / _t] : [NaN, NaN];
    return Tn = $n = _t = on = an = xt = Dn = kn = Gt = 0, t;
  } };
  function ct(t, n) {
    Tn += t, $n += n, ++_t;
  }
  function Cr() {
    nt.point = Se;
  }
  function Se(t, n) {
    nt.point = we, ct(et = t, ot = n);
  }
  function we(t, n) {
    var e = t - et, r = n - ot, o = D(e * e + r * r);
    on += o * (et + t) / 2, an += o * (ot + n) / 2, xt += o, ct(et = t, ot = n);
  }
  function zr() {
    nt.point = ct;
  }
  function Me() {
    nt.point = Re;
  }
  function Pe() {
    Lr(Ir, Nr);
  }
  function Re(t, n) {
    nt.point = Lr, ct(Ir = et = t, Nr = ot = n);
  }
  function Lr(t, n) {
    var e = t - et, r = n - ot, o = D(e * e + r * r);
    on += o * (et + t) / 2, an += o * (ot + n) / 2, xt += o, o = ot * t - et * n, Dn += o * (et + t), kn += o * (ot + n), Gt += o * 3, ct(et = t, ot = n);
  }
  var Xn = nt;
  function fn(t) {
    this._context = t;
  }
  fn.prototype = { _radius: 4.5, pointRadius: function(t) {
    return this._radius = t, this;
  }, polygonStart: function() {
    this._line = 0;
  }, polygonEnd: function() {
    this._line = NaN;
  }, lineStart: function() {
    this._point = 0;
  }, lineEnd: function() {
    this._line === 0 && this._context.closePath(), this._point = NaN;
  }, point: function(t, n) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(t, n), this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(t, n);
        break;
      }
      default: {
        this._context.moveTo(t + this._radius, n), this._context.arc(t, n, this._radius, 0, W);
        break;
      }
    }
  }, result: T };
  var Bn = new Y(), Yn, _r, Gr, Ft, Tt, un = { point: T, lineStart: function() {
    un.point = Ae;
  }, lineEnd: function() {
    Yn && Fr(_r, Gr), un.point = T;
  }, polygonStart: function() {
    Yn = true;
  }, polygonEnd: function() {
    Yn = null;
  }, result: function() {
    var t = +Bn;
    return Bn = new Y(), t;
  } };
  function Ae(t, n) {
    un.point = Fr, _r = Ft = t, Gr = Tt = n;
  }
  function Fr(t, n) {
    Ft -= t, Tt -= n, Bn.add(D(Ft * Ft + Tt * Tt)), Ft = t, Tt = n;
  }
  var On = un;
  var Tr, ln, $r, Dr, Et = class {
    constructor(n) {
      this._append = n == null ? kr : qe(n), this._radius = 4.5, this._ = "";
    }
    pointRadius(n) {
      return this._radius = +n, this;
    }
    polygonStart() {
      this._line = 0;
    }
    polygonEnd() {
      this._line = NaN;
    }
    lineStart() {
      this._point = 0;
    }
    lineEnd() {
      this._line === 0 && (this._ += "Z"), this._point = NaN;
    }
    point(n, e) {
      switch (this._point) {
        case 0: {
          this._append`M${n},${e}`, this._point = 1;
          break;
        }
        case 1: {
          this._append`L${n},${e}`;
          break;
        }
        default: {
          if (this._append`M${n},${e}`, this._radius !== $r || this._append !== ln) {
            let r = this._radius, o = this._;
            this._ = "", this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`, $r = r, ln = this._append, Dr = this._, this._ = o;
          }
          this._ += Dr;
          break;
        }
      }
    }
    result() {
      let n = this._;
      return this._ = "", n.length ? n : null;
    }
  };
  function kr(t) {
    let n = 1;
    this._ += t[0];
    for (let e = t.length; n < e; ++n) this._ += arguments[n] + t[n];
  }
  function qe(t) {
    let n = Math.floor(t);
    if (!(n >= 0)) throw new RangeError(`invalid digits: ${t}`);
    if (n > 15) return kr;
    if (n !== Tr) {
      let e = 10 ** n;
      Tr = n, ln = function(o) {
        let a = 1;
        this._ += o[0];
        for (let f = o.length; a < f; ++a) this._ += Math.round(arguments[a] * e) / e + o[a];
      };
    }
    return ln;
  }
  function Zn(t, n) {
    let e = 3, r = 4.5, o, a;
    function f(l) {
      return l && (typeof r == "function" && a.pointRadius(+r.apply(this, arguments)), b(l, o(a))), a.result();
    }
    return f.area = function(l) {
      return b(l, o(Fn)), Fn.result();
    }, f.measure = function(l) {
      return b(l, o(On)), On.result();
    }, f.bounds = function(l) {
      return b(l, o(vt)), vt.result();
    }, f.centroid = function(l) {
      return b(l, o(Xn)), Xn.result();
    }, f.projection = function(l) {
      return arguments.length ? (o = l == null ? (t = null, Nt) : (t = l).stream, f) : t;
    }, f.context = function(l) {
      return arguments.length ? (a = l == null ? (n = null, new Et(e)) : new fn(n = l), typeof r != "function" && a.pointRadius(r), f) : n;
    }, f.pointRadius = function(l) {
      return arguments.length ? (r = typeof l == "function" ? l : (a.pointRadius(+l), +l), f) : r;
    }, f.digits = function(l) {
      if (!arguments.length) return e;
      if (l == null) e = null;
      else {
        let g = Math.floor(l);
        if (!(g >= 0)) throw new RangeError(`invalid digits: ${l}`);
        e = g;
      }
      return n === null && (a = new Et(e)), f;
    }, f.projection(t).digits(e).context(n);
  }
  function $t(t) {
    return function(n) {
      var e = new Wn();
      for (var r in t) e[r] = t[r];
      return e.stream = n, e;
    };
  }
  function Wn() {
  }
  Wn.prototype = { constructor: Wn, point: function(t, n) {
    this.stream.point(t, n);
  }, sphere: function() {
    this.stream.sphere();
  }, lineStart: function() {
    this.stream.lineStart();
  }, lineEnd: function() {
    this.stream.lineEnd();
  }, polygonStart: function() {
    this.stream.polygonStart();
  }, polygonEnd: function() {
    this.stream.polygonEnd();
  } };
  function Hn(t, n, e) {
    var r = t.clipExtent && t.clipExtent();
    return t.scale(150).translate([0, 0]), r != null && t.clipExtent(null), b(e, t.stream(vt)), n(vt.result()), r != null && t.clipExtent(r), t;
  }
  function jn(t, n, e) {
    return Hn(t, function(r) {
      var o = n[1][0] - n[0][0], a = n[1][1] - n[0][1], f = Math.min(o / (r[1][0] - r[0][0]), a / (r[1][1] - r[0][1])), l = +n[0][0] + (o - f * (r[1][0] + r[0][0])) / 2, g = +n[0][1] + (a - f * (r[1][1] + r[0][1])) / 2;
      t.scale(150 * f).translate([l, g]);
    }, e);
  }
  function Xr(t, n, e) {
    return jn(t, [[0, 0], n], e);
  }
  function Yr(t, n, e) {
    return Hn(t, function(r) {
      var o = +n, a = o / (r[1][0] - r[0][0]), f = (o - a * (r[1][0] + r[0][0])) / 2, l = -a * r[0][1];
      t.scale(150 * a).translate([f, l]);
    }, e);
  }
  function Br(t, n, e) {
    return Hn(t, function(r) {
      var o = +n, a = o / (r[1][1] - r[0][1]), f = -a * r[0][0], l = (o - a * (r[1][1] + r[0][1])) / 2;
      t.scale(150 * a).translate([f, l]);
    }, e);
  }
  var Or = 16, Ce = w(30 * C);
  function Un(t, n) {
    return +n ? Ie(t, n) : ze(t);
  }
  function ze(t) {
    return $t({ point: function(n, e) {
      n = t(n, e), this.stream.point(n[0], n[1]);
    } });
  }
  function Ie(t, n) {
    function e(r, o, a, f, l, g, d, i, u, c, p, s, M, v) {
      var x = d - r, S = i - o, h = x * x + S * S;
      if (h > 4 * n && M--) {
        var y = f + c, R = l + p, q = g + s, G = D(y * y + R * R + q * q), L = Z(q /= G), _ = I(I(q) - 1) < P || I(a - u) < P ? (a + u) / 2 : B(R, y), $ = t(_, L), A = $[0], K = $[1], k = A - r, F = K - o, m = S * k - x * F;
        (m * m / h > n || I((x * k + S * F) / h - 0.5) > 0.3 || f * c + l * p + g * s < Ce) && (e(r, o, a, f, l, g, A, K, _, y /= G, R /= G, q, M, v), v.point(A, K), e(A, K, _, y, R, q, d, i, u, c, p, s, M, v));
      }
    }
    return function(r) {
      var o, a, f, l, g, d, i, u, c, p, s, M, v = { point: x, lineStart: S, lineEnd: y, polygonStart: function() {
        r.polygonStart(), v.lineStart = R;
      }, polygonEnd: function() {
        r.polygonEnd(), v.lineStart = S;
      } };
      function x(L, _) {
        L = t(L, _), r.point(L[0], L[1]);
      }
      function S() {
        u = NaN, v.point = h, r.lineStart();
      }
      function h(L, _) {
        var $ = rt([L, _]), A = t(L, _);
        e(u, c, i, p, s, M, u = A[0], c = A[1], i = L, p = $[0], s = $[1], M = $[2], Or, r), r.point(u, c);
      }
      function y() {
        v.point = x, r.lineEnd();
      }
      function R() {
        S(), v.point = q, v.lineEnd = G;
      }
      function q(L, _) {
        h(o = L, _), a = u, f = c, l = p, g = s, d = M, v.point = h;
      }
      function G() {
        e(u, c, i, p, s, M, a, f, o, l, g, d, Or, r), v.lineEnd = y, y();
      }
      return v;
    };
  }
  var Ne = $t({ point: function(t, n) {
    this.stream.point(t * C, n * C);
  } });
  function Le(t) {
    return $t({ point: function(n, e) {
      var r = t(n, e);
      return this.stream.point(r[0], r[1]);
    } });
  }
  function _e(t, n, e, r, o) {
    function a(f, l) {
      return f *= r, l *= o, [n + t * f, e - t * l];
    }
    return a.invert = function(f, l) {
      return [(f - n) / t * r, (e - l) / t * o];
    }, a;
  }
  function Zr(t, n, e, r, o, a) {
    if (!a) return _e(t, n, e, r, o);
    var f = w(a), l = E(a), g = f * t, d = l * t, i = f / t, u = l / t, c = (l * e - f * n) / t, p = (l * n + f * e) / t;
    function s(M, v) {
      return M *= r, v *= o, [g * M - d * v + n, e - d * M - g * v];
    }
    return s.invert = function(M, v) {
      return [r * (i * M - u * v + c), o * (p - u * M - i * v)];
    }, s;
  }
  function Jn(t) {
    return Ge(function() {
      return t;
    })();
  }
  function Ge(t) {
    var n, e = 150, r = 480, o = 250, a = 0, f = 0, l = 0, g = 0, d = 0, i, u = 0, c = 1, p = 1, s = null, M = wn, v = null, x, S, h, y = Nt, R = 0.5, q, G, L, _, $;
    function A(m) {
      return L(m[0] * C, m[1] * C);
    }
    function K(m) {
      return m = L.invert(m[0], m[1]), m && [m[0] * X, m[1] * X];
    }
    A.stream = function(m) {
      return _ && $ === m ? _ : _ = Ne(Le(i)(M(q(y($ = m)))));
    }, A.preclip = function(m) {
      return arguments.length ? (M = m, s = void 0, F()) : M;
    }, A.postclip = function(m) {
      return arguments.length ? (y = m, v = x = S = h = null, F()) : y;
    }, A.clipAngle = function(m) {
      return arguments.length ? (M = +m ? yr(s = m * C) : (s = null, wn), F()) : s * X;
    }, A.clipExtent = function(m) {
      return arguments.length ? (y = m == null ? (v = x = S = h = null, Nt) : Mn(v = +m[0][0], x = +m[0][1], S = +m[1][0], h = +m[1][1]), F()) : v == null ? null : [[v, x], [S, h]];
    }, A.scale = function(m) {
      return arguments.length ? (e = +m, k()) : e;
    }, A.translate = function(m) {
      return arguments.length ? (r = +m[0], o = +m[1], k()) : [r, o];
    }, A.center = function(m) {
      return arguments.length ? (a = m[0] % 360 * C, f = m[1] % 360 * C, k()) : [a * X, f * X];
    }, A.rotate = function(m) {
      return arguments.length ? (l = m[0] % 360 * C, g = m[1] % 360 * C, d = m.length > 2 ? m[2] % 360 * C : 0, k()) : [l * X, g * X, d * X];
    }, A.angle = function(m) {
      return arguments.length ? (u = m % 360 * C, k()) : u * X;
    }, A.reflectX = function(m) {
      return arguments.length ? (c = m ? -1 : 1, k()) : c < 0;
    }, A.reflectY = function(m) {
      return arguments.length ? (p = m ? -1 : 1, k()) : p < 0;
    }, A.precision = function(m) {
      return arguments.length ? (q = Un(G, R = m * m), F()) : D(R);
    }, A.fitExtent = function(m, N) {
      return jn(A, m, N);
    }, A.fitSize = function(m, N) {
      return Xr(A, m, N);
    }, A.fitWidth = function(m, N) {
      return Yr(A, m, N);
    }, A.fitHeight = function(m, N) {
      return Br(A, m, N);
    };
    function k() {
      var m = Zr(e, 0, 0, c, p, u).apply(null, n(a, f)), N = Zr(e, r - m[0], o - m[1], c, p, u);
      return i = hr(l, g, d), G = zt(n, N), L = zt(i, G), q = Un(G, R), F();
    }
    function F() {
      return _ = $ = null, A;
    }
    return function() {
      return n = t.apply(this, arguments), A.invert = n.invert && K, k();
    };
  }
  function Wr(t) {
    return function(n, e) {
      var r = D(n * n + e * e), o = t(r), a = E(o), f = w(o);
      return [B(n * a, r * f), Z(r && e * a / r)];
    };
  }
  function Kn(t, n) {
    return [w(n) * E(t), E(n)];
  }
  Kn.invert = Wr(Z);
  function Qn() {
    return Jn(Kn).scale(249.5).clipAngle(90 + P);
  }
  function Vn(t) {
    return t;
  }
  function cn(t) {
    if (t == null) return Vn;
    var n, e, r = t.scale[0], o = t.scale[1], a = t.translate[0], f = t.translate[1];
    return function(l, g) {
      g || (n = e = 0);
      var d = 2, i = l.length, u = new Array(i);
      for (u[0] = (n += l[0]) * r + a, u[1] = (e += l[1]) * o + f; d < i; ) u[d] = l[d], ++d;
      return u;
    };
  }
  function Hr(t, n) {
    for (var e, r = t.length, o = r - n; o < --r; ) e = t[o], t[o++] = t[r], t[r] = e;
  }
  function bn(t, n) {
    return typeof n == "string" && (n = t.objects[n]), n.type === "GeometryCollection" ? { type: "FeatureCollection", features: n.geometries.map(function(e) {
      return jr(t, e);
    }) } : jr(t, n);
  }
  function jr(t, n) {
    var e = n.id, r = n.bbox, o = n.properties == null ? {} : n.properties, a = tr(t, n);
    return e == null && r == null ? { type: "Feature", properties: o, geometry: a } : r == null ? { type: "Feature", id: e, properties: o, geometry: a } : { type: "Feature", id: e, bbox: r, properties: o, geometry: a };
  }
  function tr(t, n) {
    var e = cn(t.transform), r = t.arcs;
    function o(i, u) {
      u.length && u.pop();
      for (var c = r[i < 0 ? ~i : i], p = 0, s = c.length; p < s; ++p) u.push(e(c[p], p));
      i < 0 && Hr(u, s);
    }
    function a(i) {
      return e(i);
    }
    function f(i) {
      for (var u = [], c = 0, p = i.length; c < p; ++c) o(i[c], u);
      return u.length < 2 && u.push(u[0]), u;
    }
    function l(i) {
      for (var u = f(i); u.length < 4; ) u.push(u[0]);
      return u;
    }
    function g(i) {
      return i.map(l);
    }
    function d(i) {
      var u = i.type, c;
      switch (u) {
        case "GeometryCollection":
          return { type: u, geometries: i.geometries.map(d) };
        case "Point":
          c = a(i.coordinates);
          break;
        case "MultiPoint":
          c = i.coordinates.map(a);
          break;
        case "LineString":
          c = f(i.arcs);
          break;
        case "MultiLineString":
          c = i.arcs.map(f);
          break;
        case "Polygon":
          c = g(i.arcs);
          break;
        case "MultiPolygon":
          c = i.arcs.map(g);
          break;
        default:
          return null;
      }
      return { type: u, coordinates: c };
    }
    return d(n);
  }
  return br(De);
})();
