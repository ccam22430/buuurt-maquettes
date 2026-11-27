"""Cross-check PDOK extracts against the direct CBS release and Amsterdam WFS."""
import json
import sys
from osgeo import ogr, osr
from pathlib import Path

reference = Path(sys.argv[1])
cbs_geopackage = Path(sys.argv[2])
osr.UseExceptions()
rd = osr.SpatialReference()
rd.ImportFromEPSG(28992)
ll = osr.SpatialReference()
ll.ImportFromEPSG(4326)
ll.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
transform = osr.CoordinateTransformation(ll, rd)

def shape(feature, to_rd=False):
    g = ogr.CreateGeometryFromJson(json.dumps(feature["geometry"]))
    if to_rd:
        g.Transform(transform)
    return g

national = ogr.Open(str(cbs_geopackage))
layer = national.GetLayerByName("buurten")
report = dict(national_counts={part.GetName(): part.GetFeatureCount() for part in national}, cases={})
for case, home_code in (("amsterdam", "BU0363EM02"), ("graft", "BU03611002")):
    records = json.loads((reference/f"{case}-rd.json").read_text())
    layer.SetAttributeFilter(" OR ".join(f"buurtcode = '{f['properties']['buurtcode']}'" for f in records))
    ds = {f["buurtcode"]: (f["buurtnaam"], f.GetGeometryRef().Clone(), f["water"]) for f in layer}
    key = home_code
    ref = next(f for f in records if f["properties"]["buurtcode"] == key)
    qg = shape(ref)
    national_shape = ds[key][1]
    report["cases"][case] = {
        "volume_pdok": len(records), "volume_found_cbs": len(ds),
        "absent_cbs_v1": sorted({f["properties"]["buurtcode"] for f in records} - ds.keys()),
        "different_names": [[f["properties"]["buurtcode"], f["properties"]["buurtnaam"], ds[f["properties"]["buurtcode"]][0]]
                            for f in records if f["properties"]["buurtcode"] in ds and f["properties"]["buurtnaam"] != ds[f["properties"]["buurtcode"]][0]],
        "cbs_home_area": national_shape.GetArea(),
        "pdok_home_area": qg.GetArea(),
        "home_symdiff_m2": national_shape.SymDifference(qg).GetArea(),
    }
    if case == "amsterdam":
        muni = json.loads((reference/"amsterdam-municipal.geojson").read_text())["features"]
        by_cbs = {f["properties"]["cbs_code"]: f for f in muni}
        pdk = {f["properties"]["buurtcode"]: f["properties"]["buurtnaam"] for f in records}
        mg = shape(by_cbs[key], to_rd=True)
        report["municipal"] = {
            "count": len(muni), "common_codes": len(by_cbs.keys() & pdk.keys()),
            "only_cbs": sorted(pdk.keys() - by_cbs.keys()),
            "only_municipal": sorted(k for k in by_cbs.keys() - pdk.keys() if k),
            "different_names": [[k,pdk[k],by_cbs[k]["properties"]["naam"]] for k in sorted(by_cbs.keys() & pdk.keys()) if pdk[k] != by_cbs[k]["properties"]["naam"]],
            "home_area": mg.GetArea(), "home_symdiff_m2": mg.SymDifference(qg).GetArea(),
            "home_record": by_cbs[key]["properties"]
        }
(reference/"comparison-cbs.json").write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
print(json.dumps(report, ensure_ascii=False))
