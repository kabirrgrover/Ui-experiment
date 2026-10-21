import math, random
from sketch import Pen, svg
G = '#c9c7c1'   # pale pencil for distance
K = '#111111'
def S(d, w=2, col=G, fill='none'):
    return f'<path d="{d}" fill="{fill}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
out = 'street'
# skyline 1600 wide, 260 tall, ground at 258
p = Pen(301, .9); r = random.Random(4)
o = ''; x = 0
while x < 1600:
    kind = r.choice(['block', 'block', 'tower', 'crane', 'gap', 'tank'])
    if kind == 'gap':
        x += r.randint(20, 50); continue
    if kind == 'block':
        w = r.randint(70, 130); h = r.randint(60, 140)
        o += S(p.poly([(x, 258), (x, 258 - h), (x + w, 258 - h), (x + w, 258)], amp=.6))
        for k in range(r.randint(1, 3)):
            yy = 258 - h + 18 + k * 26
            o += S(p.line((x + 12, yy), (x + w - 12, yy), .3), 1.4)
        x += w
    elif kind == 'tower':
        w = r.randint(40, 60); h = r.randint(150, 210)
        o += S(p.poly([(x, 258), (x, 258 - h), (x + w / 2, 258 - h - 18), (x + w, 258 - h), (x + w, 258)], amp=.6))
        o += S(p.line((x + w / 2, 258 - h - 18), (x + w / 2, 258 - h - 40), .2), 1.6)
        x += w
    elif kind == 'tank':
        w = 70; h = 60
        o += S(p.poly([(x, 258), (x, 258 - h)], amp=.3)) + S(p.arc(x + w / 2, 258 - h, w / 2, 180, 360, 14)) + S(p.poly([(x + w, 258 - h), (x + w, 258)], amp=.3))
        x += w
    else:  # tower crane
        mx = x + 30; top = r.randint(20, 50)
        o += S(p.line((mx, 258), (mx, top)), 2) + S(p.line((mx + 12, 258), (mx + 12, top)), 2)
        for y in range(250, top, -18):
            o += S(p.line((mx, y), (mx + 12, y - 18), .1), 1.2)
        jl, jr = mx - 50, mx + 170
        o += S(p.line((jl, top), (jr, top)), 2) + S(p.line((mx + 6, top - 24), (jr, top), .2), 1.4) + S(p.line((mx + 6, top - 24), (jl, top), .2), 1.4)
        hook = mx + r.randint(90, 160)
        o += S(p.line((hook, top), (hook, top + r.randint(40, 90)), .1), 1.4)
        x += 90
    x += r.randint(6, 24)
o += S(p.line((0, 258), (1600, 258), .3), 1.6)
open(f'{out}/sky-skyline.svg', 'w').write(svg(1600, 262, o))
# clouds
def cloud(name, seed, w):
    p = Pen(seed, 1.2); h = w * .42
    pts = [(10, h - 8), (w * .12, h * .45), (w * .3, h * .3), (w * .42, h * .08), (w * .62, h * .12), (w * .74, h * .34), (w * .9, h * .38), (w - 10, h - 8)]
    d = p.curve(pts, amp=1)
    o = f'<path d="{d} Z" fill="#ffffff"/>' + S(d, 2.4, K) + S(p.line((4, h - 8), (w - 4, h - 8), .5), 2.4, K)
    open(f'{out}/{name}.svg', 'w').write(svg(int(w), int(h), o))
cloud('sky-cloud-1', 311, 170); cloud('sky-cloud-2', 313, 120); cloud('sky-cloud-3', 317, 210)
# sun
p = Pen(321, .6)
o = f'<path d="{p.ellipse(60, 60, 26, amp=.6)}" fill="#f3c92f" stroke="{K}" stroke-width="2.4"/>'
for k in range(10):
    a = math.radians(k * 36 + 8)
    o += S(p.line((60 + 36 * math.cos(a), 60 + 36 * math.sin(a)), (60 + 50 * math.cos(a), 60 + 50 * math.sin(a)), .2), 2.4, K)
open(f'{out}/sky-sun.svg', 'w').write(svg(120, 120, o))
# birds
p = Pen(331, .4)
o = ''.join(S(p.curve([(x, y), (x + 8, y - 6), (x + 14, y)]) + p.curve([(x + 14, y), (x + 20, y - 6), (x + 28, y)])[0:0], 2, K) + S(p.curve([(x + 14, y), (x + 20, y - 6), (x + 28, y)]), 2, K) for x, y in ((6, 20), (44, 12), (30, 34)))
open(f'{out}/sky-birds.svg', 'w').write(svg(80, 44, o))
