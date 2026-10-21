import math, os, json
from sketch import Pen, svg, INK
K = '#111111'
OUT = 'street'
os.makedirs(OUT, exist_ok=True)
LW = 2.6

def S(d, w=LW, col=K, fill='none'):
    return f'<path d="{d}" fill="{fill}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def F(d, col):
    return f'<path d="{d}" fill="{col}"/>'
def FS(d, col, w=LW):
    return F(d, col) + S(d, w)
def shade(h, k):
    h = h.lstrip('#'); r, g, b = [int(h[i:i+2], 16) for i in (0, 2, 4)]
    f = lambda c: max(0, min(255, int(c * (1 + k))))
    return f'#{f(r):02x}{f(g):02x}{f(b):02x}'

def awning(p, x0, x1, y0, h, col, n=None):
    w = x1 - x0; n = n or max(5, int(w / 26)); sw = w / n
    o = ''
    for i in range(n):
        xa, xb = x0 + i * sw, x0 + (i + 1) * sw
        c = col if i % 2 == 0 else '#ffffff'
        d = p.curve([(xa, y0), (xb, y0), (xb, y0 + h), ((xa + xb) / 2, y0 + h + 9), (xa, y0 + h)], True, .3)
        o += F(d, c)
    o += S(p.line((x0, y0), (x1, y0)))
    scal = []
    for i in range(n):
        xa, xb = x0 + i * sw, x0 + (i + 1) * sw
        scal += [(xa, y0 + h), ((xa + xb) / 2, y0 + h + 9)]
    scal.append((x1, y0 + h))
    o += S(p.curve(scal, amp=.3)) + S(p.line((x0, y0), (x0, y0 + h))) + S(p.line((x1, y0), (x1, y0 + h)))
    for i in range(1, n):
        x = x0 + i * sw
        o += S(p.line((x, y0), (x, y0 + h), .2), 1.6)
    return o

def window(p, x, y, w, h):
    return FS(p.rect(x, y, w, h, 4), '#ffffff') + S(p.rect(x + 6, y + 6, w - 12, h - 12, 2, .3), 1.4, '#c9c7c1')

def door(p, x, y, w, h, col):
    o = FS(p.rect(x, y, w, h, 3), col)
    o += FS(p.rect(x + 8, y + 10, w - 16, h * .38, 2), '#ffffff', 2)
    o += F(p.ellipse(x + w - 10, y + h * .58, 3, amp=.1), K)
    return o

def ground(p, w, y):
    return S(p.line((-6, y), (w + 6, y), .4), 2.8)

def shop(sid, col, acc, seed):
    p = Pen(seed, .8); W, H = 260, 300
    o = FS(p.rect(20, 40, 220, 258), col)
    o += FS(p.rect(12, 30, 236, 16, 2), shade(col, -.18))
    o += FS(p.rect(34, 58, 192, 50, 4), '#ffffff')            # sign board  (34,58,192,50)
    o += awning(p, 26, 234, 122, 24, acc)
    o += window(p, 34, 166, 128, 120)                          # window      (34,166,128,120)
    o += door(p, 176, 178, 50, 120, shade(col, -.25))
    o += ground(p, W, 298)
    save(sid, W, H, o)

def warehouse(sid, col, acc, seed):
    p = Pen(seed, .8); W, H = 330, 290
    teeth = [(14, 86)]
    for i in range(5):
        x = 14 + i * 60
        teeth += [(x, 50), (x + 60, 86)]
    teeth += [(314, 86)]
    o = FS(p.poly(teeth + [(314, 288), (14, 288)], True, .5), col)
    for i in range(5):
        x = 14 + i * 60
        o += FS(p.poly([(x + 6, 58), (x + 6, 82), (x + 40, 82)], True, .3), '#cfe3ee', 1.8)
    o += FS(p.rect(38, 100, 252, 44, 4), '#ffffff')            # sign (38,100,252,44)
    o += FS(p.rect(36, 162, 136, 126, 3), shade(col, -.2))      # roller door
    for y in range(176, 286, 12):
        o += S(p.line((40, y), (168, y), .3), 1.6)
    o += FS(p.rect(36, 154, 136, 10, 2), acc, 2)
    o += window(p, 188, 162, 108, 100)                          # window (188,162,108,100)
    for i in range(6):
        o += F(p.poly([(16 + i * 50, 288), (40 + i * 50, 288), (52 + i * 50, 278), (28 + i * 50, 278)], True, .1), acc) if False else ''
    o += ground(p, W, 288)
    save(sid, W, H, o)

