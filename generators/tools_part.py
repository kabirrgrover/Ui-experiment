# ---------------- tool stickers: flat fills, thick dark outline, white die-cut ----------------
def tool(name, W, H, parts, line, rot, lw=7):
    halo = ''.join(f'<{t} fill="#fff" stroke="#fff" stroke-width="{lw*2+16}" stroke-linejoin="round" stroke-linecap="round"/>' for t, f in parts)
    outl = ''.join(f'<{t} fill="{line}" stroke="{line}" stroke-width="{lw*2}" stroke-linejoin="round" stroke-linecap="round"/>' for t, f in parts)
    fills = ''.join(f'<{t} fill="{f}"/>' for t, f in parts if f)
    save(name, W, H, f'<g filter="url(#s)">{halo}</g>{outl}{fills}', rot)

def lines(d, col, w=5):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'

# hammer
tool('tool-hammer', 260, 260, [
    ('rect x="112" y="80" width="30" height="160" rx="12" transform="rotate(30 127 160)"', '#f2a65a'),
    ('path d="M70 52 H176 Q196 52 196 72 V92 H70 Q50 92 50 72 Q50 52 70 52Z" transform="rotate(30 127 160)"', '#5b6470'),
    ('path d="M196 60 Q222 58 230 80 Q212 74 196 84Z" transform="rotate(30 127 160)"', '#5b6470'),
], K, -6)
# wrench
tool('tool-wrench', 300, 220, [
    ('rect x="90" y="94" width="140" height="32" rx="16" transform="rotate(-20 150 110)"', C['lilac']),
    ('path d="M35.6 93.9 L38.0 89.4 L41.1 85.3 L44.7 81.6 L48.8 78.5 L53.2 75.9 L57.9 74.0 L62.9 72.7 L68.0 72.1 L73.1 72.1 L78.2 72.9 L83.2 74.3 L87.8 76.4 L92.2 79.2 L96.2 82.4 L99.6 86.2 L102.6 90.4 L104.9 95.0 L106.6 99.8 L107.7 104.9 L108.0 110.0 L107.7 115.1 L106.6 120.2 L104.9 125.0 L102.6 129.6 L99.6 133.8 L96.2 137.6 L92.2 140.8 L87.8 143.6 L83.2 145.7 L78.2 147.1 L73.1 147.9 L68.0 147.9 L62.9 147.3 L57.9 146.0 L53.2 144.1 L48.8 141.5 L44.7 138.4 L41.1 134.7 L38.0 130.6 L35.6 126.1 L56.0 122.0 L76.0 118.0 L76.0 102.0 L56.0 98.0Z" transform="rotate(-20 150 110)"', C['lilac']),
    ('circle cx="236" cy="110" r="24" transform="rotate(-20 150 110)"', C['lilac']),
], '#3b2f6b', 8)
# tape measure
tm = (f'<g filter="url(#s)"><rect x="18" y="26" width="164" height="150" rx="40" fill="#fff" stroke="#fff" stroke-width="20"/>'
      f'<path d="M168 140 H292 V172 H168Z" fill="#fff" stroke="#fff" stroke-width="20" stroke-linejoin="round"/></g>'
      f'<path d="M168 140 H286 V172 H168Z" fill="#fbe9a0" stroke="{K}" stroke-width="5" stroke-linejoin="round"/>'
      + ''.join(f'<line x1="{x}" y1="140" x2="{x}" y2="{152 if (x-180)%40 else 160}" stroke="{K}" stroke-width="3"/>' for x in range(180, 284, 10))
      + f'<rect x="282" y="132" width="12" height="46" rx="3" fill="{K}"/>'
      f'<rect x="18" y="26" width="164" height="150" rx="40" fill="{C["flame"]}" stroke="{K}" stroke-width="6"/>'
      f'<circle cx="100" cy="101" r="40" fill="#fff" stroke="{K}" stroke-width="6"/><circle cx="100" cy="101" r="12" fill="{K}"/>'
      f'<rect x="132" y="160" width="40" height="18" rx="6" fill="{C["red"]}" stroke="{K}" stroke-width="5"/>')
