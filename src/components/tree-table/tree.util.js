import _ from 'lodash';

export default {
  recursive(data, result, level, elb) {
    const elbow = elb;
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      const dataObj = data[ix];
      if (ix === ixLen - 1) { // elbow( | ) 인지 확인을 위해
        dataObj.elbow = elbow.slice(0, level);
        dataObj.last = true;
        elbow[level] = false;
      } else {
        dataObj.elbow = elbow.slice(0, level);
        dataObj.last = false;
        elbow[level] = true;
      }
      if (dataObj.children && dataObj.children.length) {
        dataObj.level = level;

        result.push(dataObj);

        if (dataObj.expend) {
          this.recursive(dataObj.children, result, level + 1, elbow);
        }
      } else {
        dataObj.level = level;
        dataObj.leaf = true;
        result.push(dataObj);
      }
    }
  },
  recursiveForCheck(data, result, level, elb, parent) {
    const elbow = elb;
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      const dataObj = data[ix];
      if (ix === ixLen - 1) { // elbow( | ) 인지 확인을 위해
        dataObj.elbow = elbow.slice(0, level);
        dataObj.last = true;
        elbow[level] = false;
      } else {
        dataObj.elbow = elbow.slice(0, level);
        dataObj.last = false;
        elbow[level] = true;
      }
      if (parent) {
        dataObj.parent = parent;
      }
      if (dataObj.children && dataObj.children.length) {
        dataObj.level = level;

        result.resultData.push(dataObj);

        if (dataObj.expend) {
          this.recursiveForCheck(dataObj.children, result, level + 1, elbow, dataObj);
        }
      } else {
        if (dataObj.last) {
          this.parentCheck(dataObj.parent);
          // const parentCheckedObj = _.countBy(dataObj.parent.children, ['checked', true]);
        }
        dataObj.level = level;
        dataObj.leaf = true;
        result.resultData.push(dataObj);
        if (dataObj.checked) {
          result.checkedData.push(dataObj.data);
          result.checkedObjData.push(dataObj);
        }
      }
    }
  },

  parentCheck(param, type) {
    const parent = param;
    const childrenCheckedObj = _.countBy(parent.children, ['checked', true]);
    let afterType = '';
    if (!childrenCheckedObj.true) {
      parent.checked = false;
    } else if (type === 'minus' || (childrenCheckedObj.true && childrenCheckedObj.false)) {
      parent.checked = true;
      parent.afterType = 'minus';
      afterType = 'minus';
    } else {
      parent.checked = true;
      parent.afterType = '';
    }
    if (parent.parent) {
      this.parentCheck(parent.parent, afterType);
    }
  },

  transformTreeToArray(data, check) {
    const result = {
      resultData: [],
      checkedData: [],
      checkedObjData: [],
    };
    if (check) {
      this.recursiveForCheck(data, result, 0, []);
    } else {
      this.recursive(data, result.resultData, 0, []);
    }
    return result;
  },
  childrenCheck(param, checked) {
    const rows = param;
    for (let ix = 0; ix < rows.length; ix++) {
      const rowData = rows[ix];
      rowData.checked = checked;
      if (rowData.children && rowData.children.length > 0) {
        this.childrenCheck(rowData.children, checked);
      }
    }
  },
  changeCheckbox(row, checkValue) {
    if (row.leaf) {
      console.log(checkValue);
    }
  },
};
