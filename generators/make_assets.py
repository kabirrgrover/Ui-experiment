import math, os
from sketch import *

OUT = 'project/assets'
C = dict(safety='#e05a22', hazard='#f5c518', blue='#2c5a9a', green='#3a7549', red='#c0392b',
         paper='#f6f2ea', concrete='#d9d4cc', steel='#9aa3ad', soil1='#d8b48a', soil2='#b98c62', soil3='#8c6646',
         t_blue='#cfe0f3', t_sage='#d3e8c6', t_peach='#f9d6c1', t_butter='#fbe8a6', t_blush='#f6d0d1', t_stone='#e6e1d8',
         white='#ffffff', glass='#b9ccd4')

def save(group, name, content):
    os.makedirs(f'{OUT}/{group}', exist_ok=True)
    open(f'{OUT}/{group}/{name}.svg', 'w').write(content)

S = lambda d, w=3.2, col=INK, fill='none': stroke(d, w, col, fill)

# ======================================================================
# SR type stickers: round die-cut + paper label tab
# ======================================================================
def sr_sticker(name, label, tint, art, seed):
    p = Pen(seed, .9)
    W, H = 260, 280
    body = diecut(p.ellipse(130, 118, 104, 104, amp=1.2), tint)
    body += art(p)
    # label tab
    tw = max(120, text_width(label, 27) + 34)
    tab = Pen(seed + 7, .6).rect(130 - tw / 2, 214, tw, 42, 3)
    body += f'<g transform="rotate(-3 130 235)">' + diecut(tab, '#fffdf8', border=0) + \
            f'<path d="{text(label, 130, 244, 27, seed=seed)}" fill="{INK}"/></g>'
    save('SR Types', name, svg(W, H, body, SHADOW))

def art_bridging(p):
    o = fillp(p.rect(56, 116, 148, 10), C['safety']) + S(p.rect(56, 116, 148, 10))
    o += S(p.curve([(62, 117), (96, 84), (130, 72), (164, 84), (198, 117)]))
    for x in (88, 109, 130, 151, 172):
        top = 117 - 45 * (1 - ((x - 130) / 68) ** 2)
        o += S(p.line((x, top + 2), (x, 116)), 2.4)
    for x in (70, 180):
        o += fillp(p.rect(x, 126, 12, 34), C['concrete']) + S(p.rect(x, 126, 12, 34), 2.6)
    o += S(p.curve([(52, 166), (75, 160), (100, 167), (125, 160), (150, 167), (175, 160), (208, 166)]), 2.6, C['blue'])
    o += S(p.curve([(78, 180), (105, 174), (130, 180), (155, 174), (182, 180)]), 2.6, C['blue'])
    return o

def art_geotech(p):
    o = ''
    bands = [(98, 122, C['soil1']), (122, 146, C['soil2']), (146, 174, C['soil3'])]
    for y0, y1, col in bands:
        top = [(58 + i * 18, y0 + (3 if i % 2 else -2)) for i in range(9)]
        bot = [(58 + i * 18, y1 + (2 if i % 2 else -2)) for i in reversed(range(9))]
        o += fillp(p.curve(top + bot, True, .4), col)
    o += S(p.curve([(58 + i * 18, 98 + (3 if i % 2 else -2)) for i in range(9)]), 3)
    o += S(p.curve([(58 + i * 18, 122 + (2 if i % 2 else -2)) for i in range(9)]), 2)
    o += S(p.curve([(58 + i * 18, 146 + (2 if i % 2 else -2)) for i in range(9)]), 2)
    for x, y in ((75, 112), (160, 108), (95, 136), (180, 134), (70, 160), (150, 162), (190, 158)):
        o += S(p.ellipse(x, y, 3.2, 2.4, amp=.3), 2)
    # derrick + drill string into the ground
    o += S(p.poly([(108, 98), (130, 42), (152, 98)]), 3)
    o += S(p.line((116, 78), (144, 78)), 2.4)
    o += fillp(p.rect(122, 36, 16, 10), C['safety']) + S(p.rect(122, 36, 16, 10), 2.4)
    o += S(p.line((130, 46), (130, 160)), 3.4)
    o += S(p.poly([(124, 160), (136, 166), (124, 172), (130, 178)]), 2.6)
    return o

