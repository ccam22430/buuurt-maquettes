export function composeScreen(lines, components) {
  return lines.join('').replace(/\{\{([a-z-]+)\}\}/g, (_, name) => {
    if (!Object.hasOwn(components, name)) {
      throw new Error('Unknown screen component: ' + name);
    }
    return components[name];
  });
}