def tower(sid, col, acc, seed):
    p = Pen(seed, .8); W, H = 230, 400
    o = FS(p.rect(26, 22, 178, 376, 3), col)
    o += FS(p.rect(18, 14, 194, 14, 2), shade(col, -.2))
    o += FS(p.rect(36, 40, 158, 46, 4), '#ffffff')             # sign (36,40,158,46)
    for r in range(3):
        for c in range(4):
            x, y = 40 + c * 38, 104 + r * 52
            o += FS(p.rect(x, y, 26, 36, 2, .3), '#cfe3ee', 2)
            o += S(p.line((x + 13, y + 2), (x + 13, y + 34), .1), 1.2)
    o += FS(p.rect(26, 260, 178, 10, 1), acc, 2)
    o += window(p, 38, 280, 108, 112)                           # window (38,280,108,112)
    o += door(p, 154, 290, 42, 108, shade(col, -.25))
    o += ground(p, W, 398)
    save(sid, W, H, o)

def kiosk(sid, col, acc, seed):
    p = Pen(seed, .8); W, H = 230, 280
    dome = [(22, 120), (30, 72), (70, 36), (115, 26), (160, 36), (200, 72), (208, 120)]
    o = FS(p.curve(dome + [(115, 120)], True, .4), acc)
    o += S(p.curve(dome, False, .4))
    for x in (70, 115, 160):
        o += S(p.curve([(x, 120), (x + (115 - x) * .3, 70), (115, 28)], amp=.3), 1.6)
    o += FS(p.rect(18, 116, 194, 14, 3), '#ffffff')
    o += FS(p.rect(30, 130, 170, 148, 3), col)
    o += FS(p.ellipse(115, 76, 0.1, amp=0), K) if False else ''
    o += FS(p.rect(44, 138, 142, 30, 4), '#ffffff')            # sign (44,138,142,30)
    o += window(p, 46, 176, 138, 76)                            # window (46,176,138,76)
    o += FS(p.rect(36, 252, 158, 10, 2), shade(col, -.25), 2)
    o += ground(p, W, 278)
    save(sid, W, H, o)

def gable(sid, col, acc, seed):
    p = Pen(seed, .8); W, H = 270, 330
    o = FS(p.rect(30, 110, 210, 218), col)
    o += FS(p.poly([(14, 116), (135, 22), (256, 116)], True, .6), acc)
    o += FS(p.ellipse(135, 82, 20, amp=.4), '#ffffff') + S(p.line((135, 64), (135, 100), .1), 1.6) + S(p.line((117, 82), (153, 82), .1), 1.6)
    o += FS(p.rect(44, 126, 182, 44, 4), '#ffffff')            # sign (44,126,182,44)
    o += window(p, 44, 186, 116, 112)                           # window (44,186,116,112)
    o += door(p, 176, 200, 50, 128, shade(col, -.25))
    o += FS(p.rect(36, 298, 132, 10, 2), shade(col, -.2), 2)
    o += ground(p, W, 328)
    save(sid, W, H, o)

def save(sid, W, H, body):
    open(f'{OUT}/{sid}.svg', 'w').write(svg(W, H, body))

# ---- props ----
def lamp():
    p = Pen(91, .5); W, H = 60, 220
    o = S(p.line((30, 218), (30, 40)), 3) + S(p.curve([(30, 40), (34, 22), (48, 18)]), 3)
    o += FS(p.poly([(38, 18), (58, 18), (54, 32), (42, 32)], True, .2), '#fbe97a', 2.2)
    o += S(p.line((22, 218), (38, 218)), 3)
    save('prop-lamp', W, H, o)

