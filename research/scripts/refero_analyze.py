import sys,re,glob,collections,os
files=sorted(glob.glob(os.path.join(sys.argv[1],'*.md')))
N=len(files)
h2=collections.Counter(); h3=collections.Counter(); bold=collections.Counter(); tables=collections.Counter()
theme=collections.Counter(); order=collections.Counter(); comps=collections.Counter(); fontsN=collections.Counter()
h3_in=collections.defaultdict(collections.Counter)
dens=collections.Counter(); base=collections.Counter(); lines=[]
for f in files:
  s=open(f,encoding='utf-8').read(); L=s.split('\n'); lines.append(len(L))
  seen2=[];cur=None;seen3=set();seenb=set();seent=set();nf=0;nc=0
  for i,l in enumerate(L):
    if l.startswith('## '):
      cur=re.sub(r'\s+\(.*\)$','',l[3:].strip()); seen2.append(cur)
    elif l.startswith('### '):
      t=l[4:].strip()
      if cur=='Tokens — Typography' and ' — ' in t: nf+=1; t='<Font family> — <role>'
      elif cur=='Components': nc+=1; t='<Component name>'
      h3_in[cur][t]+=1; seen3.add((cur,t))
    for m in re.findall(r'^\s*-?\s*\*\*([^*]{1,40}?):?\*\*',l):
      seenb.add((cur,m.rstrip(':')))
    if l.startswith('|') and i+1<len(L) and re.match(r'^\|[-| ]+\|$',L[i+1]):
      seent.add((cur,l.strip()))
  for x in set(seen2): h2[x]+=1
  order[' > '.join(seen2)]+=1
  for x in seen3: h3[x]+=1
  for x in seenb: bold[x]+=1
  for x in seent: tables[x]+=1
  m=re.search(r'^\*\*Theme:\*\* (.*)$',s,re.M); theme[m.group(1) if m else '-']+=1
  m=re.search(r'^\*\*Density:\*\* (.*)$',s,re.M); dens[m.group(1) if m else '-']+=1
  m=re.search(r'^\*\*Base unit:\*\* (.*)$',s,re.M); base[m.group(1) if m else '-']+=1
  comps[nc]+=1; fontsN[nf]+=1
pct=lambda c:f'{c}/{N} ({100*c/N:.0f}%)'
print('# files',N,'lines min/median/max',min(lines),sorted(lines)[N//2],max(lines))
print('\n## H2 sections');[print(' ',pct(c),k) for k,c in h2.most_common()]
print('\n## H3 by section');[print(' ',pct(c),'|',k[0],'>',k[1]) for k,c in h3.most_common() if c>=N*0.02]
print('\n## Bold field labels');[print(' ',pct(c),'|',k[0],'>',k[1]) for k,c in bold.most_common() if c>=N*0.05]
print('\n## Table headers');[print(' ',pct(c),'|',k[0],'>',k[1]) for k,c in tables.most_common() if c>=N*0.02]
print('\n## Theme',dict(theme)); print('## Density',dict(dens.most_common(8))); print('## Base unit',dict(base.most_common(8)))
print('## components per file',sorted(comps.items())); print('## font families per file',sorted(fontsN.items()))
print('\n## Section orders (top 5)');[print(' ',c,k) for k,c in order.most_common(5)]
