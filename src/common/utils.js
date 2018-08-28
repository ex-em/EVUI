import Vue from 'vue';

const vm = new Vue();
const windowConsole = window.console;
export const prefix = 'evui-';

const Utils = {
  getId() {
    return prefix + vm._uid;
  },
};

export const Console = {
  log(...data) {
    windowConsole.log(...data);
  },
  warn(...data) {
    windowConsole.warn(...data);
  },
  info(...data) {
    windowConsole.info(...data);
  },
  error(...data) {
    windowConsole.error(...data);
  },
  debug(...data) {
    windowConsole.debug(...data);
  },
  dir(item, options) {
    windowConsole.dir(item, options);
  },
};

export function getMatchedComponentsDownward(context, componentName) {
  const children = context.$children;
  const result = [];
  if (!children) {
    return [];
  }
  for (let i = 0; i < children.length; i++) {
    const v = children[i];
    const name = v.$options.name;
    if (name === componentName) {
      result.push(v);
    } else {
      result.concat(getMatchedComponentsDownward(v, componentName));
    }
  }
  return result;
}

export function getMatchedComponentUpward(context, componentName) {
  let parent = context.$parent;
  let name = parent.$options.name;

  while (parent && (!name || componentName !== name)) {
    parent = parent.$parent;
    if (parent) {
      name = parent.$options.name;
    }
  }

  return parent;
}

export default Utils;