def art_pressure(p):
    o = S(p.line((60, 170), (200, 170)), 3) + S(p.line((60, 182), (200, 182)), 3)
    o += fillp(p.rect(120, 146, 20, 24), C['steel']) + S(p.rect(120, 146, 20, 24), 2.6)
    o += fillp(p.ellipse(130, 96, 50, amp=.8), '#fffdf8') + S(p.ellipse(130, 96, 50, amp=.8), 3.4)
    o += S(p.ellipse(130, 96, 42, amp=.5), 1.6)
    for k in range(11):
        a = math.radians(135 + k * 27)
        r1 = 34 if k % 5 else 30
        o += S(p.line((130 + r1 * math.cos(a), 96 + r1 * math.sin(a)), (130 + 40 * math.cos(a), 96 + 40 * math.sin(a)), .2), 2.2)
    o += S(p.arc(130, 96, 37, 345, 405), 5, C['red'])
    a = math.radians(-30)
    o += S(p.line((130, 96), (130 + 32 * math.cos(a), 96 + 32 * math.sin(a)), .3), 3.2, C['safety'])
    o += fillp(p.ellipse(130, 96, 5, amp=.2), INK)
    o += f'<path d="{text("psi", 130, 128, 15, "mono", wobble=0)}" fill="{INK}"/>'
    return o

def art_machinery(p):
    o = fillp(p.rect(48, 140, 104, 24, 12), '#3b3431') + S(p.rect(48, 140, 104, 24, 12), 2.8)
    for x in (62, 84, 106, 128):
        o += fillp(p.ellipse(x + 4, 152, 6, amp=.3), C['steel'])
    o += fillp(p.rect(56, 106, 78, 34, 3), C['hazard']) + S(p.rect(56, 106, 78, 34, 3), 3)
    o += fillp(p.rect(62, 76, 36, 30, 3), C['hazard']) + S(p.rect(62, 76, 36, 30, 3), 3)
    o += fillp(p.rect(68, 82, 24, 18, 2), C['glass']) + S(p.rect(68, 82, 24, 18, 2), 2.2)
    o += S(p.line((76, 82), (86, 100)), 1.6, '#fff')
    arm = [(122, 110), (168, 60), (200, 112)]
    o += S(p.poly(arm), 11, INK) + S(p.poly(arm, amp=0), 6, C['hazard'])
    o += fillp(p.poly([(188, 108), (216, 112), (208, 136), (190, 130)], True), C['steel']) + S(p.poly([(188, 108), (216, 112), (208, 136), (190, 130)], True), 2.8)
    o += S(p.line((210, 136), (214, 142)), 2.4) + S(p.line((200, 134), (202, 141)), 2.4)
    return o

def art_cable(p):
    o = fillp(p.ellipse(100, 108, 44, amp=.8), C['safety']) + S(p.ellipse(100, 108, 44, amp=.8), 3.2)
    o += S(p.ellipse(100, 108, 30, amp=.6), 2) + fillp(p.ellipse(100, 108, 10, amp=.3), '#fffdf8') + S(p.ellipse(100, 108, 10, amp=.3), 2.6)
    for k in range(5):
        a = math.radians(18 + k * 72)
        o += S(p.line((100 + 12 * math.cos(a), 108 + 12 * math.sin(a)), (100 + 29 * math.cos(a), 108 + 29 * math.sin(a))), 2)
    o += S(p.curve([(132, 138), (150, 160), (172, 160), (184, 146)]), 4)
    o += fillp(p.rect(176, 128, 26, 20, 3), '#fffdf8') + S(p.rect(176, 128, 26, 20, 3), 2.8)
    o += S(p.line((184, 128), (184, 116)), 3) + S(p.line((194, 128), (194, 116)), 3)
    o += S(p.curve([(146, 62), (156, 50), (166, 62), (176, 74), (186, 62), (196, 50), (206, 62)]), 3, C['green'])
    return o

