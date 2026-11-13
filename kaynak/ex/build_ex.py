#!/usr/bin/env python3
"""Hareket verisini üretir.
Girdi : ilk110.json (elle yazılmış ilk hareketler), fedb-meta.json (free-exercise-db künyesi),
        sira.json (kalan hareketlerin numaraları), p*.txt (Türkçe anlatımlar)
Çıktı : <dist>/data/ex.<özet>.js  ->  window.EXDATA = [...]

p*.txt biçimi (her hareket bir blok):
  #12 zottman            veri tabanındaki 12 numaralı hareket; sonraki kelimeler ad kontrolü
  #+vakum                veri tabanında olmayan ek hareket (fotoğrafsız)
  * ile biten başlık satırı hareketi listede öne alır
  n Görünen ad           m ana kaslar / yardımcı kaslar      c Kategori
  e ekipman kodu         l 1|2|3 seviye                      t s (süre) | c (kardiyo)
  - yapılış adımı        + püf noktası                       ! dikkat
  @m, @c, @t, @e         sonraki bloklar için varsayılan; @reset hepsini temizler
"""
import json, re, hashlib, pathlib, sys, locale

HERE = pathlib.Path(__file__).resolve().parent
META_L = json.load(open(HERE / 'fedb-meta.json'))
META = {x['id']: x for x in META_L}
FIRST = json.load(open(HERE / 'ilk110.json'))
ORDER = json.load(open(HERE / 'sira.json'))

MUS = {'cu': 'chest_up', 'cm': 'chest_mid', 'cl': 'chest_low', 'fd': 'fdelt', 'sd': 'sdelt', 'rd': 'rdelt',
       'bi': 'biceps', 'tr': 'triceps', 'fa': 'forearm', 'au': 'abs_up', 'al': 'abs_low', 'ob': 'obliques',
       'se': 'serratus', 'tu': 'traps_up', 'tm': 'traps_mid', 'la': 'lats', 'lb': 'lowback', 'gl': 'glutes',
       'qu': 'quads', 'ha': 'hams', 'ad': 'adductors', 'ca': 'calves', 'ne': 'neck'}
CODE = {v: k for k, v in MUS.items()}
EQ = {'barbell': 'bb', 'dumbbell': 'db', 'cable': 'cb', 'machine': 'mc', 'body only': 'bw', 'kettlebells': 'kb',
      'bands': 'bd', 'medicine ball': 'mb', 'exercise ball': 'eb', 'foam roll': 'fr', 'e-z curl bar': 'ez',
      'other': 'ot', None: 'bw'}
LV = {'beginner': 1, 'intermediate': 2, 'expert': 3}
CATS = ['Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak', 'Karın', 'Esneme', 'Kardiyo', 'Pliometrik', 'Olimpik', 'Strongman']
CAT_BY_MUS = {'chest': 'Göğüs', 'lats': 'Sırt', 'middle back': 'Sırt', 'lower back': 'Sırt', 'traps': 'Sırt',
              'shoulders': 'Omuz', 'neck': 'Omuz', 'biceps': 'Kol', 'triceps': 'Kol', 'forearms': 'Kol',
              'quadriceps': 'Bacak', 'hamstrings': 'Bacak', 'glutes': 'Bacak', 'calves': 'Bacak',
              'adductors': 'Bacak', 'abductors': 'Bacak', 'abdominals': 'Karın'}
CAT_BY_DB = {'stretching': 'Esneme', 'cardio': 'Kardiyo', 'plyometrics': 'Pliometrik',
             'olympic weightlifting': 'Olimpik', 'strongman': 'Strongman'}
SIMPLE = {'traps': 'traps_up', 'middle back': 'traps_mid', 'lats': 'lats', 'lower back': 'lowback',
          'quadriceps': 'quads', 'hamstrings': 'hams', 'glutes': 'glutes', 'calves': 'calves',
          'adductors': 'adductors', 'abductors': 'glutes', 'biceps': 'biceps', 'triceps': 'triceps',
          'forearms': 'forearm', 'neck': 'neck'}
FIRST_TYPE = {'plank': 's', 'sideplank': 's', 'farmer': 's'}


