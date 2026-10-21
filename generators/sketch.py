"""Tiny hand-drawn SVG kit: wobbly monoline paths, die-cut stickers, outlined text."""
import math, random
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

INK = '#111111'
FS = 'node_modules/@fontsource/'

class Pen:
    def __init__(self, seed=1, amp=0.9):
        self.r = random.Random(seed)
        self.amp = amp

    # ---- point helpers -------------------------------------------------
    def _noise(self):
        a, b = self.r.uniform(0, 6.28), self.r.uniform(0, 6.28)
        f1, f2 = self.r.uniform(.7, 1.3), self.r.uniform(1.8, 2.6)
        return lambda t: .65 * math.sin(f1 * t * 6.28 + a) + .35 * math.sin(f2 * t * 6.28 + b)

    def edge(self, a, b, amp=None, step=14):
        amp = self.amp if amp is None else amp
        (x1, y1), (x2, y2) = a, b
        L = math.hypot(x2 - x1, y2 - y1) or 1
        n = max(2, int(L / step))
        nx, ny = -(y2 - y1) / L, (x2 - x1) / L
        nz = self._noise()
        out = []
        for i in range(n + 1):
            t = i / n
            d = amp * nz(t) * math.sin(math.pi * t) ** .5 if 0 < i < n else 0
            out.append((x1 + (x2 - x1) * t + nx * d, y1 + (y2 - y1) * t + ny * d))
        return out

    def chain(self, pts, closed=False, amp=None):
        out = []
        P = pts + ([pts[0]] if closed else [])
        for i in range(len(P) - 1):
            e = self.edge(P[i], P[i + 1], amp)
            out += e if i == 0 else e[1:]
        return out

    @staticmethod
    def smooth(pts, closed=False, tension=1.0):
        f = lambda p: f'{p[0]:.1f} {p[1]:.1f}'
        if len(pts) < 3:
            return 'M' + ' L'.join(f(p) for p in pts)
        P = pts[:-1] if closed and pts[0] == pts[-1] else pts
        n = len(P)
        d = 'M' + f(P[0])
        rng = range(n) if closed else range(n - 1)
        for i in rng:
            p0 = P[(i - 1) % n] if (closed or i > 0) else P[i]
            p1, p2 = P[i], P[(i + 1) % n]
            p3 = P[(i + 2) % n] if (closed or i + 2 < n) else p2
            c1 = (p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension)
            d += f' C{f(c1)} {f(c2)} {f(p2)}'
        return d + (' Z' if closed else '')

    # ---- shapes (return path d) ----------------------------------------
    def line(self, a, b, amp=None):
        return self.smooth(self.edge(a, b, amp))

    def poly(self, pts, closed=False, amp=None):
        # keep corners crisp: each edge smoothed alone, joined with L
        P = pts + ([pts[0]] if closed else [])
        d = ''
        for i in range(len(P) - 1):
            e = self.smooth(self.edge(P[i], P[i + 1], amp))
            if i == 0:
                d = e
            else:
                d += ' C' + e.split(' C', 1)[1] if ' C' in e else ' L' + e.split(' L', 1)[1]
        return d + (' Z' if closed else '')

    def curve(self, pts, closed=False, amp=None):
        """Smooth curve THROUGH pts, lightly jittered."""
        amp = self.amp if amp is None else amp
        J = [(x + self.r.uniform(-amp, amp) * .6, y + self.r.uniform(-amp, amp) * .6) for x, y in pts]
        return self.smooth(J + ([J[0]] if closed else []), closed)

    def rect(self, x, y, w, h, r=0, amp=None):
        if r <= 0:
            return self.poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], True, amp)
        pts = []
        for cx, cy, a0 in ((x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)):
            for k in range(4):
                a = math.radians(a0 + k * 30)
                pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
            a = math.radians(a0 + 90)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        dense = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            seg = self.edge(a, b, amp if math.hypot(b[0]-a[0], b[1]-a[1]) > 20 else 0.2)
            dense += seg[:-1]
        return self.smooth(dense + [dense[0]], True)

    def ellipse(self, cx, cy, rx, ry=None, closed=True, overlap=0.0, a0=None, amp=None):
        ry = rx if ry is None else ry
        amp = self.amp if amp is None else amp
        a0 = self.r.uniform(0, 6.28) if a0 is None else a0
        n = max(10, int((rx + ry) / 5))
        nz = self._noise()
        span = 1 + overlap
        pts = []
        cnt = int(n * span) if not closed else n
        for i in range(cnt + (0 if closed else 1)):
            t = i / n
            a = a0 + t * 6.2832
            k = 1 + amp / max(rx, 1) * nz(t / span) * 1.4 + (t * .02 if not closed else 0)
            pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
        return self.smooth(pts + ([pts[0]] if closed else []), closed)

    def arc(self, cx, cy, r, d0, d1, ry=None):
        ry = r if ry is None else ry
        n = max(4, int(abs(d1 - d0) / 12))
        pts = [(cx + r * math.cos(math.radians(d0 + (d1 - d0) * i / n)), cy + ry * math.sin(math.radians(d0 + (d1 - d0) * i / n))) for i in range(n + 1)]
        return self.curve(pts)