def art_delivery(p):
    o = S(p.line((44, 166), (216, 166), .5), 2.4)
    o += fillp(p.rect(54, 120, 104, 14), C['steel']) + S(p.rect(54, 120, 104, 14), 2.8)
    o += fillp(p.rect(60, 92, 44, 28), C['soil1']) + S(p.rect(60, 92, 44, 28), 2.6)
    o += S(p.line((60, 106), (104, 106)), 1.8) + S(p.line((82, 92), (82, 120)), 1.8)
    for y in (96, 106, 116):
        o += fillp(p.rect(108, y - 4, 46, 8), C['concrete']) + S(p.rect(108, y - 4, 46, 8), 2)
    o += fillp(p.poly([(158, 134), (158, 84), (188, 84), (206, 108), (206, 134)], True), C['blue'])
    o += S(p.poly([(158, 134), (158, 84), (188, 84), (206, 108), (206, 134)], True), 3)
    o += fillp(p.poly([(166, 92), (184, 92), (196, 108), (166, 108)], True), C['glass']) + S(p.poly([(166, 92), (184, 92), (196, 108), (166, 108)], True), 2.2)
    for x in (80, 118, 184):
        o += fillp(p.ellipse(x, 146, 15, amp=.5), INK) + fillp(p.ellipse(x, 146, 6, amp=.3), C['steel'])
    return o

def art_welding(p):
    o = fillp(p.rect(52, 150, 60, 14), C['steel']) + S(p.rect(52, 150, 60, 14), 2.6)
    o += fillp(p.rect(114, 150, 60, 14), C['steel']) + S(p.rect(114, 150, 60, 14), 2.6)
    o += S(p.curve([(98, 150), (104, 147), (110, 151), (116, 147), (122, 150)]), 3.4, C['safety'])
    o += S(p.line((124, 138), (166, 84)), 10, INK) + S(p.line((124, 138), (166, 84), 0), 5, C['blue'])
    o += S(p.line((166, 84), (196, 46)), 16, INK) + S(p.line((166, 84), (196, 46), 0), 11, C['hazard'])
    o += S(p.line((116, 146), (124, 138)), 4)
    for k, ln in zip(range(9), (22, 14, 26, 16, 20, 12, 24, 15, 18)):
        a = math.radians(190 + k * 20)
        cx, cy = 110, 146
        o += S(p.line((cx + 8 * math.cos(a), cy + 8 * math.sin(a)), (cx + (8 + ln) * math.cos(a), cy + (8 + ln) * math.sin(a)), .2), 2.6, C['safety'] if k % 2 else C['hazard'])
    for x, y in ((72, 118), (88, 100), (138, 112), (66, 134)):
        o += fillp(p.ellipse(x, y, 2.6, amp=.2), C['safety'])
    return o

def art_pfc(p):
    o = fillp(p.rect(82, 50, 96, 122, 4), C['t_stone']) + S(p.rect(82, 50, 96, 122, 4), 3.2)
    o += S(p.line((130, 54), (130, 168)), 2)
    o += fillp(p.rect(92, 62, 30, 22, 2), '#fffdf8') + S(p.rect(92, 62, 30, 22, 2), 2.2)
    o += S(p.arc(107, 82, 11, 200, 340), 1.8) + S(p.line((107, 80), (114, 70)), 2, C['red'])
    for y in (100, 108, 116):
        o += S(p.line((94, y), (120, y)), 2)
    bolt = [(152, 68), (140, 98), (152, 98), (144, 126), (166, 90), (154, 90), (162, 68)]
    o += fillp(p.poly(bolt, True, .4), C['hazard']) + S(p.poly(bolt, True, .4), 2.6)
    o += S(p.line((124, 134), (124, 148)), 3.2) + S(p.line((136, 134), (136, 148)), 3.2)
    for x in (92, 108, 152, 168):
        o += S(p.line((x, 156), (x + 6, 156)), 2)
    o += S(p.line((88, 172), (88, 182)), 3) + S(p.line((172, 172), (172, 182)), 3)
    return o

def art_elevator(p):
    o = fillp(p.rect(76, 46, 108, 130, 3), C['t_stone']) + S(p.rect(76, 46, 108, 130, 3), 3.2)
    o += fillp(p.rect(88, 72, 70, 104), C['steel']) + S(p.rect(88, 72, 70, 104), 2.8)
    o += S(p.line((123, 72), (123, 176)), 2.6)
    o += fillp(p.rect(108, 52, 30, 14, 2), INK)
    o += f'<path d="{text("03", 123, 63, 12, "mono", wobble=0)}" fill="{C["hazard"]}"/>'
    o += fillp(p.rect(164, 104, 14, 34, 3), '#fffdf8') + S(p.rect(164, 104, 14, 34, 3), 2.2)
    o += fillp(p.poly([(171, 108), (176, 116), (166, 116)], True, .1), C['green'])
    o += fillp(p.poly([(171, 134), (176, 126), (166, 126)], True, .1), INK)
    o += S(p.line((100, 120), (112, 120)), 2, '#fff') + S(p.line((134, 120), (146, 120)), 2, '#fff')
    return o

