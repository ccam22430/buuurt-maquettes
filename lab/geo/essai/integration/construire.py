"""Generate distributable assets with the original bench template and CBS data."""
import json
from pathlib import Path
from runpy import run_path

base = Path(__file__).resolve().parent
bench = base.parent
dist = base / "dist"
dist.mkdir(exist_ok=True)
maps = run_path(str(bench / "construire.py"))["build_maps"]()
(dist / "cartes.json").write_text(json.dumps(maps, ensure_ascii=False, separators=(",", ":")) + "\n")
template = (bench / "page.html").read_text()
template = "\n".join(line for line in template.splitlines() if "Content-Security-Policy" not in line)
template = template[:template.index("<script>")] + '<script src="/interface.js" defer></script>\n</body>\n</html>\n'
template = template.replace("<main>", '<main><p id="appError" role="alert"></p>')
template = template.replace('<section>\n<h1', '<section id="editor">\n<h1')
# The same banner, profile controls, buttons and SVG remain available in the integrated layout.
(dist / "index.html").write_text(template)
translations = (bench / "essai.js").read_text().split("const PACKAGES =", 1)[0]
(dist / "interface.js").write_text(translations + (base / "interface.js").read_text())
