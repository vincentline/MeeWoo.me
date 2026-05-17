"""Fetch GitHub repo pages and print og:description or meta description."""
import re
import ssl
import urllib.request

ctx = ssl.create_default_context()
ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
urls = [
    "https://github.com/ruvnet/RuView",
    "https://github.com/tinyhumansai/openhuman",
    "https://github.com/rohitg00/agentmemory",
    "https://github.com/obra/superpowers",
    "https://github.com/K-Dense-AI/scientific-agent-skills",
    "https://github.com/shiyu-coder/Kronos",
    "https://github.com/roboflow/supervision",
    "https://github.com/influxdata/telegraf",
    "https://github.com/supertone-inc/supertonic",
    "https://github.com/Genymobile/scrcpy",
    "https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization",
    "https://github.com/CloakHQ/CloakBrowser",
    "https://github.com/mattpocock/skills",
    "https://github.com/github/spec-kit",
    "https://github.com/garrytan/gstack",
]

def desc(html: str) -> str:
    m = re.search(
        r'<meta property="og:description" content="([^"]*)"', html
    ) or re.search(r'<meta name="description" content="([^"]*)"', html)
    return (m.group(1) if m else "")[:400]

def read_until_meta(r, limit: int = 900_000) -> str:
    chunks: list[bytes] = []
    total = 0
    buf = b""
    while total < limit:
        piece = r.read(32_768)
        if not piece:
            break
        total += len(piece)
        buf += piece
        try:
            s = buf.decode("utf-8", errors="strict")
        except UnicodeDecodeError:
            continue
        if 'og:description"' in s or 'name="description"' in s:
            return s
    return buf.decode("utf-8", errors="replace")


for u in urls:
    req = urllib.request.Request(u, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        raw = read_until_meta(r)
    print("---", u)
    print(desc(raw).replace("&#39;", "'"))
