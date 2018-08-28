export default {
  resize({ commit }, changeInfo) {
    commit('updateTree', changeInfo);
  },
  increaseIdSeq({ commit }, type) {
    commit('increaseIdSeq', type);
  },
  updateTreeItem({ commit }, newItem) {
    commit('updateTreeItem', newItem);
  },
  addItem({ commit }, newItem) {
    commit('addItem', newItem);
  },
  updateItem({ commit }, newItem) {
    commit('setItem', newItem);
  },
  removeItem({ commit }, newItem) {
    commit('removeItem', newItem);
  },
};
