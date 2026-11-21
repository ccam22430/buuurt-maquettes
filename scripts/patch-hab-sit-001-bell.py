#!/usr/bin/env python3
"""Patch only the header icon of HAB-SIT-001 in the visual library."""
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html"
data = path.read_text(encoding="utf-8")
start = data.index('"fr": "HAB-SIT-001"')
end = data.index('"}, {"fr":', start)
before, screen, after = data[:start], data[start:end], data[end:]
old = "◎ NL⌄  ♧"
new = "◎ NL⌄  🔔"
assert screen.count(old) == 1, f"Expected one header icon, found {screen.count(old)}"
screen = screen.replace(old, new, 1)
updated = before + screen + after
assert len(updated) - len(data) == len(new) - len(old)
assert updated.count('"fr": "HAB-SIT-001"') == 1
assert "♙" in screen and "Account" in screen, "Bottom account tab must remain"
path.write_text(updated, encoding="utf-8")
print("PASS: HAB-SIT-001 header icon replaced; bottom account tab retained")
