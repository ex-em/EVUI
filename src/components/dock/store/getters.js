/* eslint-disable no-shadow, arrow-parens */
import _ from 'lodash';
import { convertToValue } from '@/common/utils';

const defaultItems = {
  node: {
    id: '',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    minWidth: 100,
    minHeight: 100,
    direction: '',
    contents: '',
    items: [],
  },
  split: {
    id: '',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    direction: '',
    contents: '',
  },
  window: {
    id: '',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    minWidth: 100,
    minHeight: 100,
    contents: '',
    restoreInfo: null,
  },
};

export default {
  getDefaultItem: () => (type) => _.cloneDeep(defaultItems[type]),
  getDockingTree: (state) => () => _.cloneDeep(state.dockingTree),
  getMaxIdSeq: (state) => (type) => state.maxIdSeq[type],
  getItemsById: (state, getters) => (treeItem, id, type) => {
    const childItems = !treeItem ? state.dockingTree.items : treeItem.items;
    let result;

    if (!childItems.length) {
      if (type !== 'parent' && state.dockingTree.id === id) {
        result = state.dockingTree;
      } else {
        return undefined;
      }
    } else {
      result = childItems.find(item => item.id === id);
      if (result) {
        if (!type) {
          result = childItems;
        } else if (type === 'parent') {
          result = !treeItem ? state.dockingTree : treeItem;
        }
      } else {
        result = getters.getItemsById(childItems[0], id, type);
        if (!result) {
          result = getters.getItemsById(childItems[2], id, type);
        }
      }
    }

    return _.cloneDeep(result);
  },
  getLastItem: (state, getters) => (item, type) => {
    let result;

    if (item.items.length) {
      if (type === 'left') {
        result = getters.getLastItem(item.items[0], type);
      } else {
        result = getters.getLastItem(item.items[2], type);
      }
    } else {
      result = item;
    }

    return result;
  },
  getBoundsForSplitter: (state, getters) => (id, parentWidth, parentHeight) => {
    const items = getters.getItemsById(null, id);
    const [leftItem, splitItem, rightItem] = items;
    const direction = splitItem.direction;
    let min = 0;
    let max = 0;
    let lastItem;
    let top;
    let left;
    let width;
    let height;

    if (leftItem) {
      lastItem = getters.getLastItem(leftItem, 'right');
      if (lastItem) {
        if (direction === 'hbox') {
          left = convertToValue(lastItem.left, parentWidth);
          min = left + lastItem.minWidth;
        } else {
          top = convertToValue(lastItem.top, parentHeight);
          min = top + lastItem.minHeight;
        }
      }
    }

    if (rightItem) {
      lastItem = getters.getLastItem(rightItem, 'left');
      if (lastItem) {
        if (direction === 'hbox') {
          left = convertToValue(lastItem.left, parentWidth);
          width = convertToValue(lastItem.width, parentWidth);
          max = (left + width) - lastItem.minWidth;
        } else {
          top = convertToValue(lastItem.top, parentHeight);
          height = convertToValue(lastItem.height, parentHeight);
          max = (top + height) - lastItem.minHeight;
        }
      }
    }

    return {
      min,
      max,
    };
  },
  getActiveWindow: (state) => () => {
    const windows = state.windows;

    return _.cloneDeep(windows.find(window => window.id === state.activeWindowId));
  },
};
