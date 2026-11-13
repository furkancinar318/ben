#!/usr/bin/env python3
"""Numaralı hareket listesini yazdırır: liste.py BAŞ SON [d]  (d: anlatımın ilk cümlesiyle)"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build_ex as B
a, b = int(sys.argv[1]), int(sys.argv[2])
full = {x['id']: x for x in json.load(open('/home/claude/fedb/dist/exercises.json'))} if len(sys.argv) > 3 else None
for i in range(a, min(b, len(B.ORDER))):
    m = B.META[B.ORDER[i]]; p, s = B.auto_m(m)
    c = {'powerlifting': ' PL', 'strength': ''}.get(m['category'], ' ' + m['category'][:4])
    line = f"{i} {m['name']}|{B.EQ[m['equipment']]}|{m['level'][0]}|{' '.join(B.CODE[k] for k in p)}/{' '.join(B.CODE[k] for k in s)}{c}"
    if full: line += ' :: ' + ' '.join(full[m['id']]['instructions'])[:int(sys.argv[3])]
    print(line)
