import ssl
import urllib.request

ctx = ssl.create_default_context()
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
for u in urls:
    req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            print(r.status, u)
    except Exception as e:
        print("ERR", u, type(e).__name__, e)
