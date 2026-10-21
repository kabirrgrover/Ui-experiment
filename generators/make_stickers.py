"""Flat, happy sticker kit in the Sand Studio / DRAE OHARU style, with a site twist."""
import math, os, shutil
from sketch import *

K = '#111111'
C = dict(blue='#3355e6', cobalt='#2f4fb0', red='#d8392f', pink='#e8577f', heart='#dc4d6c', orange='#f0662a',
         flame='#fbcd3c', yellow='#f3c92f', lemon='#f1f06d', lime='#b8cf3b', green='#3b8a5a', purple='#a37ae6',
         lilac='#d9ccf6', sage='#e3f6c4', teal='#1f5c57', white='#ffffff', smile='#f7d23e', mint='#cdeee0')
OUT = 'project/assets/Stickers'
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
n_saved = []

def save(name, w, h, body, rot=0):
    g = f'<g transform="rotate({rot} {w/2} {h/2})">{body}</g>' if rot else body
    open(f'{OUT}/{name}.svg', 'w').write(svg(w, h, g, SHADOW)); n_saved.append(name)

def cut(d, fill, border=9, line=None, lw=3):
    o = f'<g filter="url(#s)"><path d="{d}" fill="#fff" stroke="#fff" stroke-width="{border*2}" stroke-linejoin="round"/></g>'
    o += f'<path d="{d}" fill="{fill}"' + (f' stroke="{line}" stroke-width="{lw}" stroke-linejoin="round"' if line else '') + '/>'
    return o

def T(s, x, y, size, f, col, anchor='middle', track=0, wob=0, seed=1):
    return f'<path d="{text(s, x, y, size, f, anchor=anchor, wobble=wob, seed=seed, track=track)}" fill="{col}"/>'

def fit(s, f, maxw, size, track=0):
    w = text_width(s, size, f, track)
    return size if w <= maxw else size * maxw / w

def rr(x, y, w, h, r):  # crisp rounded rect path
    return f'M{x+r} {y}H{x+w-r}A{r} {r} 0 0 1 {x+w} {y+r}V{y+h-r}A{r} {r} 0 0 1 {x+w-r} {y+h}H{x+r}A{r} {r} 0 0 1 {x} {y+h-r}V{y+r}A{r} {r} 0 0 1 {x+r} {y}Z'

def oval(cx, cy, rx, ry):
    return f'M{cx-rx} {cy}A{rx} {ry} 0 1 0 {cx+rx} {cy}A{rx} {ry} 0 1 0 {cx-rx} {cy}Z'

def star(cx, cy, r1, r2, n, rot=-90, round_=0):
    pts = []
    for k in range(n * 2):
        r = r1 if k % 2 == 0 else r2
        a = math.radians(rot + k * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'

def sparkle(cx, cy, r, col):
    p = f'M{cx} {cy-r} Q{cx+r*.18} {cy-r*.18} {cx+r} {cy} Q{cx+r*.18} {cy+r*.18} {cx} {cy+r} Q{cx-r*.18} {cy+r*.18} {cx-r} {cy} Q{cx-r*.18} {cy-r*.18} {cx} {cy-r}Z'
    return f'<path d="{p}" fill="{col}"/>'

def asterisk(cx, cy, r, col, w=None):
    w = w or r * .42
    return ''.join(f'<line x1="{cx - r*math.cos(math.radians(a)):.1f}" y1="{cy - r*math.sin(math.radians(a)):.1f}" x2="{cx + r*math.cos(math.radians(a)):.1f}" y2="{cy + r*math.sin(math.radians(a)):.1f}" stroke="{col}" stroke-width="{w:.1f}" stroke-linecap="round"/>' for a in (90, 30, 150))

def globe(cx, cy, r, col, w=None, fill='none'):
    w = w or r * .12
    s = f'stroke="{col}" stroke-width="{w:.1f}" fill="none"'
    o = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{col}" stroke-width="{w:.1f}"/>'
    o += f'<ellipse cx="{cx}" cy="{cy}" rx="{r*.45:.1f}" ry="{r}" {s}/><line x1="{cx}" y1="{cy-r}" x2="{cx}" y2="{cy+r}" {s}/>'
    for k in (-.5, 0, .5):
        hw = r * math.sqrt(1 - k * k)
        o += f'<line x1="{cx-hw:.1f}" y1="{cy+k*r:.1f}" x2="{cx+hw:.1f}" y2="{cy+k*r:.1f}" {s}/>'
    return o

def eyes(cx, cy, r, gap, look=(.25, .1)):
    o = ''
    for dx in (-gap / 2, gap / 2):
        o += f'<ellipse cx="{cx+dx}" cy="{cy}" rx="{r}" ry="{r*1.15:.1f}" fill="#fff" stroke="{K}" stroke-width="{r*.28:.1f}"/>'
        o += f'<circle cx="{cx+dx+r*look[0]:.1f}" cy="{cy+r*look[1]:.1f}" r="{r*.5:.1f}" fill="{K}"/>'
    return o

def peace(x, y, s, fill, line):
    """Peace-sign hand at (x,y) top-left, scale s (base ~ 120x160)."""
    def R(x0, y0, w, h, r, rot=0, cx=None, cy=None):
        t = f' transform="rotate({rot} {cx} {cy})"' if rot else ''
        return f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="{r}"{t}/>'
    shapes = (R(14, 8, 30, 92, 15, -14, 29, 100) + R(52, 6, 30, 92, 15, 12, 67, 98) +
              R(10, 76, 96, 72, 26) + R(-8, 92, 64, 30, 15, -18, 24, 107))
    curls = (f'<path d="M58 104 q20 -6 36 4" /><path d="M56 122 q22 -6 40 4" /><path d="M24 112 q14 -2 26 -12" />')
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<g fill="{line}" stroke="{line}" stroke-width="14" stroke-linejoin="round">{shapes}</g>'
            f'<g fill="#fff" stroke="#fff" stroke-width="0">{shapes}</g>'
            f'<g fill="{fill}">{shapes}</g>'
            f'<g fill="none" stroke="{line}" stroke-width="7" stroke-linecap="round">{curls}</g></g>')