def art_crane(p):
    o = S(p.line((44, 170), (216, 170), .5), 2.4)
    o += fillp(p.rect(88, 140, 60, 30), C['concrete']) + S(p.rect(88, 140, 60, 30), 3)
    for x in (98, 112, 126, 138):
        o += fillp(p.ellipse(x, 156, 2.4, amp=.1), INK)
    o += S(p.line((110, 140), (110, 64)), 3) + S(p.line((126, 140), (126, 64)), 3)
    for y in range(140, 66, -14):
        o += S(p.line((110, y), (126, y - 14), .2), 1.8)
    o += S(p.line((54, 64), (210, 64)), 3) + S(p.line((126, 52), (210, 64)), 2.4) + S(p.line((110, 52), (54, 64)), 2.4)
    o += S(p.poly([(110, 64), (118, 36), (126, 64)]), 2.8)
    for x in range(132, 206, 14):
        o += S(p.line((x, 64), (x + 7, 58), .1), 1.6)
    o += fillp(p.rect(56, 64, 26, 18, 2), C['safety']) + S(p.rect(56, 64, 26, 18, 2), 2.6)
    o += S(p.line((188, 64), (188, 104)), 2.2) + S(p.arc(192, 108, 5, 180, 400), 2.6)
    o += fillp(p.rect(176, 108, 24, 0.1), INK)
    return o

def art_concrete(p):
    o = S(p.line((130, 28), (130, 50)), 3.2, C['safety']) + S(p.poly([(122, 42), (130, 52), (138, 42)]), 3.2, C['safety'])
    body = p.curve([(98, 70), (98, 110), (98, 150)])
    shape = [(98, 70), (98, 150), (110, 159), (130, 161), (150, 159), (162, 150), (162, 70)]
    o += fillp(p.poly(shape, True, .4), C['concrete'])
    o += S(p.line((98, 70), (98, 150))) + S(p.line((162, 70), (162, 150)))
    o += S(p.arc(130, 150, 32, 0, 180, 10))
    o += fillp(p.ellipse(130, 70, 32, 9, amp=.4), '#c7c0b5') + S(p.ellipse(130, 70, 32, 9, amp=.4), 3)
    o += S(p.poly([(118, 82), (126, 100), (116, 114), (128, 132), (122, 148)], amp=.3), 2.2)
    for x, y in ((140, 96), (148, 120), (110, 126), (150, 140), (138, 112)):
        o += fillp(p.ellipse(x, y, 2.2, amp=.1), '#8b8378')
    o += f'<path d="{text("MPa", 186, 112, 15, "mono", wobble=0)}" fill="{INK}"/>'
    o += S(p.line((172, 90), (200, 90)), 2) + S(p.line((172, 120), (200, 120)), 2)
    return o

SR = [
    ('bridging', 'bridging', C['t_blue'], art_bridging),
    ('geotech', 'geotech', C['t_butter'], art_geotech),
    ('pressure-testing', 'pressure testing', C['t_peach'], art_pressure),
    ('field-machinery', 'field machinery', C['t_sage'], art_machinery),
    ('cable-testing', 'cable testing', C['t_butter'], art_cable),
    ('material-delivery', 'material delivery', C['t_peach'], art_delivery),
    ('welding', 'welding', C['t_blush'], art_welding),
    ('pfc-panels', 'PFC panels', C['t_blue'], art_pfc),
    ('elevator', 'elevator', C['t_sage'], art_elevator),
    ('tower-crane-foundations', 'tower crane footing', C['t_butter'], art_crane),
    ('concrete-testing', 'concrete testing', C['t_stone'], art_concrete),
]
for i, (n, l, t, a) in enumerate(SR):
    sr_sticker(n, l, t, a, 11 + i * 3)

# ======================================================================
# Rubber stamps (ink only, grunge mask)
# ======================================================================
GRUNGE = ('<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="{seed}" result="n"/>'
          '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.95" result="m"/>'
          '<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>')

