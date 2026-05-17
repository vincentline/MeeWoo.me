import re
import pathlib

html = pathlib.Path(__file__).with_name(".tmp_trending.html").read_text(encoding="utf-8", errors="replace")
pat = re.compile(r'href="(/[^/"]+/[^/"]+)"')
seen: set[tuple[str, str]] = set()
repos: list[str] = []
for m in pat.finditer(html):
    h = m.group(1)
    if h.count("/") != 2:
        continue
    bad = (
        "/topics",
        "/collections",
        "/settings",
        "/marketplace",
        "/features",
        "/trending",
        "/explore",
        "/login",
        "/signup",
        "/pricing",
        "/enterprise",
    )
    if any(x in h for x in bad):
        continue
    parts = h.split("/")
    o, r = parts[1], parts[2]
    if o in ("topics", "features", "sponsors", "orgs", "users", "settings", "pulls", "issues"):
        continue
    key = (o, r)
    if key in seen:
        continue
    seen.add(key)
    repos.append(f"https://github.com{h}")
    if len(repos) >= 30:
        break
for u in repos:
    print(u)