def peace_sticker(name, fill, line, rot):
    W, H = 200, 230
    hand = peace(36, 30, 1.0, fill, line)
    halo = peace(36, 30, 1.0, '#fff', '#fff').replace('stroke-width="14"', 'stroke-width="34"')
    save(name, W, H, f'<g filter="url(#s)">{halo}</g>' + hand, rot)

# 1 blue oval, serif + italic (anti-social but user-friendly)
W, H = 380, 190
o = cut(oval(190, 95, 170, 76), C['blue'])
o += T('measure twice,', 190, 88, 40, 'serif', '#fff')
o += T('draft once', 190, 132, 52, 'serifi', '#fff')
save('measure-twice', W, H, o, -6)

# 2 eyes blob
W, H = 220, 160
o = cut(rr(18, 18, 184, 124, 62), K)
for dx in (68, 152):
    o += f'<circle cx="{dx}" cy="80" r="34" fill="#fff"/><circle cx="{dx+4}" cy="84" r="18" fill="{K}"/>'
save('eyes', W, H, o, -4)

# 3 Out on Site with selection handles
W, H = 360, 120
o = cut('M20 22H340V98H20Z', '#fff')
o += T('Out on Site', 180, 76, 44, 'sans5', K)
o += f'<rect x="38" y="34" width="284" height="52" fill="none" stroke="#7b5cf0" stroke-width="2"/>'
for x, y in ((38, 34), (322, 34), (38, 86), (322, 86)):
    o += f'<rect x="{x-6}" y="{y-6}" width="12" height="12" fill="#fff" stroke="#7b5cf0" stroke-width="2"/>'
save('out-on-site', W, H, o, 0)

# 4 traffic cone (the flame)
W, H = 190, 230
cone = 'M78 30 Q95 18 112 30 L150 178 H40 Z'
o = cut(cone + 'M22 176 H168 Q178 176 178 186 V196 Q178 206 168 206 H22 Q12 206 12 196 V186 Q12 176 22 176Z', C['orange'])
o += '<path d="M66 78 H124 L132 110 H58Z M52 132 H138 L145 160 H45Z" fill="#fff"/>'
save('cone', W, H, o, 8)

# 5 hard hat with googly eyes (the globe)
W, H = 260, 220
hat = 'M38 150 Q36 62 130 52 Q224 62 222 150 Z'
brim = rr(18, 146, 224, 28, 14)
o = f'<g filter="url(#s)"><path d="{hat}{brim}" fill="#fff" stroke="#fff" stroke-width="20" stroke-linejoin="round"/></g>'
o += f'<path d="{hat}" fill="{C["flame"]}" stroke="{C["cobalt"]}" stroke-width="6" stroke-linejoin="round"/>'
o += f'<path d="M130 54 V146 M96 60 Q86 100 90 146 M164 60 Q174 100 170 146" fill="none" stroke="{C["cobalt"]}" stroke-width="5" stroke-linecap="round"/>'
o += f'<path d="{brim}" fill="{C["flame"]}" stroke="{C["cobalt"]}" stroke-width="6"/>'
o += eyes(150, 112, 22, 50)
save('hard-hat-eyes', W, H, o, 6)