def stamp(name, words, col, seed, sub=None):
    p = Pen(seed, .7)
    tw = max(text_width(words, 40, 'mono', 2), text_width(sub, 13, 'mono', 1.5) if sub else 0)
    W = int(tw + 70); H = 120 if not sub else 132
    d = p.rect(10, 12, W - 20, H - 24, 10, .6)
    d2 = p.rect(18, 20, W - 36, H - 40, 6, .5)
    o = S(d, 5, col) + S(d2, 2, col)
    o += f'<path d="{text(words, W / 2, 75 if not sub else 70, 40, "mono", wobble=1.2, seed=seed, track=2)}" fill="{col}"/>'
    if sub:
        o += f'<path d="{text(sub, W / 2, 96, 13, "mono", wobble=.6, seed=seed, track=1.5)}" fill="{col}"/>'
    body = f'<g filter="url(#g)" transform="rotate(-5 {W/2} {H/2})">{o}</g>'
    save('Stamps', name, svg(W, H, body, GRUNGE.format(seed=seed)))

stamp('draft', 'DRAFT', '#665d55', 3, 'NOT FOR CONSTRUCTION')
stamp('for-review', 'FOR REVIEW', C['safety'], 5)
stamp('approved', 'APPROVED', C['green'], 7)
stamp('on-hold', 'ON HOLD', C['red'], 9)
stamp('revised', 'REVISED', C['blue'], 11, 'SEE REV CLOUDS')
stamp('ifc', 'IFC', INK, 13, 'ISSUED FOR CONSTRUCTION')

# ======================================================================
# Doc type name tags
# ======================================================================
def tag(name, code, long, col, on, seed):
    p = Pen(seed, .7)
    W, H = 320, 210
    shape = p.rect(14, 14, W - 28, H - 28, 14, .8)
    o = diecut(shape, '#fffdf8')
    band = p.poly([(16, 64), (W - 16, 64)], amp=.6)
    o += f'<clipPath id="c"><path d="{shape}"/></clipPath>'
    o += f'<g clip-path="url(#c)"><rect x="0" y="0" width="{W}" height="64" fill="{col}"/>' + S(band, 2.6) + '</g>'
    o += S(shape, 2.6)
    o += f'<path d="{text("HELLO, I\'M", W / 2, 50, 26, "mono", wobble=0, track=2)}" fill="{on}"/>'
    o += f'<path d="{text(code, W / 2, 140, 64, "gochi", wobble=3, seed=seed)}" fill="{INK}"/>'
    o += f'<path d="{text(long, W / 2, 172, 18, "coming", wobble=1, seed=seed)}" fill="#665d55"/>'
    save('Doc Tags', name, svg(W, H, f'<g transform="rotate(-2 {W/2} {H/2})">{o}</g>', SHADOW))

tag('sr', 'SR', 'service requisition', C['safety'], INK, 21)
tag('mr', 'MR', 'material requisition', C['blue'], '#ffffff', 23)
tag('pep', 'PEP', 'project execution plan', C['green'], '#ffffff', 25)

# ======================================================================
# Slogan / mood stickers
# ======================================================================
def sticker_measure():
    p = Pen(31, .6); W, H = 420, 120
    shape = p.rect(16, 24, W - 32, 72, 4, .6)
    o = diecut(shape, C['hazard'])
    for i in range(0, 37):
        x = 30 + i * 10
        h = 18 if i % 5 == 0 else 9
        o += S(p.line((x, 96), (x, 96 - h), .1), 2)
    o += f'<path d="{text("measure twice, draft once", W / 2, 66, 30, seed=31)}" fill="{INK}"/>'
    save('Stickers', 'measure-twice', svg(W, H, f'<g transform="rotate(-3 {W/2} {H/2})">{o}</g>', SHADOW))

def sticker_hardhat():
    p = Pen(33, .9); W, H = 240, 240
    o = diecut(p.ellipse(120, 120, 98, amp=1.1), C['t_blue'])
    dome = [(56, 146), (60, 104), (84, 74), (120, 64), (156, 74), (180, 104), (184, 146)]
    o += fillp(p.curve(dome + [(120, 146)], True, .3), C['hazard']) + S(p.curve(dome, False, .5), 3.2)
    o += fillp(p.rect(40, 140, 160, 16, 8), C['hazard']) + S(p.rect(40, 140, 160, 16, 8), 3.2)
    o += S(p.curve([(120, 66), (116, 100), (120, 140)]), 2.6) + S(p.curve([(98, 70), (90, 104), (92, 140)]), 2) + S(p.curve([(142, 70), (150, 104), (148, 140)]), 2)
    o += f'<path d="{text("hard hats on", 120, 188, 23, seed=33)}" fill="{INK}"/>'
    save('Stickers', 'hard-hats-on', svg(W, H, o, SHADOW))

