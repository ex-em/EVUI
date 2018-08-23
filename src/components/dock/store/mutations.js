/* eslint-disable no-shadow, arrow-parens */
import _ from 'lodash';
import { convertToValue, convertToPercent } from '@/common/utils';

export default {
  setDockingData(state, { dockingTree, nodes, splitters, maxIdSeq }) {
    state.dockingTree = dockingTree;
    state.nodes = nodes;
    state.splits = splitters;
    state.maxIdSeq = maxIdSeq;
  },
  increaseIdSeq(state, type) {
    state.maxIdSeq[type]++;
  },
  addItem(state, newItem) {
    const idSplit = String.prototype.split.call(newItem.id, '-');
    const type = `${idSplit[0]}s`;
    const idSeq = +idSplit[1];
    const items = state[type];
    const defaultItem = this.getters.getDefaultItem(idSplit[0]);
    let isExist = false;
    let item;
    let keys;
    let key;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (item.id === newItem.id) {
        isExist = true;
        break;
      }
    }

    if (!isExist) {
      item = _.cloneDeep(newItem);
      keys = Object.keys(defaultItem);
      for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
        key = keys[ix];
        if (!Object.hasOwnProperty.call(newItem, key)) {
          item[key] = defaultItem[key];
        }
      }

      state[type].push(item);
      if (state.maxIdSeq[idSplit[0]] < idSeq) {
        state.maxIdSeq[idSplit[0]] = idSeq;
      }
    }
  },
  removeItem(state, id) {
    const idSplit = String.prototype.split.call(id, '-');
    const type = `${idSplit[0]}s`;
    const items = state[type];
    let item;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (item.id === id) {
        state[type].splice(ix, 1);
        break;
      }
    }
  },
  setItem(state, newItem) {
    const idSplit = String.prototype.split.call(newItem.id, '-');
    const type = `${idSplit[0]}s`;
    const items = state[type];
    let item;
    let keys;
    let key;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (item.id === newItem.id) {
        keys = Object.keys(newItem);
        for (let jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
          key = keys[jx];
          if (key !== 'id' && Object.hasOwnProperty.call(item, key)) {
            item[key] = newItem[key];
          }
        }

        if (type === 'windows') {
          state.activeWindowId = item.id;
        }
        break;
      }
    }
  },
  spreadToChildForResize(state, parentItem) {
    const items = parentItem.items;
    const [leftItem, splitItem, rightItem] = items;
    const direction = parentItem.direction;
    const prevParentWidth = leftItem.width + rightItem.width;
    const prevParentHeight = leftItem.height + rightItem.height;
    const top = parentItem.top;
    const left = parentItem.left;
    let width = parentItem.width;
    let height = parentItem.height;
    let leftWidth = leftItem.width;
    let leftHeight = leftItem.height;

    leftItem.top = top;
    leftItem.left = left;
    leftItem.width = width;
    leftItem.height = height;
    rightItem.top = top;
    rightItem.left = left;
    rightItem.width = width;
    rightItem.height = height;
    splitItem.top = top;
    splitItem.left = left;

    if (direction === 'hbox' && width !== prevParentWidth) {
      width -= splitItem.width;
      leftWidth = convertToPercent(leftWidth, prevParentWidth);
      leftWidth = convertToValue(leftWidth, width);

      leftItem.width = leftWidth;
      splitItem.left = left + leftWidth;
      splitItem.height = height;
      rightItem.left = splitItem.left + splitItem.width;
      rightItem.width = width - leftWidth;
    } else if (direction === 'vbox' && height !== prevParentHeight) {
      height -= splitItem.height;
      leftHeight = convertToPercent(leftHeight, prevParentHeight);
      leftHeight = convertToValue(leftHeight, height);

      leftItem.height = leftHeight;
      splitItem.top = top + leftHeight;
      splitItem.width = width;
      rightItem.top = splitItem.top + splitItem.height;
      rightItem.height = height - leftHeight;
    }

    if (leftItem.items.length) {
      this.commit('spreadToChildForResize', leftItem);
    }

    if (rightItem.items.length) {
      this.commit('spreadToChildForResize', rightItem);
    }

    this.commit('setItem', leftItem);
    this.commit('setItem', splitItem);
    this.commit('setItem', rightItem);
  },
  updateTreeByNode(state, { items, changeInfo }) {
    const changeId = changeInfo.id;
    const leftItem = items[0];
    const rightItem = items[2];
    let isExist = false;
    let item;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (item.id === changeId) {
        isExist = true;
        break;
      }
    }

    if (isExist) {
      if (item.items.length) {
        this.commit('spreadToChildForResize', item);
      }
    } else {
      if (leftItem && leftItem.items.length) {
        this.commit('updateTreeByNode', { items: leftItem.items, changeInfo });
      }

      if (rightItem && rightItem.items.length) {
        this.commit('updateTreeByNode', { items: rightItem.items, changeInfo });
      }
    }
  },
  updateTreeBySplit(state, { items, changeInfo }) {
    const changeId = changeInfo.id;
    const changeItem = changeInfo.item;
    const changeValue = changeInfo.changeValue;
    const direction = changeInfo.direction;
    const movedLeft = changeInfo.isMoveToLeft;
    const leftItem = items[0];
    const splitItem = items[1];
    const rightItem = items[2];
    let isExist = false;
    let item;

    for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
      item = items[ix];
      if (item.id === changeId) {
        splitItem.left = changeItem.left;
        splitItem.top = changeItem.top;
        isExist = true;
        break;
      }
    }

    if (isExist) {
      if (movedLeft) {
        if (direction === 'hbox') {
          leftItem.width -= changeValue;
          rightItem.width += changeValue;
          rightItem.left -= changeValue;
        } else {
          leftItem.height -= changeValue;
          rightItem.height += changeValue;
          rightItem.top -= changeValue;
        }
      } else if (direction === 'hbox') {
        leftItem.width += changeValue;
        rightItem.width -= changeValue;
        rightItem.left += changeValue;
      } else {
        leftItem.height += changeValue;
        rightItem.height -= changeValue;
        rightItem.top += changeValue;
      }

      if (leftItem.items.length) {
        this.commit('spreadToChildForResize', leftItem);
      }

      if (rightItem.items.length) {
        this.commit('spreadToChildForResize', rightItem);
      }

      this.commit('setItem', leftItem);
      this.commit('setItem', rightItem);
    } else {
      if (leftItem && leftItem.items.length) {
        this.commit('updateTreeBySplit', { items: leftItem.items, changeInfo });
      }

      if (rightItem && rightItem.items.length) {
        this.commit('updateTreeBySplit', { items: rightItem.items, changeInfo });
      }
    }
  },
  updateTree(state, changeInfo) {
    const type = String.prototype.split.call(changeInfo.id, '-')[0];

    if (type === 'split') {
      this.commit('setItem', changeInfo.item);
      this.commit('updateTreeBySplit', { items: state.dockingTree.items, changeInfo });
    } else if (state.dockingTree.id === changeInfo.id) {
      this.commit('spreadToChildForResize', state.dockingTree);
    } else {
      this.commit('updateTreeByNode', { items: state.dockingTree.items, changeInfo });
    }
  },
  updateTreeItem(state, { items, newItem }) {
    if (!items) {
      if (!state.dockingTree.id || !newItem.id || state.dockingTree.id === newItem.id) {
        state.dockingTree = _.cloneDeep(newItem);
      } else {
        this.commit('updateTreeItem', { items: state.dockingTree.items, newItem });
      }
    } else {
      const childItems = items;
      let isChanged = false;

      for (let ix = 0, ixLen = childItems.length; ix < ixLen; ix++) {
        if (childItems[ix].id === newItem.id) {
          childItems[ix] = _.cloneDeep(newItem);
          isChanged = true;
          break;
        }
      }

      if (!isChanged && childItems.length) {
        if (childItems[0].items.length) {
          this.commit('updateTreeItem', { items: childItems[0].items, newItem });
        }

        if (childItems[2].items.length) {
          this.commit('updateTreeItem', { items: childItems[2].items, newItem });
        }
      }
    }
  },
};
