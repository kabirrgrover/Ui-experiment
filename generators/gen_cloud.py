import math
from sketch import Pen, svg
K='#111111'
def cloud(name, seed, bumps):
    p = Pen(seed, .5)
    # bumps: list of (cx, r) along baseline y=B
    B = max(r for _, r in bumps) * 1.55 + 6
    pts = []
    x0 = bumps[0][0] - bumps[0][1]
    for i, (cx, r) in enumerate(bumps):
        cy = B - r * .55
        a0 = 180 if i == 0 else 200
        a1 = 360 if i == len(bumps) - 1 else 340
        for k in range(9):
            a = math.radians(a0 + (a1 - a0) * k / 8)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    x1 = bumps[-1][0] + bumps[-1][1]
    pts = [(x0, B)] + pts + [(x1, B)]
    d = p.curve(pts, amp=.5)
    W = int(x1 + 6); H = int(B + 6)
    o = f'<path d="{d} Z" fill="#ffffff" stroke="{K}" stroke-width="2.4" stroke-linejoin="round"/>'
    open(f'street/{name}.svg','w').write(svg(W, H, o))
cloud('sky-cloud-1', 311, [(30, 22), (66, 32), (104, 24), (132, 16)])
cloud('sky-cloud-2', 313, [(24, 16), (52, 24), (80, 15)])
cloud('sky-cloud-3', 317, [(30, 20), (64, 30), (102, 36), (140, 26), (168, 16)])