def sticker_rfi():
    p = Pen(35, 1); W, H = 220, 190
    bub = p.curve([(30, 90), (40, 40), (110, 24), (180, 40), (192, 90), (172, 130), (110, 142), (92, 140), (58, 172), (66, 134), (36, 120)], True, .4)
    o = diecut(bub, C['t_blush'])
    o += f'<path d="{text("RFI?", 112, 104, 58, seed=35)}" fill="{INK}"/>'
    save('Stickers', 'rfi', svg(W, H, o, SHADOW))

def sticker_specd():
    p = Pen(37, .5); W, H = 230, 230
    pts = []
    for k in range(28):
        r = 100 if k % 2 == 0 else 80
        a = math.radians(k * 360 / 28 - 90)
        pts.append((115 + r * math.cos(a), 115 + r * math.sin(a)))
    o = diecut(p.poly(pts, True, .3), C['safety'])
    o += f'<path d="{text("spec\'d!", 115, 130, 44, seed=37)}" fill="{INK}"/>'
    save('Stickers', 'specd', svg(W, H, f'<g transform="rotate(8 115 115)">{o}</g>', SHADOW))

def sticker_cone():
    p = Pen(39, .8); W, H = 240, 250
    o = diecut(p.rect(22, 18, 196, 214, 28, 1), C['t_stone'])
    cone = [(96, 52), (144, 52), (172, 166), (68, 166)]
    o += fillp(p.poly(cone, True, .4), C['safety'])
    for y0, y1 in ((84, 100), (122, 140)):
        l0 = 96 - (y0 - 52) * 28 / 114; r0 = 144 + (y0 - 52) * 28 / 114
        l1 = 96 - (y1 - 52) * 28 / 114; r1 = 144 + (y1 - 52) * 28 / 114
        o += fillp(p.poly([(l0, y0), (r0, y0), (r1, y1), (l1, y1)], True, .2), '#fffdf8')
    o += S(p.poly(cone, True, .4), 3.2)
    o += fillp(p.rect(52, 164, 136, 14, 3), C['safety']) + S(p.rect(52, 164, 136, 14, 3), 3.2)
    o += f'<path d="{text("drafting...", 120, 214, 28, seed=39)}" fill="{INK}"/>'
    save('Stickers', 'drafting-cone', svg(W, H, o, SHADOW))

def sticker_ibeam():
    p = Pen(41, .6); W, H = 300, 130
    shape = p.rect(16, 18, W - 32, 94, 47, .8)
    o = diecut(shape, C['t_sage'])
    beam = [(40, 46), (110, 46), (110, 52), (80, 52), (80, 78), (110, 78), (110, 84), (40, 84), (40, 78), (70, 78), (70, 52), (40, 52)]
    o += fillp(p.poly(beam, True, .2), C['steel']) + S(p.poly(beam, True, .2), 2.6)
    o += f'<path d="{text("built to spec", 190, 76, 28, seed=41)}" fill="{INK}"/>'
    save('Stickers', 'built-to-spec', svg(W, H, f'<g transform="rotate(-4 {W/2} {H/2})">{o}</g>', SHADOW))

def sticker_punch():
    p = Pen(43, .7); W, H = 230, 250
    o = diecut(p.rect(30, 24, 170, 200, 6, .9), '#fffdf8')
    o += fillp(p.rect(86, 14, 58, 22, 4), C['steel']) + S(p.rect(86, 14, 58, 22, 4), 2.6)
    o += f'<path d="{text("punch list", 115, 66, 28, seed=43)}" fill="{INK}"/>'
    for i, done in enumerate((True, True, False, False)):
        y = 98 + i * 30
        o += S(p.rect(50, y - 10, 18, 18, 2, .4), 2.4)
        if done:
            o += S(p.poly([(52, y), (58, y + 6), (72, y - 14)], amp=.3), 3, C['green'])
        o += S(p.line((80, y), (180 - i * 12, y), .5), 2.2, '#8a8076')
    save('Stickers', 'punch-list', svg(W, H, f'<g transform="rotate(3 115 125)">{o}</g>', SHADOW))

