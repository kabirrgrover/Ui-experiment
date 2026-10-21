"""Isometric construction scene, anatomy-ish: solid white/grey faces, thin ink, one orange accent.
Outputs an <svg> snippet whose stage groups carry style="{{sc.<key>}}" holes."""
import math
U = 30
CX, CY = 230, 300
K = '#111111'
def iso(x, y, z):
    return (CX + (x - y) * U * 0.866, CY + (x + y) * U * 0.5 - z * U)
def pts(ps): return ' '.join(f'{a:.1f},{b:.1f}' for a, b in ps)
def poly(ps, fill, sw=1.3, stroke=K, extra=''):
    return f'<polygon points="{pts(ps)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{extra}/>'
def line(a, b, sw=1.3, col=K):
    return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{col}" stroke-width="{sw}" stroke-linecap="round"/>'
TOP, LEFT, RIGHT = '#ffffff', '#efeee9', '#dddbd4'
def box(x, y, z, w, d, h, top=TOP, left=LEFT, right=RIGHT, sw=1.3):
    # visible: top, front-left (y = y+d face), front-right (x = x+w face)
    t = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]
    l = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]
    r = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)]
    return poly(l, left, sw) + poly(r, right, sw) + poly(t, top, sw)

def windows(x, y, z, w, d):
    o = ''
    for i in range(int(w)):
        a = iso(x + i + .25, y + d, z + .3); b = iso(x + i + .75, y + d, z + .3)
        c = iso(x + i + .75, y + d, z + .75); dd = iso(x + i + .25, y + d, z + .75)
        o += poly([a, b, c, dd], '#cfdcf0', 1)
    for j in range(int(d)):
        a = iso(x + w, y + j + .25, z + .3); b = iso(x + w, y + j + .75, z + .3)
        c = iso(x + w, y + j + .75, z + .75); dd = iso(x + w, y + j + .25, z + .75)
        o += poly([a, b, c, dd], '#bfcde3', 1)
    return o

BX, BY, BW, BD = 0, 0, 4, 3
out = []
# ground plate
g = [iso(-3.5, -2.5, 0), iso(7.5, -2.5, 0), iso(7.5, 5.8, 0), iso(-3.5, 5.8, 0)]
out.append(f'<g>{poly(g, "#faf9f6", 1, "#c9c7c1")}')
for k in range(-3, 8):
    out.append(line(iso(k, -2.5, 0), iso(k, 5.8, 0), .6, '#e6e5e0'))
for k in range(-2, 6):
    out.append(line(iso(-3.5, k, 0), iso(7.5, k, 0), .6, '#e6e5e0'))
out.append('</g>')
# site outline (stakes + string) visible always
s = [iso(BX - .2, BY - .2, 0), iso(BX + BW + .2, BY - .2, 0), iso(BX + BW + .2, BY + BD + .2, 0), iso(BX - .2, BY + BD + .2, 0)]
out.append(f'<polygon points="{pts(s)}" fill="none" stroke="#f0662a" stroke-width="1.2" stroke-dasharray="5 4"/>')
# pit (stage dig)
pit = [iso(BX, BY, 0), iso(BX + BW, BY, 0), iso(BX + BW, BY + BD, 0), iso(BX, BY + BD, 0)]
out.append(f'<g style="{{{{sc.pit}}}}">{poly(pit, "#d9cdb8", 1.2)}'
           + poly([iso(BX + BW, BY, 0), iso(BX + BW, BY + BD, 0), iso(BX + BW, BY + BD, -.35), iso(BX + BW, BY, -.35)], '#c4b597', 1)
           + '</g>')
# dirt pile
dp = [iso(-2.8, .2, 0), iso(-1.4, .2, 0), iso(-1.6, 1.6, 0), iso(-3.0, 1.8, 0)]
peak = iso(-2.2, .9, 1.0)
out.append(f'<g style="{{{{sc.pile}}}}">' + poly([dp[0], dp[1], peak], '#e3d6bf', 1.2) + poly([dp[1], dp[2], peak], '#cdbd9f', 1.2) + poly([dp[2], dp[3], peak], '#d9cbb0', 1.2) + '</g>')
# slab
out.append(f'<g style="{{{{sc.slab}}}}">{box(BX - .15, BY - .15, 0, BW + .3, BD + .3, .3)}</g>')
# floors
for f in range(4):
    z = .3 + f * 1.0
    out.append(f'<g style="{{{{sc.f{f+1}}}}}">{box(BX, BY, z, BW, BD, 1.0)}{windows(BX, BY, z, BW, BD)}</g>')
# roof
rz = .3 + 4.0
out.append(f'<g style="{{{{sc.roof}}}}">{box(BX - .1, BY - .1, rz, BW + .2, BD + .2, .25)}'
           + box(BX + 1.2, BY + .8, rz + .25, 1.2, 1.0, .5)
           + line(iso(BX + .4, BY + .4, rz + .25), iso(BX + .4, BY + .4, rz + 1.6), 1.3)
           + poly([iso(BX + .4, BY + .4, rz + 1.6), iso(BX + .4, BY + 1.3, rz + 1.35), iso(BX + .4, BY + .4, rz + 1.1)], '#f0662a', 1.1)
           + '</g>')
