/* eslint-disable no-shadow, arrow-parens, no-console */

const state = {
  maps: [],
  items: [],
  maxIdSeq: 0,
};

// getters
const getters = {
  getAllItems: (state) => () => state.items,
  getItem: (state) => (id, key) => {
    let item;
    let result;

    for (let ix = 0, ixLen = state.items.length; ix < ixLen; ix++) {
      item = state.items[ix];
      if (item.id === id) {
        if (!key) {
          result = Object.assign({}, item);
        } else {
          result = item[key];
        }
        break;
      }
    }

    return result;
  },
  getItemIdInTheMouse: (state) => (xPos, yPos, leftPadding, topPadding) => {
    const nodes = state.items;
    let isExist = false;
    let node;
    let startX;
    let endX;
    let startY;
    let endY;
    let resultId;

    for (let ix = 0, ixLen = nodes.length; ix < ixLen; ix++) {
      node = nodes[ix];
      startX = node.left + leftPadding;
      startY = node.top + topPadding;
      endX = startX + node.width;
      endY = startY + node.height;

      if ((startX < xPos && endX > xPos) && (startY < yPos && endY > yPos)) {
        isExist = true;
        break;
      }
    }

    if (isExist) {
      resultId = node.id;
    }

    return resultId;
  },
  getMaxIdSeq: (state) => () => state.maxIdSeq,
  getAllMapItems: (state) => () => state.maps,
  getMapItem: (state) => (id, level) => {
    const maps = state.maps[level] || [];
    let result = null;

    for (let ix = 0, ixLen = maps.length; ix < ixLen; ix++) {
      if (maps[ix] && maps[ix][id]) {
        result = Object.assign({}, maps[ix]);
        break;
      }
    }

    return result;
  },
  getOtherIdInMapItemById: () => (id, item) => {
    const keys = Object.keys(item || {});
    let key;
    let otherId;

    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      key = keys[ix];
      if (key !== id && key.includes('node')) {
        otherId = key;
        break;
      }
    }

    return otherId;
  },
  getDefaultItem: () => () => {
    const defaultItem = {
      id: '',
      contents: '',
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      minWidth: 100,
      minHeight: 100,
      type: '',
      status: '',
      level: 0,
      rs: {
        top: '',
        left: '',
        bottom: '',
        right: '',
      },
    };

    return defaultItem;
  },
};

// actions
const actions = {
  resize({ commit, getters }, { id, type, direction, changeValue }) {
    const oldItem = getters.getItem(id);
    const movedLeft = changeValue > 0;
    const absValue = Math.abs(changeValue);
    let newItem;

    if (type === 'hbox') {
      if (direction === 'left') {
        newItem = {
          width: movedLeft ? oldItem.width - absValue
            : oldItem.width + absValue,
        };
      } else {
        // absValue -= 4;
        newItem = {
          width: movedLeft ? oldItem.width + absValue
            : oldItem.width - absValue,
          left: movedLeft ? oldItem.left - absValue
            : oldItem.left + absValue,
        };
      }
    } else if (type === 'vbox') {
      if (direction === 'left') {
        newItem = {
          height: movedLeft ? oldItem.height - absValue
            : oldItem.height + absValue,
        };
      } else {
        // absValue -= 4;
        newItem = {
          height: movedLeft ? oldItem.height + absValue
            : oldItem.height - absValue,
          top: movedLeft ? oldItem.top - absValue
            : oldItem.top + absValue,
        };
      }
    }

    commit('setItem', { id, newItem });
  },
  addNode({ commit, getters }, newItem) {
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
  addMapItem({ commit }, { level, newItem }) {
    commit('addMapItem', { level, newItem });
  },
  updateMapItem({ commit }, { level, oldId, newId, key }) {
    commit('setMapItem', { level, oldId, newId, key });
  },
  updateNode({ commit }, { id, newItem }) {
    commit('setItem', { id, newItem });
  },
  removeNode({ commit }, id) {
    commit('removeItem', id);
  },
  removeMapItem({ commit, getters }, { id, level }) {
    const removeMapItem = getters.getMapItem(id, level);
    const nodes = [];
    const addList = [];
    const removeList = [];
    let result = false;
    let mapItem;
    let mapItemByLevel;
    let nodeId;
    let otherId;

    if (removeMapItem) {
      const maps = getters.getAllMapItems();
      nodes.push(getters.getOtherIdInMapItemById(id, removeMapItem));

      for (let ix = level + 1, ixLen = maps.length; ix < ixLen; ix++) {
        mapItemByLevel = maps[ix];
        for (let jx = 0, jxLen = mapItemByLevel.length; jx < jxLen; jx++) {
          mapItem = mapItemByLevel[jx];
          for (let kx = 0, kxLen = nodes.length; kx < kxLen; kx++) {
            nodeId = nodes[kx];
            if (mapItem[nodeId]) {
              addList.push({ level: ix - 1, newItem: mapItem });
              removeList.push({ id: nodeId, level: ix });
              otherId = getters.getOtherIdInMapItemById(nodeId, mapItem);
              if (nodes.indexOf(otherId) === -1) {
                nodes.push(otherId);
              }
            }
          }
        }
      }

      if (removeList.length) {
        removeList.sort((a, b) => b.level - a.level);
      }

      for (let ix = 0, ixLen = removeList.length; ix < ixLen; ix++) {
        commit('removeMapItem', removeList[ix]);
      }

      for (let ix = 0, ixLen = addList.length; ix < ixLen; ix++) {
        commit('addMapItem', addList[ix]);
      }

      commit('removeMapItem', { id, level });
      result = true;
    }

    return result;
  },
};

// mutations
const mutations = {
  setMaps(state, { maps }) {
    state.maps = maps;
  },
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
  setMapItem(state, { level, oldId, newId, key }) {
    const items = state.maps[level];
    const propsName = key || oldId;
    let item;
    let oldValue;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (Object.hasOwnProperty.call(item, propsName)) {
        if (!key) {
          oldValue = item[oldId];
          delete items[ix][oldId];
          items[ix][newId] = oldValue;
        } else {
          items[ix][key] = newId;
        }
        break;
      }
    }
  },
  addItem(state, newItem) {
    const idSeq = +String.prototype.split.call(newItem.id, '-')[1];

    if (state.maxIdSeq < idSeq) {
      state.maxIdSeq = idSeq;
    }

    state.items.push(newItem);
  },
  addMapItem(state, { level, newItem }) {
    if (!state.maps[level]) {
      state.maps[level] = [];
    }

    state.maps[level].push(newItem);
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
  removeMapItem(state, { id, level }) {
    const maps = state.maps[level];

    for (let ix = 0, ixLen = maps.length; ix < ixLen; ix++) {
      if (maps[ix] && maps[ix][id]) {
        state.maps[level].splice(ix, 1);
        if (!state.maps[level].length) {
          state.maps.splice(level, 1);
        }
        break;
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