save('tool-tape-measure', 310, 210, tm, 5)
# spirit level
lv = (f'<g filter="url(#s)"><rect x="20" y="48" width="320" height="64" rx="12" fill="#fff" stroke="#fff" stroke-width="20"/></g>'
      f'<rect x="20" y="48" width="320" height="64" rx="12" fill="{C["lime"]}" stroke="{K}" stroke-width="6"/>'
      f'<rect x="140" y="62" width="80" height="36" rx="18" fill="#e9f7d8" stroke="{K}" stroke-width="5"/>'
      f'<line x1="165" y1="62" x2="165" y2="98" stroke="{K}" stroke-width="3"/><line x1="195" y1="62" x2="195" y2="98" stroke="{K}" stroke-width="3"/>'
      f'<circle cx="180" cy="80" r="9" fill="{C["green"]}"/>'
      f'<circle cx="62" cy="80" r="12" fill="none" stroke="{K}" stroke-width="5"/><circle cx="298" cy="80" r="12" fill="none" stroke="{K}" stroke-width="5"/>')
save('tool-level', 360, 160, lv, -8)
# architect's scale ruler
sc_ = (f'<g filter="url(#s)"><path d="M20 60 H340 V120 H20Z" fill="#fff" stroke="#fff" stroke-width="20"/></g>'
       f'<path d="M20 60 H340 V120 H20Z" fill="{C["blue"]}" stroke="{K}" stroke-width="6"/><path d="M20 98 H340" stroke="{K}" stroke-width="4"/>'
       + ''.join(f'<line x1="{x}" y1="60" x2="{x}" y2="{82 if x % 50 == 30 else 72}" stroke="#fff" stroke-width="3"/>' for x in range(30, 336, 10))
       + T('1:50', 296, 116, 18, 'mono', '#fff') + T('1:100', 66, 116, 18, 'mono', '#fff'))
save('tool-scale-ruler', 360, 180, sc_, 6)
# screwdriver
tool('tool-screwdriver', 280, 200, [
    ('rect x="150" y="84" width="104" height="44" rx="20" transform="rotate(-18 140 100)"', C['pink']),
    ('rect x="40" y="96" width="114" height="18" rx="4" transform="rotate(-18 140 100)"', '#c3c9d1'),
    ('path d="M22 96 L40 96 L40 114 L22 110Z" transform="rotate(-18 140 100)"', '#c3c9d1'),
], K, -4, 6)
# carpenter's pencil
tool('tool-pencil', 320, 150, [
    ('path d="M70 50 H290 V100 H70 L22 75Z"', C['orange']),
    ('path d="M70 50 L22 75 L70 100Z"', '#f4d7b0'),
    ('path d="M38 67 L22 75 L38 83Z"', K),
], K, 7, 6)
pen = open(f'{OUT}/tool-pencil.svg').read().replace('</g></svg>', T('2H', 230, 86, 26, 'sans7', K) + '</g></svg>')
open(f'{OUT}/tool-pencil.svg', 'w').write(pen)
# safety glasses / bolt as a random one: hex bolt
tool('tool-bolt', 200, 240, [
    ('rect x="80" y="70" width="40" height="150" rx="6"', '#c3c9d1'),
    ('path d="M56 28 H144 L164 62 L144 96 H56 L36 62Z"', '#8e98a6'),
], K, 8, 6)
bolt = open(f'{OUT}/tool-bolt.svg').read().replace('</g></svg>', ''.join(f'<path d="M80 {110+k*22} L120 {102+k*22}" stroke="{K}" stroke-width="5" stroke-linecap="round"/>' for k in range(5)) + '</g></svg>')
open(f'{OUT}/tool-bolt.svg', 'w').write(bolt)