# ---- text to outlines -------------------------------------------------
_fonts = {}
def font(name):
    if name not in _fonts:
        path = {
            'gochi': FS + 'gochi-hand/files/gochi-hand-latin-400-normal.woff',
            'coming': FS + 'coming-soon/files/coming-soon-latin-400-normal.woff',
            'shantell': FS + 'shantell-sans/files/shantell-sans-latin-700-normal.woff',
            'shantell5': FS + 'shantell-sans/files/shantell-sans-latin-500-normal.woff',
            'mono': FS + 'ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff',
            'mono4': FS + 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff',
            'serif': FS + 'instrument-serif/files/instrument-serif-latin-400-normal.woff',
            'serifi': FS + 'instrument-serif/files/instrument-serif-latin-400-italic.woff',
            'black': FS + 'archivo-black/files/archivo-black-latin-400-normal.woff',
            'pixel': FS + 'silkscreen/files/silkscreen-latin-400-normal.woff',
            'script': FS + 'yellowtail/files/yellowtail-latin-400-normal.woff',
            'caveat': FS + 'caveat/files/caveat-latin-700-normal.woff',
            'sans5': FS + 'instrument-sans/files/instrument-sans-latin-500-normal.woff',
            'sans7': FS + 'instrument-sans/files/instrument-sans-latin-700-normal.woff',
        }[name]
        _fonts[name] = TTFont(path)
    return _fonts[name]

def text_width(s, size, fname='gochi', track=0):
    f = font(fname); upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); hm = f['hmtx']
    return sum(hm[cmap.get(ord(c), cmap[32])][0] for c in s) * size / upm + track * (len(s) - 1)

def text(s, x, y, size, fname='gochi', anchor='middle', wobble=2.5, seed=0, track=0, rot=0):
    """Outlined text, baseline at y. Returns path d. Each glyph tilts a little."""
    f = font(fname); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    sc = size / upm
    w = text_width(s, size, fname, track)
    x0 = x - (w / 2 if anchor == 'middle' else w if anchor == 'end' else 0)
    rr = random.Random(seed)
    d = ''
    cx = x0
    for ch in s:
        gname = cmap.get(ord(ch), cmap[32])
        adv = f['hmtx'][gname][0] * sc
        if ch != ' ':
            ang = math.radians(rr.uniform(-wobble, wobble))
            dy = rr.uniform(-wobble, wobble) * .25
            px, py = cx + adv / 2, y
            ca, sa = math.cos(ang), math.sin(ang)
            # glyph space -> scale+flip -> rotate about glyph centre baseline
            a, b, c_, d_ = sc * ca, sc * sa, sc * sa, -sc * ca
            e = cx * ca - px * ca + px - (0) * sa + ( - (py) ) * 0
            # explicit composition: p' = R*(S*g + (cx,y+dy) - (px,py)) + (px,py)
            tx = cx - px; ty = y + dy - py
            e = ca * tx - sa * ty + px
            f_ = sa * tx + ca * ty + py
            sp = SVGPathPen(gs)
            gs[gname].draw(TransformPen(sp, (sc * ca, sc * sa, sc * sa, -sc * ca, e, f_)))
            d += sp.getCommands()
        cx += adv + track
    if rot:
        return d, rot
    return d


# ---- svg assembly -----------------------------------------------------
def svg(w, h, body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'{("<defs>" + defs + "</defs>") if defs else ""}{body}</svg>\n')

SHADOW = '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#1f1c19" flood-opacity=".22"/></filter>'

def stroke(d, w=3, color=INK, fill='none', extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'

def fillp(d, color, extra=''):
    return f'<path d="{d}" fill="{color}"{extra}/>'

def diecut(shape_d, fill, border=10, ink=True):
    """White die-cut margin + coloured body with ink outline."""
    out = f'<g filter="url(#s)"><path d="{shape_d}" fill="#fff" stroke="#fff" stroke-width="{border*2}" stroke-linejoin="round"/></g>'
    out += f'<path d="{shape_d}" fill="{fill}"' + (f' stroke="{INK}" stroke-width="2.6" stroke-linejoin="round"' if ink else '') + '/>'
    return out


def text_circle(s, cx, cy, r, size, fname='sans5', start=-90, spread=None, track=0):
    """Glyphs around a circle, clockwise from `start` degrees, baseline on radius r (glyphs outward)."""
    f = font(fname); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    sc = size / upm
    advs = [f['hmtx'][cmap.get(ord(c), cmap[32])][0] * sc + track for c in s]
    total = sum(advs)
    k = (spread / total) if spread else (180 / math.pi / r)  # deg per px
    d = ''; acc = 0
    for ch, adv in zip(s, advs):
        g = cmap.get(ord(ch), cmap[32])
        mid = start + (acc + adv / 2) * k
        a = math.radians(mid)
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        rot = a + math.pi / 2
        ca, sa = math.cos(rot), math.sin(rot)
        # glyph local: x from -adv/2, baseline at 0, y up -> rotate, translate to (px,py)
        ox = -(adv - track) / 2
        e = px + ca * ox; f_ = py + sa * ox
        sp = SVGPathPen(gs)
        gs[g].draw(TransformPen(sp, (sc * ca, sc * sa, sc * sa, -sc * ca, e, f_)))
        d += sp.getCommands(); acc += adv
    return d
