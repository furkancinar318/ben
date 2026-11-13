#!/usr/bin/env python3
"""Türkçe anlatımı henüz yazılmamış veri tabanı numaralarını aralık olarak gösterir."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build_ex as B
db, extra, errs = B.parse_parts()
miss = [i for i in range(len(B.ORDER)) if i not in db]
rng, s = [], None
for i in miss:
    if s is None: s = p = i
    elif i == p + 1: p = i
    else: rng.append((s, p)); s = p = i
if s is not None: rng.append((s, p))
print(f'yazılan {len(db)}/{len(B.ORDER)} + {len(extra)} ek; eksik {len(miss)}:', ' '.join(f'{a}-{b}' for a, b in rng), '| hata:', len(errs))
