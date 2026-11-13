#!/usr/bin/env python3
"""free-exercise-db fotoğraflarını uygulama için küçültür: img/<kimlik>_0.jpg, _1.jpg (420 px) ve img/t/<kimlik>.jpg (küçük resim)."""
import json, pathlib, re, sys, os
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
SRC, DIST = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]) / 'img'
san = lambda s: re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')
meta = {x['id']: x for x in json.load(open(HERE / 'fedb-meta.json'))}
jobs = [(e['img'], e['id'][2:]) for e in json.load(open(HERE / 'ilk110.json'))]
jobs += [(d, san(d)) for d in json.load(open(HERE / 'sira.json')) if meta[d]['ni']]
(DIST / 't').mkdir(parents=True, exist_ok=True)
n = 0
for did, sid in jobs:
    for i in (0, 1):
        out = DIST / f'{sid}_{i}.jpg'
        if not out.exists():
            im = Image.open(SRC / did / f'{i}.jpg').convert('RGB'); im.thumbnail((420, 420))
            im.save(out, 'JPEG', quality=70, optimize=True, progressive=True); n += 1
    t = DIST / 't' / f'{sid}.jpg'
    if not t.exists():
        im = Image.open(SRC / did / '0.jpg').convert('RGB'); w, h = im.size
        tw = min(w, h * 3 // 2); th = tw * 2 // 3
        im = im.crop(((w - tw) // 2, (h - th) // 2, (w + tw) // 2, (h + th) // 2)).resize((132, 88), Image.LANCZOS)
        im.save(t, 'JPEG', quality=62, optimize=True); n += 1
tot = sum(f.stat().st_size for f in DIST.rglob('*.jpg'))
print(f'{len(jobs)} hareket, {n} yeni dosya, toplam {tot / 1e6:.1f} MB')
