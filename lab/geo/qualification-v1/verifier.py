"""Independent reference calculation, without importing the recommendation implementation."""
import json
from collections import Counter
from pathlib import Path
from sys import argv

GRANTED = {
    "urbain": {"BU0363EK04", "BU0363EM01", "BU0363EM04", "BU0363EN02"},
    "rural": {"BU03611000", "BU03611003"},
    "touristique": {"BU04793213", "BU04791612"},
}


def expected(targets, grants, limits, coefficient):
    return {
        point["code"] for point in targets
        if point["code"] in grants
        and any(route["status"] == "measured" and route["seconds"] <= limits[mode] * coefficient
                for mode, route in point["routes"].items())
    }


def main(paths):
    routes, matrix, obstacle = (json.loads(Path(p).read_text()) for p in paths)
    samples = [route for c in routes["contexts"].values() for t in c["targets"] for route in t["routes"].values()]
    assert Counter(s["status"] for s in samples) == {"measured": 31, "unavailable": 3}
    assert len(matrix["scenarios"]) == 18
    assert len({(row["context"], row["activity"]) for row in matrix["scenarios"]}) == 18
    for scenario in matrix["scenarios"]:
        context = scenario["context"]
        findings = [expected(routes["contexts"][context]["targets"], GRANTED[context],
                             scenario["limits_s"], factor) for factor in (.8, 1, 1.2)]
        rows = scenario["result"]["candidates"]
        assert len(rows) == len({r["code"] for r in rows})
        assert {r["code"] for r in rows} == findings[1]
        assert scenario["counts_80_100_120"] == list(map(len, findings))
        for row in rows:
            assert row["source"] == routes["source"]["osm_sha256"]
            original = next(p for p in routes["contexts"][context]["targets"]
                            if p["label"] == row["public_point"] and p["code"] == row["code"])
            data = original["routes"][row["mode"]]
            assert (row["seconds"], row["distance_m"]) == (data["seconds"], data["route_m"])
    assert set(obstacle["cases"]) == {"urbain", "rural"}
    for row in obstacle["cases"].values():
        assert all(path["osm_bridge"] and path["bridge"] for path in row["paths"].values())
        assert row["straight_water"] and {p for p in row["paths"]} == {"foot", "bike"}
    return {
        "cases_verified": len(matrix["scenarios"]),
        "negative_cases_verified": len(matrix["gate_tests"]),
        "route_results": dict(Counter(s["status"] for s in samples)),
        "sensitivity_cases": sum(len(set(r["counts_80_100_120"])) > 1 for r in matrix["scenarios"]),
        "water_detour_cases": len(obstacle["cases"]),
    }


if __name__ == "__main__":
    print(json.dumps(main(argv[1:]), ensure_ascii=False))
