#!/usr/bin/env python3
"""Regenerate sitemap.xml from the HTML pages in the repo root.

Run after adding, removing, or meaningfully editing a page, then commit
the updated sitemap.xml alongside your change:

    python3 tools/gen-sitemap.py

A page is included when it is indexable (no `noindex` robots meta) and
declares a canonical URL — so thank-you.html and the Search Console
verification stub are skipped automatically. <lastmod> is each file's
last git commit date (falls back to today for not-yet-committed files).
"""
import datetime
import glob
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# priority/changefreq by canonical URL; everything else is a style page
SPECIAL = {
    "https://artbycarlostattoo.com/": ("1.0", "weekly"),
    "https://artbycarlostattoo.com/contact.html": ("0.8", "monthly"),
    "https://artbycarlostattoo.com/about.html": ("0.5", "monthly"),
}
DEFAULT = ("0.9", "weekly")

entries = []
for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    src = open(path, encoding="utf-8").read()
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', src, re.I):
        continue
    m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
    if not m:
        continue
    loc = m.group(1)
    lastmod = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", path],
        capture_output=True, text=True, cwd=ROOT,
    ).stdout.strip() or datetime.date.today().isoformat()
    priority, changefreq = SPECIAL.get(loc, DEFAULT)
    entries.append((priority, loc, lastmod, changefreq))

entries.sort(key=lambda e: (-float(e[0]), e[1]))

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]
for priority, loc, lastmod, changefreq in entries:
    lines.append(
        f"  <url><loc>{loc}</loc><lastmod>{lastmod}</lastmod>"
        f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
    )
lines.append("</urlset>")

with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print(f"sitemap.xml written: {len(entries)} URLs")
for e in entries:
    print(f"  {e[1]}  (lastmod {e[2]}, priority {e[0]})")