def san(s):
    return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def one(m, name, cat, back_ctx):
    n = name.lower()
    if m == 'chest':
        if re.search(r'incline|low cable|low pulley', n): return ['chest_up']
        if re.search(r'decline|dip', n): return ['chest_low']
        return ['chest_mid']
    if m == 'shoulders':
        if re.search(r'lateral|side lat|side raise|upright|abduct', n): return ['sdelt']
        if re.search(r'rear|reverse fl|face pull|bent.?over|external|internal|rotat|back fl|cuban', n) or back_ctx:
            return ['rdelt']
        if cat == 'stretching': return ['fdelt', 'rdelt']
        return ['fdelt']
    if m == 'abdominals':
        if re.search(r'leg raise|knee|reverse crunch|hip raise|flutter|scissor|hanging|toes|jackknife|v-up|pike|leg pull|leg lift|bottoms', n):
            return ['abs_low']
        if re.search(r'twist|oblique|side|wood|chop|rotation|russian|windmill|bend|cross', n): return ['obliques']
        if re.search(r'plank|rollout|wheel|roller|hollow', n): return ['abs_up', 'abs_low']
        return ['abs_up']
    return [SIMPLE[m]]


def auto_m(meta):
    cat = meta['category']
    back = meta['primaryMuscles'][0] in ('lats', 'middle back', 'traps')
    p, s = [], []
    for m in meta['primaryMuscles']:
        for k in one(m, meta['name'], cat, False):
            if k not in p: p.append(k)
    for m in meta['secondaryMuscles'] or []:
        for k in one(m, meta['name'], cat, back):
            if k not in p and k not in s: s.append(k)
    return p, s


def auto_cat(meta):
    return CAT_BY_DB.get(meta['category']) or CAT_BY_MUS[meta['primaryMuscles'][0]]


def auto_type(meta):
    return {'stretching': 's', 'cardio': 'c'}.get(meta['category'])


def parse_m(spec, where, errs):
    a, _, b = spec.partition('/')
    out = []
    for part in (a, b):
        ks = []
        for c in part.split():
            if c not in MUS: errs.append(f'{where}: bilinmeyen kas kodu "{c}"'); continue
            if MUS[c] not in ks: ks.append(MUS[c])
        out.append(ks)
    out[1] = [k for k in out[1] if k not in out[0]]
    if not out[0]: errs.append(f'{where}: ana kas yok')
    return out


def parse_parts():
    errs, db, extra = [], {}, {}
    for f in sorted(HERE.glob('p*.txt')):
        dflt, cur = {}, None
        for ln, raw in enumerate(f.read_text(encoding='utf-8').splitlines(), 1):
            line = raw.strip()
            where = f'{f.name}:{ln}'
            if not line or line.startswith('//'): continue
            if line.startswith('@'):
                tag, _, rest = line[1:].partition(' ')
                if tag == 'reset': dflt = {}
                elif tag in ('m', 'c', 't', 'e', 'l'):
                    if rest.strip(): dflt[tag] = rest.strip()
                    else: dflt.pop(tag, None)
                else: errs.append(f'{where}: bilinmeyen yönerge @{tag}')
                cur = None
                continue
            if line.startswith('#'):
                m = re.match(r'#(\+?)(\S+)\s*(.*)$', line)
                plus, key, rest = m.group(1), m.group(2), m.group(3).strip()
                star = rest.endswith('*')
                if star: rest = rest[:-1].strip()
                cur = {'how': [], 'tips': [], 'warn': [], 'star': star, 'where': where, **dflt}
                if plus:
                    if key in extra: errs.append(f'{where}: ek hareket iki kez: {key}')
                    extra[key] = cur
                else:
                    try: i = int(key); did = ORDER[i]
                    except Exception: errs.append(f'{where}: geçersiz numara {key}'); cur = None; continue
                    nm = norm(META[did]['name'])
                    for w in norm(rest).split():
                        if w not in nm: errs.append(f'{where}: #{i} "{META[did]["name"]}" adında "{w}" yok')
                    if not rest: errs.append(f'{where}: #{i} için ad kontrol kelimesi yok')
                    if i in db: errs.append(f'{where}: #{i} iki kez yazılmış')
                    db[i] = cur
                continue
            if cur is None: errs.append(f'{where}: blok dışı satır'); continue
            tag, _, rest = line.partition(' ')
            rest = rest.strip()
            if tag == '-': cur['how'].append(rest)
            elif tag == '+': cur['tips'].append(rest)
            elif tag == '!': cur['warn'].append(rest)
            elif tag in ('n', 'm', 'c', 'e', 'l', 't'): cur[tag] = rest
            else: errs.append(f'{where}: anlaşılmayan satır "{line[:40]}"')
    for key, d in list(db.items()) + list(extra.items()):
        w = d['where']
        if 'm' in d: d['p'], d['s'] = parse_m(d['m'], w, errs)
        if 'c' in d and d['c'] not in CATS: errs.append(f'{w}: bilinmeyen kategori {d["c"]}')
        if 'e' in d and d['e'] not in EQ.values(): errs.append(f'{w}: bilinmeyen ekipman {d["e"]}')
        if 't' in d and d['t'] not in ('s', 'c', 'w'): errs.append(f'{w}: bilinmeyen tür {d["t"]}')
        if not d['how']: errs.append(f'{w}: yapılış adımı yok')
    for key, d in extra.items():
        for need in ('n', 'm', 'c', 'e'):
            if need not in d: errs.append(f'{d["where"]}: ek harekette "{need}" eksik')
    return db, extra, errs


