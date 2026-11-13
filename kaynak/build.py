#!/usr/bin/env python3
"""Uygulamayı üretir: kaynak dosyalar -> index.html, sw.js, data/ex.<özet>.js
Çalışma alanında: src/ -> dist/ ; depoda: kaynak/ -> depo kökü"""
import pathlib, hashlib, sys
here = pathlib.Path(__file__).resolve().parent
SRC = here / 'src' if (here / 'src').exists() else here
DIST = here / 'dist' if (here / 'src').exists() else here.parent
sys.path.insert(0, str(SRC / 'ex'))
import build_ex
data_name, stats, ndb, nextra, dsize = build_ex.write(DIST)
css = (SRC / 'style.css').read_text(encoding='utf-8')
js = '\n'.join((SRC / f).read_text(encoding='utf-8') for f in ['core.js', 'sync.js', 'body.js', 'sport.js', 'diet.js', 'cal.js', 'pages.js', 'init.js'])
html = (SRC / 'template.html').read_text(encoding='utf-8').replace('/*CSS*/', css).replace('/*JS*/', js).replace('<!--EXDATA-->', f'<script src="{data_name}"></script>')
(DIST / 'index.html').write_text(html, encoding='utf-8')
cache = 'ben-' + hashlib.sha1((html + data_name).encode()).hexdigest()[:8]
sw = (SRC / 'sw.template.js').read_text(encoding='utf-8').replace('__CACHE__', cache).replace('__DATA__', data_name)
(DIST / 'sw.js').write_text(sw, encoding='utf-8')
print(f'index.html {len(html) // 1024} KB · {data_name} {dsize // 1024} KB · {cache}')
print(stats, f'· anlatımı yazılan: {ndb} veri tabanı + {nextra} ek')
