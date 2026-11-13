#!/usr/bin/env python3
"""Seçilen numaraların İngilizce anlatımını kısaltılmış gösterir: bak.py 14 26 4 [uzunluk=300]"""
import json, sys
order = json.load(open('/home/claude/app/src/ex/sira.json'))
full = {x['id']: x for x in json.load(open('/home/claude/fedb/dist/exercises.json'))}
n = 300
for a in sys.argv[1:]:
    if a.startswith('n='): n = int(a[2:]); continue
    x = full[order[int(a)]]
    print(a, x['name'], '::', ' '.join(x['instructions'])[:n])