# 6 globe with eyes (kept, it's good)
W, H = 240, 220
o = f'<g filter="url(#s)"><circle cx="110" cy="110" r="96" fill="#fff"/></g>'
o += globe(110, 110, 84, C['blue'], 8, '#fff')
o += eyes(150, 104, 22, 46)
save('globe-eyes', W, H, o, 0)

# 7 heart with hex nut
W, H = 230, 210
hp = 'M115 186 C40 136 14 98 26 62 C38 26 88 22 115 58 C142 22 192 26 204 62 C216 98 190 136 115 186Z'
o = cut(hp, C['heart'])
nut = ''.join(f'{"M" if k==0 else "L"}{115+38*math.cos(math.radians(k*60)):.1f} {96+38*math.sin(math.radians(k*60)):.1f}' for k in range(6)) + 'Z'
o += f'<path d="{nut}" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><circle cx="115" cy="96" r="15" fill="none" stroke="#fff" stroke-width="9"/>'
save('heart-nut', W, H, o, -8)

# 8 HELLO I'M name tags (SR / MR / PEP)
def hello(name, script, col, rot):
    W, H = 400, 230
    o = cut(rr(20, 20, 360, 190, 14), col)
    o += f'<rect x="38" y="76" width="324" height="116" rx="6" fill="#fff"/>'
    o += T("HELLO, I'M", 44, 60, 28, 'sans7', '#fff', anchor='start', track=1.5)
    sz = fit(script, 'script', 290, 62)
    o += T(script, 200, 156, sz, 'script', K, wob=1.5, seed=3)
    save(name, W, H, o, rot)
hello('hello-sr', 'Service Req.', C['red'], -6)
hello('hello-mr', 'Material Req.', C['blue'], 4)
hello('hello-pep', 'Execution Plan', C['green'], -3)

# 9 peace hands
peace_sticker('peace-lilac', C['lilac'], '#3b2f6b', -10)
peace_sticker('peace-lemon', C['lemon'], C['teal'], 12)
peace_sticker('peace-teal', C['teal'], '#ffffff', -4)

# 10 "AI Docbuilder" word sticker (Sand Studio)
W, H = 360, 170
words = T('AI', 28, 72, 58, 'sans5', K, anchor='start') + T('Docbuilder', 28, 132, 58, 'sans5', K, anchor='start')
o = f'<g filter="url(#s)"><g stroke="#fff" stroke-width="22" stroke-linejoin="round" fill="#fff">{words.replace(chr(34)+K+chr(34), chr(34)+"#fff"+chr(34))}</g></g>' + words
save('docbuilder-word', W, H, o, 0)

# 11 circular badge
W, H = 260, 260
o = cut(oval(130, 130, 116, 116), '#fbfbfa')
o += f'<path d="{text_circle("AI Docbuilder & Co. · drafting since 2026 · ", 130, 130, 84, 26, "sans5", start=-90, spread=360)}" fill="{K}"/>'
o += sparkle(130, 130, 26, C['orange'])
save('circle-badge', W, H, o, 10)

# 12 I <3 MY SITE
W, H = 330, 200
heart = 'M0 14 C-12 4 -26 -6 -26 -20 C-26 -34 -6 -40 0 -26 C6 -40 26 -34 26 -20 C26 -6 12 4 0 14Z'
g = (T('I', 128, 96, 84, 'black', K) + f'<path d="{heart}" transform="translate(205 74) scale(1.6)" fill="{C["red"]}"/>' +
     T('MY SITE', 165, 168, 62, 'black', K))
halo = g.replace(f'fill="{K}"', 'fill="#fff" stroke="#fff" stroke-width="20" stroke-linejoin="round"').replace(f'fill="{C["red"]}"', 'fill="#fff" stroke="#fff" stroke-width="12" stroke-linejoin="round"')
save('i-heart-my-site', W, H, f'<g filter="url(#s)">{halo}</g>' + g, 0)

# 13 Engineer pill with cursor
W, H = 290, 160
o = cut(rr(46, 56, 220, 74, 37), '#fff', line='#555', lw=3)
o += T('Engineer', 156, 106, 34, 'sans5', K)
cur = 'M22 14 L22 62 L34 50 L44 72 L52 68 L42 47 L58 46Z'
o += f'<g filter="url(#s)"><path d="{cur}" fill="#fff" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></g><path d="{cur}" fill="{K}"/>'
save('engineer-pill', W, H, o, -3)

