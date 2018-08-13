/* eslint-disable no-shadow, arrow-parens */

const state = {
  items: [],
  maxIdSeq: 0,
};

// getters
const getters = {
  getAllItems: (state) => () => state.items,
  getItem: (state) => (id, type) => {
    let item;
    let result;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        if (!type) {
          result = Object.assign({}, item);
        } else {
          result = item[type];
        }
        break;
      }
    }

    return result;
  },
  getMaxIdSeq: (state) => () => state.maxIdSeq,
  getDefaultItem: () => () => {
    const defaultItem = {
      id: '',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      type: '',
      rs: {
        left: [],
        right: [],
      },
    };

    return defaultItem;
  },
};

// actions
const actions = {
  resize({ commit, getters }, { id, item, type, changeValue }) {
    const rs = getters.getItem(id, 'rs');
    const keys = Object.keys(rs || {});
    const movedLeft = changeValue > 0;
    const absValue = Math.abs(changeValue);
    let rsData;
    let oldItem;
    let newItem;

    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      rsData = rs[keys[ix]];
      for (let jx = 0, jxLen = rsData.length; jx < jxLen; jx++) {
        if (rsData[jx].includes('split')) {
          oldItem = getters.getItem(rsData[jx]);
          if (type === 'hbox') {
            if (keys[ix] === 'left') {
              newItem = {
                width: movedLeft ? oldItem.width - absValue
                  : oldItem.width + absValue,
              };
            } else {
              newItem = {
                width: movedLeft ? oldItem.width + absValue
                  : oldItem.width - absValue,
                left: movedLeft ? oldItem.left - absValue
                  : oldItem.left + absValue,
              };
            }
          } else if (type === 'vbox') {
            if (keys[ix] === 'left') {
              newItem = {
                height: movedLeft ? oldItem.height - absValue
                  : oldItem.height + absValue,
              };
            } else {
              newItem = {
                height: movedLeft ? oldItem.height + absValue
                  : oldItem.height - absValue,
                top: movedLeft ? oldItem.top - absValue
                  : oldItem.top + absValue,
              };
            }
          }
          commit('setItem', { id: rsData[jx], newItem });
        }
      }
    }

    commit('setItem', { id, newItem: item });
  },
  addSplitter({ commit, getters }, newItem) {
    const item = getters.getDefaultItem();
    const keys = Object.keys(newItem);
    let key;

    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      key = keys[ix];
      if (Object.hasOwnProperty.call(item, key)) {
        item[key] = newItem[key];
      }
    }

    commit('addItem', item);
  },
  updateSplitter({ commit }, { id, newItem }) {
    commit('setItem', { id, newItem });
  },
  updateRelationShip({ commit }, { id, type, rsId, isRemove }) {
    if (!isRemove) {
      commit('addRelationShip', { id, type, rsId });
    } else {
      commit('removeRelationShip', { id, rsId });
    }
  },
  removeSplitter({ commit }, id) {
    commit('removeItem', id);
  },
};

// mutations
const mutations = {
  setItems(state, { items }) {
    let maxIdSeq = 0;
    let itemIdSeq;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      itemIdSeq = +String.prototype.split.call(items[ix].id, '-')[1];
      if (maxIdSeq < itemIdSeq) {
        maxIdSeq = itemIdSeq;
      }
    }

    state.items = items;
    state.maxIdSeq = maxIdSeq;
  },
  setItem(state, { id, newItem }) {
    let item;
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
        break;
      }
    }
  },
  addItem(state, newItem) {
    state.maxIdSeq = +String.prototype.split.call(newItem.id, '-')[1];
    state.items.push(newItem);
  },
  removeItem(state, id) {
    let item;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        state.items.splice(ix, 1);
        break;
      }
    }
  },
  addRelationShip(state, { id, type, rsId }) {
    let item;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        item.rs[type].push(rsId);
        break;
      }
    }
  },
  removeRelationShip(state, { id, rsId }) {
    let item;
    let itemIndex;
    let keys;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        keys = Object.keys(item.rs);
        for (let jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
          itemIndex = item.rs[keys[jx]].indexOf(rsId);
          if (itemIndex !== -1) {
            item.rs[keys[jx]].splice(itemIndex, 1);
            break;
          }
        }
      }
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