for f in (sticker_measure, sticker_hardhat, sticker_rfi, sticker_specd, sticker_cone, sticker_ibeam, sticker_punch):
    f()

# ======================================================================
# Doodles (single ink #1f1c19 unless noted), no die-cut
# ======================================================================
def doodle(name, W, H, body):
    save('Doodles', name, svg(W, H, body))

p = Pen(51, 1)
doodle('arrow-curve', 200, 120, S(p.curve([(16, 96), (60, 40), (120, 28), (176, 52)]), 3) + S(p.poly([(156, 34), (178, 52), (154, 66)], amp=.4), 3))
p = Pen(52, 1)
doodle('underline', 240, 40, S(p.curve([(10, 22), (70, 16), (130, 24), (190, 14), (230, 20)]), 3.4) + S(p.curve([(40, 32), (120, 27), (200, 30)]), 2.4))
p = Pen(53, 1.6)
doodle('circle-scribble', 240, 120, S(p.ellipse(120, 60, 106, 46, closed=False, overlap=.18, a0=3.6, amp=2.4), 3))
p = Pen(54, .6)
pts = [(60 + (46 if k % 2 == 0 else 19) * math.cos(math.radians(k * 36 - 90)), 60 + (46 if k % 2 == 0 else 19) * math.sin(math.radians(k * 36 - 90))) for k in range(10)]
doodle('star', 120, 120, S(p.poly(pts, True, .5), 3))
p = Pen(55, .6)
doodle('check', 120, 100, S(p.curve([(14, 54), (32, 70), (44, 86), (70, 50), (106, 14)]), 5, C['green']))
p = Pen(56, .6)
doodle('cross', 100, 100, S(p.line((18, 18), (82, 84)), 5, C['red']) + S(p.line((84, 16), (16, 80)), 5, C['red']))
p = Pen(57, .3)
doodle('asterisk', 100, 100, ''.join(S(p.line((50 - 38 * math.cos(math.radians(a)), 50 - 38 * math.sin(math.radians(a))), (50 + 38 * math.cos(math.radians(a)), 50 + 38 * math.sin(math.radians(a)))), 5) for a in (90, 30, 150)))
p = Pen(58, 1.5)
doodle('highlight-swash', 260, 60, f'<path d="{p.curve([(10, 20), (90, 12), (250, 16), (246, 46), (120, 48), (14, 44)], True, 1)}" fill="{C["hazard"]}" fill-opacity=".55"/>')
p = Pen(59, .5)
doodle('pushpin', 80, 110, S(p.line((40, 62), (40, 104)), 3) + fillp(p.rect(26, 54, 28, 10, 3), C['red']) + S(p.rect(26, 54, 28, 10, 3), 2.6) +
       fillp(p.curve([(28, 54), (24, 22), (40, 10), (56, 22), (52, 54)], True, .3), C['red']) + S(p.curve([(28, 54), (24, 22), (40, 10), (56, 22), (52, 54)], True, .3), 2.8) +
       S(p.curve([(34, 22), (38, 18)]), 3, '#fff'))
p = Pen(60, .8)
tape = [(8, 14), (30, 8), (60, 12), (100, 6), (140, 10), (170, 6), (174, 24), (168, 44), (130, 48), (90, 44), (50, 50), (12, 44), (16, 30)]
doodle('tape-strip', 182, 58, f'<path d="{p.poly(tape, True, .3)}" fill="{C["t_butter"]}" fill-opacity=".8" stroke="#d9c27a" stroke-width="1"/>')
p = Pen(61, .3)
doodle('paperclip', 60, 150, S(p.curve([(40, 40), (40, 120), (32, 138), (20, 138), (12, 120), (12, 26), (22, 10), (40, 10), (50, 26), (50, 112)], amp=.2), 3.4, '#7d8590'))
p = Pen(62, .4)
doodle('emphasis', 100, 100, S(p.line((50, 14), (52, 40)), 4) + S(p.line((20, 30), (34, 50)), 4) + S(p.line((82, 30), (68, 50)), 4))
print('done')
