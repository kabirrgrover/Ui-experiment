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

K='#111111'
KEEP={C['safety'],C['hazard'],C['blue'],C['red'],C['green'],INK}
S = lambda d, w=3.2, col=INK, fill='none': stroke(d, max(1.6, w*.72), K if col in (INK,'#fff') else col, fill)
_fill = fillp
def fillp(d, color, extra=''):
    if color in KEEP: return _fill(d, K if color==INK else color, extra)
    return ''

# ======================================================================
# SR type stickers: round die-cut + paper label tab
# ======================================================================
def sr_sticker(name, label, tint, art, seed):
    p = Pen(seed, 1.1)
    body = art(p)
    save('SR Types', name, svg(260, 210, f'<g transform="translate(0 -12)">{body}</g>'))

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

