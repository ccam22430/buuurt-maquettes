"""Execute the 18 GEO-05 hypotheses, repeatability and independently specified rule cases."""
import copy
import itertools
import json
from datetime import datetime, timezone
from pathlib import Path
from sys import argv

from recommander import recommend

ACTIVITIES = {
    "boulangerie": (6, 3),
    "café": (10, 5),
    "poissonnerie": (13, 6),
    "salon de coiffure": (15, 7),
    "boutique vintage": (18, 8),
    "salle de spectacle": (22, 12),
}
EXPECTED = {
    "urbain": {
        "boulangerie": {"BU0363EK04", "BU0363EM01", "BU0363EN02"},
        "salle de spectacle": {"BU0363EK04", "BU0363EM01", "BU0363EM04", "BU0363EN02"},
    },
    "rural": {
        "boulangerie": set(),
        "salle de spectacle": {"BU03611000", "BU03611003"},
    },
    "touristique": {
        "boulangerie": set(),
        "salle de spectacle": {"BU04793213", "BU04791612"},
    },
}
MERCHANT = "commerce-laboratoire"
DATE = datetime(2026, 11, 27, 9, 0, tzinfo=timezone.utc)


def codes(result):
    return {row["code"] for row in result["candidates"]}


def access(geo, provenance, context):
    official = {point["code"] for point in geo["targets"]}
    blocked = {"BU0363EF02", "BU0363EL02"}
    regular = official - blocked - {"BU0363EN02", "BU04791612"}
    active = official - blocked
    exceptions = [{"merchant": MERCHANT, "code": code, "state": "approved",
                   "approved_at": "2026-11-26T00:00:00+00:00"}
                  for code in {"BU0363EN02", "BU04791612"} & official]
    return {"reference": provenance["osm_sha256"], "millésime_cbs": 2025, "official": official,
            "active": active, "regular": regular, "exceptions": exceptions, "scenario": context}


def rule_checks(contexts, provenance):
    context = contexts["urbain"]
    limits = {"foot": 1500, "bike": 900}
    policy = access(context, provenance, "urbain")
    run = lambda c, p: recommend(c, limits, p, provenance, MERCHANT, DATE)
    initial = run(context, policy)
    assert "BU0363EN02" in codes(initial)
    assert {"BU0363EL02", "BU0363EF02"}.isdisjoint(codes(initial))
    revoked = copy.deepcopy(policy)
    revoked["exceptions"][0]["revoked_at"] = "2026-11-27T08:00:00+00:00"
    assert "BU0363EN02" not in codes(run(context, revoked))
    expired = copy.deepcopy(policy)
    expired["exceptions"][0]["expires_at"] = "2026-11-26T12:00:00+00:00"
    assert "BU0363EN02" not in codes(run(context, expired))
    wrong = copy.deepcopy(policy)
    wrong["exceptions"][0]["merchant"] = "another-merchant"
    assert "BU0363EN02" not in codes(run(context, wrong))
    future = copy.deepcopy(policy)
    future["exceptions"][0]["approved_at"] = "2026-11-28T00:00:00+00:00"
    assert "BU0363EN02" not in codes(run(context, future))
    inactive = copy.deepcopy(policy)
    inactive["active"].remove("BU0363EN02")
    assert "BU0363EN02" not in codes(run(context, inactive))
    unknown = copy.deepcopy(policy)
    unknown["official"].remove("BU0363EN02")
    assert any(x["reason"] == "code_cbs_inconnu" for x in run(context, unknown)["rejected"])
    missing = copy.deepcopy(context)
    target = next(t for t in missing["targets"] if t["code"] == "BU0363EN02")
    target["routes"] = {"foot": {"status": "unavailable"}, "bike": {"status": "measured", "seconds": float("nan"), "route_m": 1}}
    missing_result = run(missing, policy)
    assert "BU0363EN02" not in codes(missing_result)
    assert any(x["reason"] == "trajet_indisponible" for x in missing_result["rejected"])
    stale = dict(policy, reference="another-snapshot")
    try:
        run(context, stale)
    except ValueError:
        pass
    else:
        raise AssertionError("Snapshot mismatch accepted")
    try:
        recommend(context, {"foot": 0}, policy, provenance, MERCHANT, DATE)
    except ValueError:
        pass
    else:
        raise AssertionError("Zero travel-time limit accepted")
    return ["hypothèse invalide", "zone inactive", "exception révoquée", "exception expirée", "mauvais commerce",
            "autorisation future", "code CBS inconnu", "trajet absent ou invalide", "référentiel incohérent"]


def matrix(data):
    contexts, provenance = data["contexts"], data["source"]
    cases = []
    for (context, geo), (activity, (foot, bike)) in itertools.product(contexts.items(), ACTIVITIES.items()):
        policy = access(geo, provenance, context)
        limits = {"foot": foot * 60, "bike": bike * 60}
        apply = lambda test_limits, g=geo: recommend(g, test_limits, policy, provenance, MERCHANT, DATE)
        result = apply(limits)
        assert result == apply(limits, dict(geo, targets=list(reversed(geo["targets"]))))
        expected = EXPECTED[context].get(activity)
        if expected is not None:
            assert codes(result) == expected, (context, activity, codes(result), expected)
        conservative = apply({mode: seconds * 0.8 for mode, seconds in limits.items()})
        relaxed = apply({mode: seconds * 1.2 for mode, seconds in limits.items()})
        assert codes(conservative) <= codes(result) <= codes(relaxed)
        cases.append({"context": context, "activity": activity, "limits_s": limits, "result": result,
                      "counts_80_100_120": [len(codes(x)) for x in (conservative, result, relaxed)],
                      "reference_case_asserted": expected is not None})
    assert len(cases) == 18
    checks = rule_checks(contexts, provenance)
    return {"scope": "sandbox", "commercial_validation": False, "scenarios": cases, "gate_tests": checks}


if __name__ == "__main__":
    output = matrix(json.loads(Path(argv[1]).read_text()))
    Path(argv[2]).write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n")
