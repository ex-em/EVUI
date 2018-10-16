export default {
  recursive(data, result, level, elbow) {
    const elbow1 = elbow;
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      const dataObj = data[ix];
      if (ix === ixLen - 1) {
        dataObj.elbow = elbow.slice(0, level);
        elbow1[level] = false;
      } else {
        dataObj.elbow = elbow.slice(0, level);
        elbow1[level] = true;
      }
      if (ix === ixLen - 1) {
        dataObj.last = true;
      } else {
        dataObj.last = false;
      }
      if (dataObj.children && dataObj.children.length) {
        dataObj.level = level;

        result.push(dataObj);

        if (dataObj.expend) {
          this.recursive(dataObj.children, result, level + 1, elbow1);
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
    this.recursive(data, result, 0, []);
    return result;
  },
};
