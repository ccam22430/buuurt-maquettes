"""Prototype GEO-04, decision support only. No mutation or external API."""
import math
from datetime import datetime


def authorized(code, policy, merchant, as_of):
    """Regular grants and effective exceptions are scoped to an active area."""
    if code not in policy["active"]:
        return False
    if code in policy["regular"]:
        return True
    return any(
        row["merchant"] == merchant and row["code"] == code and row["state"] == "approved"
        and datetime.fromisoformat(row["approved_at"]) <= as_of
        and (not row.get("expires_at") or as_of < datetime.fromisoformat(row["expires_at"]))
        and (not row.get("revoked_at") or as_of < datetime.fromisoformat(row["revoked_at"]))
        for row in policy["exceptions"]
    )


def recommend(context, limits, policy, provenance, merchant, as_of):
    """Inspect only verified route snapshots, reducing several stops to one per CBS code."""
    if not limits or set(limits) - {"foot", "bike"} or not all(
        type(limit) in (int, float) and math.isfinite(limit) and limit > 0 for limit in limits.values()
    ):
        raise ValueError("Hypothèses de trajet invalides")
    reference = policy["reference"]
    if reference != provenance["osm_sha256"] or policy["millésime_cbs"] != 2025:
        raise ValueError("Référentiel de qualification différent")
    candidates, rejected = {}, []
    for target in context["targets"]:
        code = target["code"]
        reason = None
        if code == context["origin"]["code"]:
            reason = "territoire_gratuit"
        elif code not in policy["official"]:
            reason = "code_cbs_inconnu"
        elif not authorized(code, policy, merchant, as_of):
            reason = "autorisations_insuffisantes"
        if reason:
            rejected.append({"code": code, "point": target["label"], "reason": reason})
            continue
        supporting = []
        for mode, limit in limits.items():
            evidence = target["routes"].get(mode, {})
            seconds = evidence.get("seconds")
            length = evidence.get("route_m")
            if evidence.get("status") != "measured" or not all(
                type(v) in (float, int) and math.isfinite(v) and v > 0 for v in (seconds, length)
            ):
                continue
            supporting.append((seconds / limit, mode, seconds, length))
        if not supporting:
            rejected.append({"code": code, "point": target["label"], "reason": "trajet_indisponible"})
            continue
        ratio, mode, seconds, length = min(supporting)
        if ratio > 1:
            rejected.append({"code": code, "point": target["label"], "reason": "hypothèse_de_temps_dépassée"})
            continue
        candidate = {"code": code, "territory": target["territory"], "public_point": target["label"],
                     "mode": mode, "seconds": seconds, "distance_m": length, "source": reference,
                     "date_données": provenance["engine"]["data_date"], "millésime_cbs": 2025,
                     "limit_s": limits[mode]}
        rank = (ratio, seconds, length, target["label"])
        if code not in candidates or rank < candidates[code][0]:
            candidates[code] = (rank, candidate)
    return {"status": "hypothèse_laboratoire", "candidates": [c for _, c in sorted(candidates.values(),
            key=lambda item: (item[0], item[1]["code"]))],
            "rejected": sorted(rejected, key=lambda row: (row["code"], row["point"]))}
