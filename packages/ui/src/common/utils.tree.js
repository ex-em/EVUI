function findComponentUpward(context, componentName, componentNames) {
  let componentNamesTemp = componentNames;
  if (typeof componentName === 'string') {
    componentNamesTemp = [componentName];
  } else {
    componentNamesTemp = componentName;
  }

  let parent = context.$parent;
  let name = parent.$options.name;
  while (parent && (!name || componentNamesTemp.indexOf(name) < 0)) {
    parent = parent.$parent;
    if (parent) name = parent.$options.name;
  }
  return parent;
}
export { findComponentUpward };