# 14 Professional Spec Checker (lime oval)
W, H = 380, 170
o = cut(oval(190, 85, 172, 66), C['sage'])
o += T('Professional', 190, 72, 30, 'caveat', K, wob=1)
o += T('Spec Checker', 190, 118, 44, 'serif', K)
save('spec-checker', W, H, o, -5)

# 15 yellow "Please torque to spec" pixel card
W, H = 330, 230
o = cut(rr(20, 20, 290, 190, 20), C['lemon'], line=K, lw=4)
o += T('Please', 46, 76, 30, 'sans5', K, anchor='start')
o += T('torque to spec', 46, 112, 30, 'sans5', K, anchor='start')
o += T('50 kN·m', 46, 172, 34, 'pixel', K, anchor='start')
save('torque-to-spec', W, H, o, -8)

# 16 orange ticket SAFETY OVER SPEED
W, H = 330, 150
tk = 'M24 30 H306 V62 A14 14 0 0 0 306 88 V120 H24 V88 A14 14 0 0 0 24 62 Z'
o = cut(tk, C['orange'])
for i, l in enumerate(('SAFETY', 'OVER SPEED')):
    o += T(l, 50, 70 + i * 32, 26, 'sans7', K, anchor='start', track=.5)
o += f'<path d="M246 98 Q246 66 268 64 Q290 66 290 98 Z M238 98 H298" fill="none" stroke="{K}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>'
save('safety-over-speed', W, H, o, -4)

# 17 pink rect DRAFT. REVIEW. ISSUE.
W, H = 320, 220
o = cut(rr(20, 20, 280, 180, 16), C['pink'])
for i, l in enumerate(('DRAFT.', 'REVIEW.', 'ISSUE.')):
    o += T(l, 46, 72 + i * 42, 38, 'sans7', '#fff', anchor='start')
o += asterisk(252, 162, 20, K)
save('draft-review-issue', W, H, o, 3)

# 18 blue starburst SPEC'D & SIGNED.
W, H = 270, 270
o = cut(star(135, 135, 122, 92, 14, round_=1), C['cobalt'])
for i, l in enumerate(("SPEC'D", '& SIGNED.')):
    o += T(l, 135, 128 + i * 34, 30, 'sans7', '#fff')
save('specd-signed', W, H, o, -10)

# 19 green oval circular SITE MODE
W, H = 330, 240
o = cut(oval(165, 120, 148, 102), C['green'])
o += f'<path d="{text_circle("SITE MODE · SITE MODE · SITE MODE · SITE MODE · ", 165, 120, 84, 15, "sans5", spread=360, start=-90)}" fill="#fff" transform="translate(165 120) scale(1.5 1.04) translate(-165 -120)"/>'
o += sparkle(165, 120, 22, '#fff')
save('site-mode', W, H, o, -6)

# 20 yellow circle with peel GOOD DOCS SHIP FIRST.
W, H = 250, 250
circ = oval(125, 125, 108, 108)
o = f'<g filter="url(#s)"><path d="{circ}" fill="#fff" stroke="#fff" stroke-width="18"/></g><path d="{circ}" fill="{C["yellow"]}"/>'
o += f'<path d="M36 72 A108 108 0 0 1 72 34 L70 82 Z" fill="#fff"/><path d="M36 72 L70 82 L72 34 Q44 40 36 72Z" fill="#e8e3d6" stroke="#cfc8b6" stroke-width="1.5"/>'
o += f'<circle cx="125" cy="125" r="84" fill="none" stroke="{K}" stroke-width="2.5"/>'
for i, l in enumerate(('GOOD DOCS', 'SHIP', 'FIRST.')):
    o += T(l, 125, 122 + i * 28, 22, 'sans7', K)
o += asterisk(125, 88, 11, K, 5)
save('good-docs-ship-first', W, H, o, -12)

# 21 lime DON'T JUST SPEC, BUILD. with coil
W, H = 330, 190
o = cut(rr(20, 20, 290, 150, 10), C['lime'])
for i, l in enumerate(("DON'T JUST", 'SPEC,', 'BUILD.')):
    o += T(l, 42, 66 + i * 36, 32, 'sans7', K, anchor='start')
for k in range(8):
    o += f'<ellipse cx="258" cy="{56 + k*10}" rx="26" ry="7" fill="none" stroke="{K}" stroke-width="3"/>'
o += globe(204, 140, 13, K, 2.6)
save('dont-just-spec', W, H, o, 4)

