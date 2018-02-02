
// import Vue from 'vue';

// let id = 0;

// const createElm = function () {
//   const elm = document.createElement('div');
//   id += 1;
//   elm.id = `app${id}`;
//   document.body.appendChild(elm);
//
//   return elm;
// };

/**
 *  vm
 * @param  {Object} vm
 */
exports.destroyVM = (vm) => {
  // vm.$el && vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
  vm.$destroy();
};

/**
 * @param  {Object|String}  Compo  template
 * @param  {Boolean=false} mounted DOM
 * @return {Object} vm
 */
// exports.createVue = function (Compo) {
//   const Constructor = Vue.extend(Compo);
//   return new Constructor().$mount();
// };

// exports.createDomVue = function (Compo, mounted = false) {
//   const elm = createElm();
//   let ComponetN;
//   if (Object.prototype.toString.call(Compo) === '[object String]') {
//     ComponetN = { template: Compo };
//   }
//   return new Vue(ComponetN).$mount(mounted === false ? null : elm);
// };
/**
 * Transform Date string (yyyy-mm-dd hh:mm:ss) to Date object
 * @param {String}
 */
// exports.stringToDate = function (str) {
//   const parts = str.split(/[^\d]/).filter(Boolean);
//   parts[1] -= 1;
//   return new Date(...parts);
// };

/**
 * Transform Date to yyyy-mm-dd string
 * @param {Date}
 */
exports.dateToString = function (d) {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(nr => (nr > 9 ? nr : `0${nr}`)).join('-');
};

/**
 * mouseenter, mouseleave, mouseover, keyup, change, click
 * @param  {Element} elm
 * @param  {String} name
 * @param  {*} opts
 */
// exports.triggerEvent = function (elm, name, ...opts) {
//   let eventName;
//
//   if (/^mouse|click/.test(name)) {
//     eventName = 'MouseEvents';
//   } else if (/^key/.test(name)) {
//     eventName = 'KeyboardEvent';
//   } else {
//     eventName = 'HTMLEvents';
//   }
//   const evt = document.createEvent(eventName);
//
//   evt.initEvent(name, ...opts);
//   elm.dispatchEvent
//     ? elm.dispatchEvent(evt)
//     : elm.fireEvent(`on${name}`, evt);
//
//   return elm;
// };

/**
 * Wait for components inner async process, when this.$nextTick is not enough
 * 비동기 처리방식
 * @param {Function} the condition to verify before calling the callback
 * @param {Function} the callback to call when condition is true
 */
exports.waitForIt = function waitForIt(condition, callback) {
  if (condition()) callback();
  else setTimeout(() => waitForIt(condition, callback), 50);
};

/**
 * 동기 방식
 * Call a components .$nextTick in a promissified way
 * @param {Vue Component} the component to work with
 */
// exports.promissedTick = component => new Promise((resolve, reject) => {
//   component.$nextTick(resolve);
// });

