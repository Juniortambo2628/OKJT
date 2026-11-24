# Download a Google Fonts css2 stylesheet and its woff2 files into <dir>/fonts, rewriting URLs for the local renderer.
import sys, re, os, subprocess, hashlib
url, out = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(out, 'fonts'), exist_ok=True)
ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
css = subprocess.run(['curl', '-sS', '-A', ua, url], capture_output=True, text=True, check=True).stdout
def dl(m):
    u = m.group(1); name = hashlib.md5(u.encode()).hexdigest()[:12] + '.woff2'
    p = os.path.join(out, 'fonts', name)
    if not os.path.exists(p): subprocess.run(['curl', '-sS', '-o', p, u], check=True)
    return f'url(http://local.test/fonts/{name})'
css = re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', dl, css)
open(os.path.join(out, 'fonts.css'), 'w').write(css)
print(len(css), 'bytes css,', len(os.listdir(os.path.join(out, 'fonts'))), 'font files')
