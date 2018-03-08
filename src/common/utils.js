import Vue from 'vue';

const vm = new Vue();
export const prefix = 'evui-';

const Utils = {
  getId() {
    return prefix + vm._uid;
  },
};

export default Utils;
