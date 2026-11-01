import sys,re,html
s=open(sys.argv[1],encoding='utf-8').read()
m=re.search(r'<code class="text-foreground">(# [^<]*? — Style Reference.*?)</code>',s,re.S)
if not m: sys.exit(2)
body=m.group(1)
if '<' in body: sys.exit(3)
sys.stdout.write(html.unescape(body))
