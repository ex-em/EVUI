/* eslint-disable no-shadow, arrow-parens */

const state = {
  items: [],
  activeItemId: '',
  maxIdSeq: 0,
};

// getters
const getters = {
  getItem: (state) => (id) => {
    let item;
    let result;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        result = Object.assign({}, item);
        break;
      }
    }

    return result;
  },
  getActiveItem: (state, getters) => () => getters.getItem(state.activeItemId),
  getMaxIdSeq: (state) => () => state.maxIdSeq,
};

// actions
const actions = {
  addWindow({ commit }, newItem) {
    commit('addItem', newItem);
  },
  updateWindow({ commit }, { id, item }) {
    commit('setItem', { id, newItem: item });
  },
  removeWindow({ commit }, id) {
    commit('removeItem', { id });
  },
};

// mutations
const mutations = {
  addItem(state, newItem) {
    state.maxIdSeq = +String.prototype.split.call(newItem.id, '-')[1];
    state.items.push(newItem);
    state.activeItemId = newItem.id;
  },
  setItem(state, { id, newItem }) {
    let item = {};
    let keys;
    let key;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        keys = Object.keys(newItem);
        for (let jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
          key = keys[jx];
          if (Object.hasOwnProperty.call(item, key)) {
            item[key] = newItem[key];
          }
        }
        state.activeItemId = id;
        break;
      }
    }
  },
  removeItem(state, { id }) {
    let item;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        state.items.splice(ix, 1);
        if (ix) {
          state.activeItemId = state.items[(ix - 1)].id;
        }
        break;
      }
    }
  },
  setActiveItem(state, { id }) {
    state.activeItemId = id;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