# 22 blue arch BUILD THE THING YOU DREW.
W, H = 230, 300
arch = 'M24 276 V110 A91 91 0 0 1 206 110 V276 Z'
o = f'<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C["cobalt"]}"/><stop offset="1" stop-color="#7d9be8"/></linearGradient></defs>'
o += cut(arch, 'url(#ag)')
o += globe(115, 74, 20, '#fff', 3.2)
for i, l in enumerate(('BUILD THE', 'THING YOU', 'DREW.')):
    o += T(l, 115, 150 + i * 34, 30, 'sans7', '#fff')
o += sparkle(115, 246, 16, '#fff')
save('build-what-you-drew', W, H, o, -5)

# 23 pink oval TURN NOTES INTO SRs.
W, H = 300, 190
o = cut(oval(150, 95, 132, 76), C['pink'])
for i, l in enumerate(('TURN', 'NOTES', 'INTO SRs.')):
    o += T(l, 66, 74 + i * 30, 26, 'sans7', K, anchor='start')
o += asterisk(222, 70, 13, K, 6)
save('turn-notes-into-srs', W, H, o, 8)

# 24 draft draft redraft? (text only)
W, H = 300, 210
g = ''.join(T(l, 30, 62 + i * 58, 58 if i < 2 else 52, 'serifi', '#6f9f7b', anchor='start') for i, l in enumerate(('draft', 'draft', 'redraft?')))
halo = g.replace('fill="#6f9f7b"', 'fill="#fff" stroke="#fff" stroke-width="18" stroke-linejoin="round"')
save('draft-draft-redraft', W, H, f'<g filter="url(#s)">{halo}</g>' + g, -6)

# 25 MAKE IT CLEAR block
W, H = 330, 300
o = cut('M20 20H310V280H20Z', '#fff')
for i, l in enumerate(('MAKE', 'IT CLEAR,', 'BUT, MAKE', 'IT BUILD-', 'ABLE.')):
    o += T(l, 40, 70 + i * 50, 46, 'sans7', K, anchor='start')
save('make-it-clear', W, H, o, 0)

# 26 hazard checker strip
W, H = 380, 140
o = cut('M20 30H360V110H20Z', '#fff')
for i in range(8):
    for j in range(2):
        if (i + j) % 2 == 0:
            o += f'<rect x="{20 + i*42.5:.1f}" y="{30 + j*40}" width="42.5" height="40" fill="{K}"/>'
save('checker', W, H, o, 10)

# 27 hazard tape strip
W, H = 400, 110
o = cut('M14 24H386V86H14Z', C['flame'])
o += '<clipPath id="ht"><path d="M14 24H386V86H14Z"/></clipPath><g clip-path="url(#ht)">'
for i in range(-2, 16):
    x = 14 + i * 34
    o += f'<path d="M{x} 86 L{x+28} 24 H{x+45} L{x+17} 86Z" fill="{K}"/>'
o += '</g>'
save('hazard-tape', W, H, o, -7)

# 28 smiley, 29 purple burst, 30 orange sparkle, 31 black asterisk
W, H = 200, 200
o = cut(oval(100, 100, 84, 84), C['smile'])
o += f'<ellipse cx="74" cy="80" rx="7" ry="11" fill="{K}"/><ellipse cx="126" cy="80" rx="7" ry="11" fill="{K}"/>'
o += f'<path d="M58 112 Q100 156 142 112" fill="none" stroke="{K}" stroke-width="7" stroke-linecap="round"/>'
save('smiley', W, H, o, 12)
o = cut(star(110, 110, 96, 42, 9), C['purple'])
save('burst-purple', 220, 220, o, 8)
W, H = 150, 150
p = 'M75 14 Q84 66 136 75 Q84 84 75 136 Q66 84 14 75 Q66 66 75 14Z'
save('sparkle-orange', W, H, cut(p, C['orange']), 15)
ast = ''.join(f'<rect x="88" y="16" width="34" height="88" rx="10" transform="rotate({a} 105 105)"/>' for a in (0, 60, 120, 180, 240, 300))
o = f'<g filter="url(#s)" fill="#fff" stroke="#fff" stroke-width="18" stroke-linejoin="round">{ast}</g><g fill="{K}">{ast}</g>'
save('asterisk-black', 210, 210, o, 10)

# 32 RFI? speech bubble (keep idea, flat)
W, H = 240, 200
bub = 'M40 30 H200 Q222 30 222 52 V120 Q222 142 200 142 H104 L62 178 L70 142 H40 Q18 142 18 120 V52 Q18 30 40 30Z'
o = cut(bub, '#fff', line=K, lw=4)
o += T('RFI?', 120, 112, 62, 'black', K)
save('rfi', W, H, o, -6)

exec(open('tools_part.py').read())
print(len(n_saved), 'stickers')
