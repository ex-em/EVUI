export default {
  recursive(data, result, level) {
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      const dataObj = data[ix];
      if (dataObj.children && dataObj.children.length !== 0) {
        dataObj.level = level;
        result.push(dataObj);

        if (dataObj.expend === true) {
          this.recursive(dataObj.children, result, level + 1);
        }
      } else {
        dataObj.level = level;
        dataObj.leaf = true;
        result.push(dataObj);
      }
    }
  },

  transformTreeToArray(data) {
    const result = [];
    this.recursive(data, result, 0);
    return result;
  },
};