def tree():
    p = Pen(92, 1.2); W, H = 110, 200
    o = S(p.line((55, 198), (55, 110)), 3) + S(p.line((55, 140), (72, 122)), 2.4)
    blob = [(55, 30), (82, 40), (96, 68), (88, 100), (60, 116), (30, 108), (16, 80), (26, 46)]
    o += FS(p.curve(blob, True, 1.2), '#c6ee9c')
    o += S(p.line((44, 198), (66, 198)), 2.6)
    save('prop-tree', W, H, o)

def sign_post():
    p = Pen(93, .5); W, H = 120, 210
    o = S(p.line((60, 208), (60, 40)), 3)
    o += FS(p.poly([(20, 40), (96, 40), (110, 54), (96, 68), (20, 68)], True, .3), '#f3c92f')
    o += S(p.line((48, 208), (72, 208)), 3)
    save('prop-signpost', W, H, o)

lamp(); tree(); sign_post()

SHOPS = [
 ('geotech', 'shop', '#f5da8c', '#f0662a'),
 ('bridging', 'warehouse', '#85ab9b', '#3355e6'),
 ('pressure-testing', 'kiosk', '#ffd5de', '#e8577f'),
 ('field-machinery', 'warehouse', '#f8c98d', '#111111'),
 ('cable-testing', 'shop', '#b5e3f7', '#3355e6'),
 ('pfc-panels', 'tower', '#efb5f4', '#f3c92f'),
 ('material-delivery', 'gable', '#f5da8c', '#e8577f'),
 ('welding', 'shop', '#ffd5de', '#f0662a'),
 ('elevator', 'tower', '#b5e3f7', '#2f7d4f'),
 ('tower-crane-foundations', 'gable', '#c6ee9c', '#f0662a'),
 ('concrete-testing', 'kiosk', '#e6e5e1', '#3355e6'),
 ('mr', 'warehouse', '#ffd5de', '#3355e6'),
 ('pep', 'tower', '#c6ee9c', '#2f7d4f'),
]
fn = dict(shop=shop, warehouse=warehouse, tower=tower, kiosk=kiosk, gable=gable)
for i, (sid, kind, col, acc) in enumerate(SHOPS):
    fn[kind]('bldg-' + sid, col, acc, 100 + i * 7)
print(len(os.listdir(OUT)), 'files')

# ---- MR / PEP window doodles, Woset line style ----
def doodle(sid, body):
    open(f'{OUT}/{sid}.svg', 'w').write(svg(260, 210, f'<g transform="translate(0 -12)">{body}</g>'))
p = Pen(201, 1.1)
o = S(p.line((50, 170), (200, 170)), 2.2) + S(p.rect(56, 156, 138, 12, 0, .3), 2.2)
for x, y, w, h in ((62, 106, 50, 50), (116, 116, 44, 40), (164, 126, 30, 30), (80, 66, 44, 40)):
    o += S(p.rect(x, y, w, h, 0, .5), 2.2) + S(p.line((x, y + h * .4), (x + w, y + h * .4), .2), 1.6)
o += F(p.rect(126, 74, 70, 10, 2), '#3355e6') + S(p.line((126, 80), (200, 70)), 2.2) + S(p.line((128, 92), (202, 82)), 2.2)
doodle('doodle-mr', o)
p = Pen(203, 1.1)
o = S(p.rect(78, 44, 104, 132, 6, .6), 2.2) + S(p.rect(108, 36, 44, 16, 3, .3), 2.2)
for i, (x0, w, c) in enumerate(((92, 40, '#2f7d4f'), (112, 46, '#f0662a'), (130, 36, '#3355e6'), (100, 58, None))):
    y = 70 + i * 22
    o += (F(p.rect(x0, y, w, 10, 2), c) if c else S(p.rect(x0, y, w, 10, 2, .3), 1.8))
o += S(p.curve([(196, 150), (206, 160), (226, 128)]), 3, '#2f7d4f')
doodle('doodle-pep', o)
