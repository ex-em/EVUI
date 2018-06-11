import Vue from 'vue';

const vm = new Vue();
export const prefix = 'evui-';

const Utils = {
  getId() {
    return prefix + vm._uid;
  },
};

export default Utils;

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
