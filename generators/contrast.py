def L(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    a,b=L(a),L(b); return (max(a,b)+.05)/(min(a,b)+.05)
P=dict(paper='#f6f2ea',raised='#fffdf8',shade='#ece5d8',ink='#1f1c19',muted='#665d55',rule='#cfc6b8',line='#8a8076',
 safety='#e05a22',hazard='#f5c518',blue='#2c5a9a',green='#3a7549',red='#c0392b',hl='#fbe36b')
D=dict(paper='#13233b',raised='#1a2d4a',shade='#0e1a2d',ink='#eef1f5',muted='#a9b6c8',rule='#2e4468',line='#7d8faa',
 safety='#ff8a52',hazard='#ffd23f',blue='#8db4ec',green='#7cc48d',red='#ff7a6b',hl='#ffd23f')
for n,T in (('light',P),('dark',D)):
  print(n)
  for fg in ('ink','muted','blue','green','red','safety','line'):
    print(f"  {fg:7} on paper {cr(T[fg],T['paper']):.2f}  raised {cr(T[fg],T['raised']):.2f}")
  for bg in ('safety','hazard','blue','green','red'):
    print(f"  ink#1f1c19 on {bg} {cr('#1f1c19',T[bg]):.2f}  white on {bg} {cr('#ffffff',T[bg]):.2f}")
for s in ('#fde68a','#f9c6c9','#c9e8b4','#c6dcf2','#fbe36b'):
  print(s, cr('#1f1c19',s), cr('#665d55',s))