def text_fields(o, d):
    for k in ('how', 'tips', 'warn'):
        if d.get(k): o[k] = d[k]


def build():
    db, extra, errs = parse_parts()
    out, ids = [], set()

    def add(o):
        if o['id'] in ids: errs.append(f'çakışan kimlik {o["id"]}')
        ids.add(o['id'])
        out.append(o)

    for e in FIRST:
        meta = META[e['img']]
        sid = e['id'][2:]
        o = {'id': e['id'], 'name': e['name'], 'cat': e['cat'], 'p': e['p'], 's': e['s'], 'img': 2,
             'eq': EQ[meta['equipment']], 'lv': LV[meta['level']], 'builtin': True, '_r': 0, '_n': len(out)}
        if norm(meta['name']) != norm(e['name']): o['alt'] = meta['name']
        if sid in FIRST_TYPE: o['t'] = FIRST_TYPE[sid]
        if meta.get('mechanic'): o['mech'] = meta['mechanic'][0]
        text_fields(o, e)
        add(o)
    for i, did in enumerate(ORDER):
        meta, d = META[did], db.get(i)
        p, s = auto_m(meta)
        o = {'id': 'b_' + san(did), 'name': meta['name'], 'cat': auto_cat(meta), 'p': p, 's': s, 'img': meta['ni'],
             'eq': EQ[meta['equipment']], 'lv': LV[meta['level']], 'builtin': True, '_r': 3}
        t = auto_type(meta)
        if t: o['t'] = t
        if meta.get('mechanic'): o['mech'] = meta['mechanic'][0]
        if d:
            o['_r'] = 1 if d['star'] else 2
            if d.get('n') and norm(d['n']) != norm(meta['name']): o['name'], o['alt'] = d['n'], meta['name']
            elif d.get('n'): o['name'] = d['n']
            if 'p' in d: o['p'], o['s'] = d['p'], d['s']
            if 'c' in d: o['cat'] = d['c']
            if 'e' in d: o['eq'] = d['e']
            if 'l' in d: o['lv'] = int(d['l'])
            if 't' in d:
                if d['t'] == 'w': o.pop('t', None)
                else: o['t'] = d['t']
            text_fields(o, d)
        add(o)
    for key, d in extra.items():
        if errs and ('p' not in d or 'n' not in d): continue
        o = {'id': 'b_x_' + san(key), 'name': d['n'], 'cat': d['c'], 'p': d['p'], 's': d['s'], 'img': 0,
             'eq': d['e'], 'lv': int(d.get('l', 1)), 'builtin': True, '_r': 1 if d['star'] else 2}
        if d.get('t') in ('s', 'c'): o['t'] = d['t']
        text_fields(o, d)
        add(o)
    if errs:
        print('\n'.join(errs[:60]), file=sys.stderr)
        print(f'{len(errs)} hata', file=sys.stderr)
        sys.exit(1)
    tr = str.maketrans('çğıöşüÇĞİÖŞÜ', 'cgiosuCGIOSU')
    out.sort(key=lambda o: (o['_r'], o.get('_n', 0), o['name'].translate(tr).lower()))
    stats = {'toplam': len(out), 'anlatımlı': sum(1 for o in out if o.get('how')), 'kategori': {}}
    for o in out:
        stats['kategori'][o['cat']] = stats['kategori'].get(o['cat'], 0) + 1
        o.pop('_r', None); o.pop('_n', None)
    return out, stats, len(db), len(extra)


def write(dist):
    out, stats, ndb, nextra = build()
    js = 'window.EXDATA=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
    h = hashlib.sha1(js.encode()).hexdigest()[:8]
    d = pathlib.Path(dist) / 'data'
    d.mkdir(parents=True, exist_ok=True)
    for old in d.glob('ex.*.js'): old.unlink()
    (d / f'ex.{h}.js').write_text(js, encoding='utf-8')
    return f'data/ex.{h}.js', stats, ndb, nextra, len(js)


if __name__ == '__main__':
    name, stats, ndb, nextra, size = write(sys.argv[1] if len(sys.argv) > 1 else HERE.parent.parent / 'dist')
    print(name, f'{size // 1024} KB', json.dumps(stats, ensure_ascii=False), f'yazılan: {ndb} + {nextra} ek')
