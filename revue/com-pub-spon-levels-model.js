"use strict";

function createLevelSelection(features, bands, previous = []) {
  const children = new Map();
  const selectable = new Set();
  for (const {id, properties} of features) {
    if (!children.has(properties.parent)) children.set(properties.parent, []);
    children.get(properties.parent).push(id);
    if (bands[id] !== "home") selectable.add(id);
  }
  const selected = new Set(previous.filter(id => selectable.has(id)));
  const eligible = id => selectable.has(id) && bands[id] !== "other";
  const members = id => children.get(id) || [];
  const levelState = (level, id) => {
    if (level === "wijken") return selected.has(id) ? "true" : "false";
    const group = members(id);
    const bulk = group.filter(eligible);
    if (!group.some(child => selected.has(child))) return "false";
    return bulk.length && bulk.every(child => selected.has(child)) ? "true" : "mixed";
  };
  const canToggle = (level, id) => level === "wijken" ? selectable.has(id) :
    members(id).some(child => eligible(child) || selected.has(child));
  function toggle(level, id) {
    if (!canToggle(level, id)) return;
    if (level === "wijken") {
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return;
    }
    const group = members(id);
    const bulk = group.filter(eligible);
    if (levelState(level, id) === "true" || !bulk.length) {
      for (const child of group) selected.delete(child);
    } else {
      for (const child of bulk) selected.add(child);
    }
  }
  return {selected, members, levelState, canToggle, toggle};
}

// This distance orders suggestions within the same band. It does not grant eligibility.
function distanceToTerritory(center, geometry) {
  const [latitude, longitude] = center;
  const xScale = Math.cos(latitude * Math.PI / 180);
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let nearest = Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const [ax, ay] = [(ring[i - 1][0] - longitude) * xScale, ring[i - 1][1] - latitude];
        const [bx, by] = [(ring[i][0] - longitude) * xScale, ring[i][1] - latitude];
        const [dx, dy] = [bx - ax, by - ay];
        const length = dx * dx + dy * dy;
        const t = length ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / length)) : 0;
        nearest = Math.min(nearest, Math.hypot(ax + t * dx, ay + t * dy));
      }
    }
  }
  return nearest * 111195;
}

if (typeof module !== "undefined") module.exports = {createLevelSelection, distanceToTerritory};