# crane: mast at (6, -1.5)
MX, MY = 6.0, -1.6
H = 7.6
mast = ''
for (ax, ay) in ((MX, MY), (MX + .5, MY), (MX, MY + .5), (MX + .5, MY + .5)):
    pass
mast += box(MX - .3, MY - .3, 0, 1.1, 1.1, .35)
c1, c2, c3 = (MX, MY + .5), (MX + .5, MY + .5), (MX + .5, MY)
for (ax, ay) in (c1, c2, c3):
    mast += line(iso(ax, ay, .35), iso(ax, ay, H), 1.3)
zz = .35; flip = 0
while zz < H - .4:
    a = iso(c1[0], c1[1], zz); b = iso(c2[0], c2[1], zz + .5)
    a2 = iso(c2[0], c2[1], zz); b2 = iso(c3[0], c3[1], zz + .5)
    mast += line(a, b, .8) + line(a2, b2, .8)
    zz += .5
# jib along -x toward building, counter jib +x
jy = MY + .25
jib = line(iso(MX + .25, jy, H), iso(0.6, jy, H), 1.4) + line(iso(MX + .25, jy, H + .45), iso(1.0, jy, H), 1.0)
xx = MX
while xx > 0.8:
    jib += line(iso(xx, jy, H), iso(xx - .25, jy, H + .3), .7)
    xx -= .5
jib += line(iso(MX + .25, jy, H), iso(MX + 2.4, jy, H), 1.4)
jib += box(MX + 1.7, jy - .3, H - .6, .7, .6, .6, '#ffffff', '#dddbd4', '#c9c7c1')
jib += line(iso(MX + .25, jy, H), iso(MX + .25, jy, H + 1.3), 1.2) + line(iso(MX + .25, jy, H + 1.3), iso(0.8, jy, H), .8) + line(iso(MX + .25, jy, H + 1.3), iso(MX + 2.3, jy, H), .8)
cab = box(MX - .05, MY - .05, H - .55, .6, .6, .5, '#ffffff', '#efeee9', '#dddbd4')
out.append(f'<g>{mast}{cab}{jib}</g>')
# hook: trolley at x = 2 over building middle; rope down to target height given by --hook (translateY)
hx, hy = 2.0, jy
top = iso(hx, hy, H)
# hook block (moves via transform) carrying an orange block
hb = iso(hx, hy, H - 1.5)
blk = box(hx - .5, hy - .2, H - 2.3, 1.0, .5, .4, '#f6a272', '#f0662a', '#d4501b')
out.append(f'<line x1="{top[0]:.1f}" y1="{top[1]:.1f}" x2="{top[0]:.1f}" y2="{{{{sc.ropeY}}}}" stroke="{K}" stroke-width="1" style="transition: all 900ms cubic-bezier(.2,.8,.2,1)"/>')
print('CONST', top[1], hb[1], H, U)
out.append(f'<g style="{{{{sc.load}}}}">'
                      + poly([(hb[0] - 5, hb[1]), (hb[0] + 5, hb[1]), (hb[0] + 4, hb[1] + 7), (hb[0] - 4, hb[1] + 7)], '#111111', 1)
           + line((hb[0], hb[1] + 7), iso(hx - .4, hy + .05, H - 1.9), .8) + line((hb[0], hb[1] + 7), iso(hx + .4, hy - .05, H - 1.9), .8)
           + blk + '</g>')
# bulldozer at (-2, 3.8) facing +x
def dozer():
    o = box(-2.4, 4.0, 0, 1.5, .9, .25, '#4a4744', '#2f2d2b', '#3b3936')
    o += box(-2.2, 4.1, .25, 1.0, .7, .45, '#f5d36b', '#f3c92f', '#d9ab1a')
    o += box(-2.05, 4.2, .7, .55, .5, .45, '#ffffff', '#efeee9', '#dddbd4')
    o += poly([iso(-.8, 3.9, 0), iso(-.8, 5.0, 0), iso(-.8, 5.0, .55), iso(-.8, 3.9, .55)], '#dddbd4', 1.2)
    return o
out.append(f'<g style="{{{{sc.dozer}}}}">{dozer()}</g>')
import re as _re
_body=''.join(out)
_nums=[(float(a),float(b)) for a,b in _re.findall(r'(-?[\d.]+),(-?[\d.]+)', _body)]+[(float(a),float(b)) for a,b in _re.findall(r'x[12]="(-?[\d.]+)" y[12]="(-?[\d.]+)"', _body)]
_x0=min(p[0] for p in _nums)-12;_y0=min(p[1] for p in _nums)-12;_x1=max(p[0] for p in _nums)+12;_y1=max(p[1] for p in _nums)+12
VB=f'{_x0:.0f} {_y0:.0f} {_x1-_x0:.0f} {_y1-_y0:.0f}'
VB='-24 30 527 470'
print('vb',VB)
SVG = '<svg viewBox="'+VB+'" width="100%" role="img" aria-label="{{sceneLabel}}" style="display: block; overflow: visible;">' + ''.join(out) + '</svg>'
open('iso_snippet.svg', 'w').write(SVG)

# test render with all visible
test = SVG.replace('{{sceneLabel}}', 'test')
import re
test = re.sub(r'style="\{\{sc\.[a-z0-9]+\}\}"', '', test)
open('iso_test.html', 'w').write(f'<body style="margin:0;background:#fff"><div style="width:460px">{test}</div></body>')
print(len(SVG))
