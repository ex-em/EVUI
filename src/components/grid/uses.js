import { getCurrentInstance } from 'vue';
import { isEqual, uniqBy } from 'lodash-es';
import { numberWithComma } from '@/common/utils';

const ROW_INDEX = 0;
const ROW_CHECK_INDEX = 1;
const ROW_DATA_INDEX = 2;

export const commonFunctions = () => {
  const { props } = getCurrentInstance();
  /**
   * 해당 컬럼이 사용자 지정 컬럼인지 확인한다.
   *
   * @param {object} column - 컬럼 정보
   * @returns {boolean} 사용자 지정 컬럼 유무
   */
  const isRenderer = (column = {}) => !!column?.render?.use;
  const getComponentName = (type = '') => {
    const setUpperCaseFirstStr = str => str.charAt(0).toUpperCase() + str.slice(1);
    const rendererStr = 'Renderer';
    let typeStr = '';
    if (type.indexOf('_') !== -1) {
      const typeStrArray = type.split('_');
      for (let ix = 0; ix < typeStrArray.length; ix++) {
        typeStr += setUpperCaseFirstStr(typeStrArray[ix]);
      }
    } else {
      typeStr = setUpperCaseFirstStr(type);
    }
    return typeStr + rendererStr;
  };
  /**
   * 데이터 타입에 따라 변환된 데이터을 반환한다.
   *
   * @param {string} type - 데이터 유형
   * @param {number|string} value - 데이터
   * @returns {number|string} 변환된 데이터
   */
  const getConvertValue = (type, value) => {
    let convertValue = value;

    if (type === 'number') {
      convertValue = numberWithComma(value);
      convertValue = convertValue === false ? value : convertValue;
    } else if (type === 'float') {
      convertValue = value.toFixed(3);
    }

    return convertValue;
  };
  /**
   * 전달받은 필드명과 일치하는 컬럼 인덱스를 반환한다.
   *
   * @param {string} field - 컬럼 필드명
   * @returns {number} 일치한다면 컬럼 인덱스, 일치하지 않는다면 -1
   */
  const getColumnIndex = field => props.columns.findIndex(column => column.field === field);
  const setPixelUnit = (value) => {
    let size = value;
    const hasPx = size.toString().indexOf('px') >= 0;
    const hasPct = size.toString().indexOf('%') >= 0;
    if (!hasPx && !hasPct) {
      size = `${size}px`;
    }
    return size;
  };
  return { isRenderer, getComponentName, getConvertValue, getColumnIndex, setPixelUnit };
};

export const scrollEvent = (params) => {
  const { scrollInfo, stores, elementInfo, resizeInfo } = params;
  /**
   * 수직 스크롤의 위치 계산 후 적용한다.
   */
  const updateVScroll = () => {
    const bodyEl = elementInfo.body;
    const rowHeight = resizeInfo.rowHeight;
    const rowCount = bodyEl.clientHeight > rowHeight
      ? Math.ceil(bodyEl.clientHeight / rowHeight) : stores.store.length;
    const totalScrollHeight = stores.store.length * rowHeight;
    let firstVisibleIndex = Math.floor(bodyEl.scrollTop / rowHeight);
    if (firstVisibleIndex > stores.store.length - 1) {
      firstVisibleIndex = 0;
    }

    const lastVisibleIndex = firstVisibleIndex + rowCount;
    const firstIndex = Math.max(firstVisibleIndex, 0);
    const lastIndex = lastVisibleIndex;

    stores.viewStore = stores.store.slice(firstIndex, lastIndex);
    scrollInfo.hasVerticalScrollBar = rowCount < stores.store.length;
    scrollInfo.vScrollTopHeight = firstIndex * rowHeight;
    scrollInfo.vScrollBottomHeight = totalScrollHeight - (stores.viewStore.length * rowHeight)
      - scrollInfo.vScrollTopHeight;
  };
  /**
   * 수평 스크롤의 위치 계산 후 적용한다.
   */
  const updateHScroll = () => {
    const headerEl = elementInfo.header;
    const bodyEl = elementInfo.body;

    headerEl.scrollLeft = bodyEl.scrollLeft;
  };
  /**
   * scroll 이벤트를 처리한다.
   */
  const onScroll = () => {
    const bodyEl = elementInfo.body;
    const scrollTop = bodyEl.scrollTop;
    const scrollLeft = bodyEl.scrollLeft;
    const lastTop = scrollInfo.lastScroll.top;
    const lastLeft = scrollInfo.lastScroll.left;
    const isHorizontal = !(scrollLeft === lastLeft);
    const isVertical = !(scrollTop === lastTop);

    if (isVertical && bodyEl.clientHeight) {
      updateVScroll();
    }

    if (isHorizontal) {
      updateHScroll();
    }

    scrollInfo.lastScroll.top = scrollTop;
    scrollInfo.lastScroll.left = scrollLeft;
  };
  return { updateVScroll, updateHScroll, onScroll };
};

export const resizeEvent = (params) => {
  const { props } = getCurrentInstance();
  const { resizeInfo, elementInfo, checkInfo, stores, isRenderer, updateVScroll } = params;
  /**
   * 해당 컬럼 인덱스가 마지막인지 확인한다.
   *
   * @param {number} index - 컬럼 인덱스
   * @returns {boolean} 마지막 컬럼 유무
   */
  const isLastColumn = (index) => {
    const columns = stores.orderedColumns;
    let lastIndex = -1;

    for (let ix = columns.length - 1; ix >= 0; ix--) {
      if (!columns[ix].hide) {
        lastIndex = ix;
        break;
      }
    }

    return lastIndex === index;
  };
  /**
   * 고정 너비, 스크롤 유무 등에 따른 컬럼 너비를 계산한다.
   */
  const calculatedColumn = () => {
    let columnWidth = resizeInfo.columnWidth;
    let remainWidth = 0;
    if (resizeInfo.adjust) {
      const bodyEl = elementInfo.body;
      let elWidth = bodyEl.offsetWidth;
      const elHeight = bodyEl.offsetHeight;
      const result = stores.orderedColumns.reduce((acc, cur) => {
        if (cur.hide) {
          return acc;
        }
        if (cur.field === 'db-icon' || cur.field === 'user-icon') {
          cur.width = resizeInfo.iconWidth;
        }
        if (cur.width) {
          acc.totalWidth += cur.width;
        } else {
          acc.emptyCount++;
        }

        return acc;
      }, { totalWidth: 0, emptyCount: 0 });

      if (resizeInfo.rowHeight * props.rows.length > elHeight) {
        elWidth -= resizeInfo.scrollWidth;
      }

      if (checkInfo.useCheckbox.use) {
        elWidth -= resizeInfo.minWidth;
      }

      columnWidth = elWidth - result.totalWidth;
      if (columnWidth > 0) {
        remainWidth = columnWidth
          - (Math.floor(columnWidth / result.emptyCount) * result.emptyCount);
        columnWidth = Math.floor(columnWidth / result.emptyCount);
      } else {
        columnWidth = resizeInfo.columnWidth;
      }

      columnWidth = columnWidth < resizeInfo.minWidth ? resizeInfo.minWidth : columnWidth;
      resizeInfo.columnWidth = columnWidth;
    }

    stores.orderedColumns.map((column) => {
      const item = column;
      const minWidth = isRenderer(column) ? resizeInfo.rendererMinWidth : resizeInfo.minWidth;
      if (item.width && item.width < minWidth) {
        item.width = minWidth;
      }
      if (!item.width && !item.hide) {
        item.width = columnWidth;
      }
      return item;
    });

    if (remainWidth) {
      let index = stores.orderedColumns.length - 1;
      let lastColumn = stores.orderedColumns[index];
      while (lastColumn.hide) {
        index -= 1;
        lastColumn = stores.orderedColumns[index];
      }
      lastColumn.width += remainWidth;
    }
  };
  /**
   * grid resize 이벤트를 처리한다.
   */
  const onResize = () => {
    if (resizeInfo.adjust) {
      stores.orderedColumns.map((column) => {
        const item = column;

        if (!props.columns[column.index].width && !item.resized) {
          item.width = 0;
        }

        return item;
      }, this);
    }

    calculatedColumn();
    if (elementInfo.body?.clientHeight) {
      updateVScroll();
    }
  };

  const onShow = (isVisible) => {
    if (isVisible) {
      onResize();
    }
  };

  /**
   * column resize 이벤트를 처리한다.
   *
   * @param {number} columnIndex - 컬럼 인덱스
   * @param {object} event - 이벤트 객체
   */
  const onColumnResize = (columnIndex, event) => {
    let nextColumnIndex = columnIndex + 1;
    const headerEl = elementInfo.header;
    const headerLeft = headerEl.getBoundingClientRect().left;
    const columnEl = headerEl.querySelector(`li[data-index="${columnIndex}"]`);
    if (!isLastColumn(columnIndex) && !columnEl.className.includes('db-icon')
      && !columnEl.className.includes('user-icon')) {
      while (stores.orderedColumns[nextColumnIndex].hide) {
        nextColumnIndex++;
      }
      const minWidth = isRenderer(stores.orderedColumns[columnIndex])
        ? resizeInfo.rendererMinWidth : resizeInfo.minWidth;
      const nextMinWidth = isRenderer(stores.orderedColumns[nextColumnIndex])
        ? resizeInfo.rendererMinWidth : resizeInfo.minWidth;
      const nextColumnEl = headerEl.querySelector(`li[data-index="${nextColumnIndex}"]`);
      const columnRect = columnEl.getBoundingClientRect();
      const maxRight = nextColumnEl.getBoundingClientRect().right - headerLeft - nextMinWidth;
      const resizeLineEl = elementInfo.resizeLine;
      const minLeft = columnRect.left - headerLeft + minWidth;
      const startLeft = columnRect.right - headerLeft;
      const startMouseLeft = event.clientX;
      const startColumnLeft = columnRect.left - headerLeft;

      resizeLineEl.style.left = `${startLeft}px`;

      resizeInfo.showResizeLine = true;

      const handleMouseMove = (evt) => {
        const deltaLeft = evt.clientX - startMouseLeft;
        const proxyLeft = startLeft + deltaLeft;
        let resizeWidth = Math.max(minLeft, proxyLeft);

        resizeWidth = Math.min(maxRight, resizeWidth);

        resizeLineEl.style.left = `${resizeWidth}px`;
      };

      const handleMouseUp = () => {
        const destLeft = parseInt(resizeLineEl.style.left, 10);
        const changedWidth = destLeft - startColumnLeft;

        if (stores.orderedColumns[columnIndex]) {
          const columnWidth = stores.orderedColumns[columnIndex].width;
          stores.orderedColumns[columnIndex].width = changedWidth;
          stores.orderedColumns[columnIndex].resized = true;
          stores.orderedColumns[nextColumnIndex].width += (columnWidth - changedWidth);
          stores.orderedColumns[nextColumnIndex].resized = true;
        }

        resizeInfo.showResizeLine = false;
        document.removeEventListener('mousemove', handleMouseMove);
        onResize();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp, { once: true });
    }
  };
  return { calculatedColumn, onResize, onShow, onColumnResize };
};

export const clickEvent = (params) => {
  const { emit } = getCurrentInstance();
  const selectInfo = params;
  const getClickedRowData = (event, row) => {
    const tagName = event.target.tagName.toLowerCase();
    let cellInfo = {};
    if (tagName === 'td') {
      cellInfo = event.target.dataset;
    } else {
      cellInfo = event.target.parentNode.dataset;
    }
    return {
      event,
      rowData: row[ROW_DATA_INDEX],
      rowIndex: row[ROW_INDEX],
      cellName: cellInfo.name,
      cellIndex: cellInfo.index,
    };
  };
  /**
   * row click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} row - row 데이터
   */
  const onRowClick = (event, row) => {
    if (event.target && event.target.parentElement
      && event.target.parentElement.classList.contains('row-checkbox-input')) {
      return false;
    }
    if (selectInfo.useSelect) {
      const rowData = row[ROW_DATA_INDEX];
      selectInfo.selectedRow = rowData;
      emit('update:selected', rowData);
      emit('click-row', getClickedRowData(event, row));
    }
    return true;
  };
  /**
   * row dblclick 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} row - row 데이터
   */
  const onRowDblClick = (event, row) => {
    const rowData = row[ROW_DATA_INDEX];
    selectInfo.selectedRow = rowData;
    emit('update:selected', rowData);
    emit('dblclick-row', getClickedRowData(event, row));
  };
  return { onRowClick, onRowDblClick };
};

export const checkEvent = (params) => {
  const { checkInfo, stores } = params;
  const { emit } = getCurrentInstance();
  /**
   * row에 대한 체크 상태를 해제한다.
   *
   * @param {array} row - row 데이터
   */
  const unCheckedRow = (row) => {
    const index = stores.originStore.findIndex(
      item => item[ROW_DATA_INDEX] === row[ROW_DATA_INDEX]);

    if (index !== -1) {
      stores.originStore[index][ROW_CHECK_INDEX] = row[ROW_CHECK_INDEX];
    }
  };
  /**
   * checkbox click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} row - row 데이터
   */
  const onCheck = (event, row) => {
    if (checkInfo.useCheckbox.mode === 'single' && checkInfo.prevCheckedRow.length) {
      checkInfo.prevCheckedRow[ROW_CHECK_INDEX] = false;
      unCheckedRow(checkInfo.prevCheckedRow);
    }

    if (row[ROW_CHECK_INDEX]) {
      if (checkInfo.useCheckbox.mode === 'single') {
        checkInfo.checkedRows = [row[ROW_DATA_INDEX]];
        checkInfo.checkedIndex.clear();
      } else {
        checkInfo.checkedRows.push(row[ROW_DATA_INDEX]);
      }
      checkInfo.checkedIndex.add(row[ROW_INDEX]);

      const store = stores.store;
      const isAllChecked = store.every(d => d[ROW_CHECK_INDEX]);
      if (store.length && isAllChecked) {
        checkInfo.isHeaderChecked = true;
      }
    } else {
      if (checkInfo.useCheckbox.mode === 'single') {
        checkInfo.checkedRows = [];
        checkInfo.checkedIndex.clear();
      } else {
        checkInfo.checkedRows.splice(checkInfo.checkedRows.indexOf(row[ROW_DATA_INDEX]), 1);
        checkInfo.checkedIndex.delete(row[ROW_INDEX]);
      }
      checkInfo.isHeaderChecked = false;
    }
    checkInfo.prevCheckedRow = row.slice();
    emit('update:checked', checkInfo.checkedRows);
    emit('check-row', event, row[ROW_INDEX], row[ROW_DATA_INDEX]);
  };
  /**
   * all checkbox click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   */
  const onCheckAll = (event) => {
    const isHeaderChecked = checkInfo.isHeaderChecked;
    const store = stores.store;
    store.forEach((row) => {
      if (isHeaderChecked) {
        if (!checkInfo.checkedRows.includes(row[ROW_DATA_INDEX])) {
          checkInfo.checkedRows.push(row[ROW_DATA_INDEX]);
        }
        if (!checkInfo.checkedIndex.has(row[ROW_INDEX])) {
          checkInfo.checkedIndex.add(row[ROW_INDEX]);
        }
      } else {
        checkInfo.checkedRows.splice(checkInfo.checkedRows.indexOf(row[ROW_DATA_INDEX]), 1);
        checkInfo.checkedIndex.delete(row[ROW_INDEX]);
      }
      row[ROW_CHECK_INDEX] = isHeaderChecked;
    });
    emit('update:checked', checkInfo.checkedRows);
    emit('check-all', event, checkInfo.checkedRows);
  };
  return { onCheck, onCheckAll };
};

export const sortEvent = (params) => {
  const { sortInfo, stores, getColumnIndex } = params;
  const { props } = getCurrentInstance();
  function OrderQueue() {
    this.orders = ['asc', 'desc', 'init'];
    this.dequeue = () => this.orders.shift();
    this.enqueue = o => this.orders.push(o);
  }
  const order = new OrderQueue();
  /**
   * sort 이벤트를 처리한다.
   *
   * @param {object} column - 컬럼 정보
   */
  const onSort = (column) => {
    const sortable = column.sortable === undefined ? true : column.sortable;
    if (sortable) {
      if (sortInfo.sortField !== column?.field) {
        order.orders = ['asc', 'desc', 'init'];
        sortInfo.sortField = column?.field;
      }
      sortInfo.sortOrder = order.dequeue();
      order.enqueue(sortInfo.sortOrder);

      sortInfo.isSorting = true;
    }
  };
  /**
   * 설정값에 따라 해당 컬럼 데이터에 대해 정렬한다.
   */
  const setSort = () => {
    const setDesc = (a, b) => (a > b ? -1 : 1);
    const setAsc = (a, b) => (a < b ? -1 : 1);
    if (sortInfo.sortOrder === 'init' || (!sortInfo.sortField && !sortInfo.isSorting)) {
      stores.store.sort((a, b) => {
        if (typeof a[ROW_INDEX] === 'number') {
          return setAsc(a[ROW_INDEX], b[ROW_INDEX]);
        }
        return 0;
      });
      return;
    }
    const index = getColumnIndex(sortInfo.sortField);
    const type = props.columns[index]?.type || 'string';
    const sortFn = sortInfo.sortOrder === 'desc' ? setDesc : setAsc;
    if (type === 'string') {
      stores.store.sort((a, b) => {
        if (typeof a[ROW_DATA_INDEX][index] === 'string') {
          return sortFn(a[ROW_DATA_INDEX][index]?.toLowerCase(),
            b[ROW_DATA_INDEX][index]?.toLowerCase());
        }
        return 0;
      });
    } else {
      stores.store.sort((a, b) => {
        if (typeof a[ROW_DATA_INDEX][index] === 'number') {
          return sortFn(a[ROW_DATA_INDEX][index], b[ROW_DATA_INDEX][index]);
        }
        return 0;
      });
    }
  };
  return { onSort, setSort };
};

export const filterEvent = (params) => {
  const { props } = getCurrentInstance();
  const {
    filterInfo,
    stores,
    checkInfo,
    getColumnIndex,
    getConvertValue,
    updateVScroll,
  } = params;
  /**
   * 해당 컬럼에 대한 필터 팝업을 보여준다.
   *
   * @param {object} column - 컬럼 정보
   */
  const onClickFilter = (column) => {
    const filter = {
      column,
      items: [],
    };
    const filterItems = filterInfo.filterList[column.field];

    if (filterItems) {
      filter.items = filterItems;
    }

    filterInfo.currentFilter = filter;
    filterInfo.showFilterWindow = true;
  };
  /**
   * 필터 팝업 관련 데이터 초기화 및 숨김 처리한다.
   */
  const onCloseFilterWindow = () => {
    filterInfo.currentFilter = {
      column: {},
      items: [],
    };
    filterInfo.showFilterWindow = false;
  };
  /**
   * 전달된 필터 정보를 저장하고 store에 반영한다.
   *
   * @param {string} columnField - row 데이터
   * @param {array} filters - 필터 정보
   */
  const onApplyFilter = (columnField, filters) => {
    filterInfo.filterList[columnField] = filters;
    stores.filterStore = [];
    filterInfo.setFiltering = true;
  };
  /**
   * 전달받은 문자열 내 해당 키워드가 존재하는지 확인한다.
   *
   * @param {string} search - 검색 키워드
   * @param {string} origin - 기준 문자열
   * @returns {boolean} 문자열 내 키워드 존재 유무
   */
  const likeSearch = (search, origin) => {
    if (typeof search !== 'string' || origin === null) {
      return false;
    }
    let regx = search.replace(new RegExp('([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])', 'g'), '\\$1');
    regx = regx.replace(/%/g, '.*').replace(/_/g, '.');

    return RegExp(`^${regx}$`, 'gi').test(origin);
  };
  /**
   * 필터 조건에 따라 문자열을 확인한다.
   *
   * @param {array} item - row 데이터
   * @param {object} condition - 필터 정보
   * @returns {boolean} 확인 결과
   */
  const stringFilter = (item, condition) => {
    const comparison = condition.comparison;
    const conditionValue = condition.value;
    const value = item[ROW_DATA_INDEX][condition.index];
    let result;

    if (comparison === 'Equal') {
      result = value === conditionValue;
    } else if (comparison === 'Not Equal') {
      result = value !== conditionValue;
    } else if (comparison === 'Like') {
      result = likeSearch(`%${conditionValue}%`, value);
    } else if (comparison === 'Not Like') {
      result = !likeSearch(`%${conditionValue}%`, value);
    }

    return result;
  };
  /**
   * 필터 조건에 따라 숫자를 확인한다.
   *
   * @param {array} item - row 데이터
   * @param {object} condition - 필터 정보
   * @param {string} filterType - 데이터 유형
   * @returns {boolean} 확인 결과
   */
  const numberFilter = (item, condition, filterType) => {
    const comparison = condition.comparison;
    const conditionValue = Number(condition.value);
    let value = Number(item[ROW_DATA_INDEX][condition.index]);
    let result;
    if (filterType === 'float') {
      value = Number(value.toFixed(3));
    }

    if (comparison === '=') {
      result = value === conditionValue;
    } else if (comparison === '>') {
      result = value > conditionValue;
    } else if (comparison === '<') {
      result = value < conditionValue;
    }

    return result;
  };
  /**
   * 필터 조건이 적용된 데이터를 반환한다.
   *
   * @param {array} data - row 데이터
   * @param {string} filterType - 데이터 유형
   * @param {object} condition - 필터 정보
   * @returns {boolean} 확인 결과
   */
  const getFilteredData = (data, filterType, condition) => {
    const filterFn = filterType === 'string' ? stringFilter : numberFilter;
    const filteredData = [];

    for (let ix = 0; ix < data.length; ix++) {
      if (filterFn(data[ix], condition, filterType)) {
        filteredData.push(data[ix]);
      }
    }

    return filteredData;
  };
  /**
   * 전체 데이터에서 설정된 필터 적용 후 결과를 filterStore에 저장한다.
   */
  const setFilter = () => {
    let field;
    let index;
    let filters;
    let columnType;
    let filterStore = [];
    let isAppliedFilter = false;
    const filterByColumn = filterInfo.filterList;
    const fields = Object.keys(filterByColumn || {});
    const store = stores.originStore;

    for (let ix = 0; ix < fields.length; ix++) {
      field = fields[ix];
      filters = filterByColumn[field];
      index = getColumnIndex(field);
      columnType = props.columns[index].type;
      for (let jx = 0; jx < filters.length; jx++) {
        const filterItem = filters[jx];
        if (filterItem.use) {
          isAppliedFilter = true;
          if (!filterStore.length) {
            filterStore = getFilteredData(store, columnType, {
              ...filterItem,
              index,
            });
          } else if (filterItem.type === 'OR') {
            filterStore.push(...getFilteredData(store, columnType, {
              ...filterItem,
              index,
            }));
          } else {
            filterStore = getFilteredData(filterStore, columnType, {
              ...filterItem,
              index,
            });
          }
        }
      }
    }

    if (!isAppliedFilter) {
      stores.filterStore = store;
    } else {
      stores.filterStore = uniqBy(filterStore, JSON.stringify);
    }
  };
  let timer = null;
  const onSearch = (searchWord) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      filterInfo.isSearch = false;
      if (searchWord) {
        stores.searchStore = stores.store.filter((row) => {
          let isShow = false;
          for (let ix = 0; ix < stores.orderedColumns.length; ix++) {
            const column = stores.orderedColumns[ix] || {};
            let columnValue = row[ROW_DATA_INDEX][ix];
            const columnType = column.type || 'string';
            if (columnValue) {
              if (typeof columnValue === 'object') {
                columnValue = columnValue[column.field];
              }
              if (!column.hide && (column?.searchable === undefined || column?.searchable)) {
                columnValue = getConvertValue(columnType, columnValue).toString();
                isShow = columnValue.toLowerCase().includes(searchWord.toString().toLowerCase());
                if (isShow) {
                  break;
                }
              }
            }
          }
          return isShow;
        });
        filterInfo.isSearch = true;
      }
      const store = stores.store;
      let checkedCount = 0;
      for (let ix = 0; ix < store.length; ix++) {
        if (checkInfo.checkedIndex.has(store[ix][ROW_INDEX])) {
          store[ix][ROW_CHECK_INDEX] = true;
          checkedCount += 1;
        } else {
          store[ix][ROW_CHECK_INDEX] = false;
        }
      }
      if (store.length && store.length === checkedCount) {
        checkInfo.isHeaderChecked = true;
      } else {
        checkInfo.isHeaderChecked = false;
      }
      updateVScroll();
    }, 500);
  };
  return { onClickFilter, onCloseFilterWindow, onApplyFilter, setFilter, onSearch };
};

export const contextMenuEvent = (params) => {
  const { emit } = getCurrentInstance();
  const { contextInfo, stores, filterInfo, selectInfo, setStore } = params;
  /**
   * 컨텍스트 메뉴를 설정한다.
   *
   * @param {boolean} useCustom - 사용자 지정 메뉴 사용 유무
   */
  const setContextMenu = (useCustom = true) => {
    const menuItems = [];

    if (useCustom && contextInfo.customContextMenu.length) {
      const row = selectInfo.selectedRow;
      const customItems = contextInfo.customContextMenu.map(
        (item) => {
          const menuItem = item;
          if (menuItem.validate) {
            menuItem.disabled = !menuItem.validate(menuItem.itemId, row);
          }

          return menuItem;
        });

      menuItems.push(...customItems);
    }

    if (filterInfo.useFilter) {
      menuItems.push({
        text: filterInfo.isFiltering ? 'Filter Off' : 'Filter On',
        iconClass: 'ev-icon-filter',
        click: () => {
          filterInfo.isFiltering = !filterInfo.isFiltering;
          stores.filterStore = [];
          setStore([], false);
        },
      });
    }
    contextInfo.contextMenuItems = menuItems;
  };
  /**
   * 마우스 우클릭 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   */
  const onContextMenu = (event) => {
    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    let rowIndex;

    if (tagName === 'td') {
      rowIndex = target.parentElement.dataset.index;
    } else {
      rowIndex = target.parentElement.parentElement.dataset.index;
    }

    if (rowIndex) {
      const rowData = stores.viewStore[+rowIndex][ROW_DATA_INDEX];
      selectInfo.selectedRow = rowData;
      setContextMenu();
      emit('update:selected', rowData);
    } else {
      selectInfo.selectedRow = [];
      setContextMenu(false);
      emit('update:selected', []);
    }
  };
  return { setContextMenu, onContextMenu };
};

export const storeEvent = (params) => {
  const { props } = getCurrentInstance();
  const {
    selectInfo,
    checkInfo,
    stores,
    sortInfo,
    filterInfo,
    elementInfo,
    setSort,
    setFilter,
    updateVScroll,
  } = params;
  /**
   * 전달된 데이터를 내부 store 및 속성에 저장한다.
   *
   * @param {array} value - row 데이터
   * @param {boolean} isMakeIndex - 인덱스 생성 유무
   */
  const setStore = (value, isMakeIndex = true) => {
    const store = [];
    let checked;
    let selected = false;
    if (isMakeIndex) {
      let hasUnChecked = false;
      for (let ix = 0; ix < value.length; ix++) {
        checked = props.checked.includes(value[ix]);
        if (!checked) {
          hasUnChecked = true;
        }
        if (!selected && isEqual(selectInfo.selectedRow, value[ix])) {
          selectInfo.selectedRow = value[ix];
          selected = true;
        }
        store.push([ix, checked, value[ix]]);
      }
      if (!selected) {
        selectInfo.selectedRow = [];
      }
      checkInfo.isHeaderChecked = value.length > 0 ? !hasUnChecked : false;
      stores.originStore = store;
    }
    if (filterInfo.isFiltering) {
      setFilter();
    }
    if (sortInfo.sortField) {
      setSort();
    }
    if (elementInfo.body?.clientHeight) {
      updateVScroll();
    }
  };
  /**
   * 컴포넌트의 변경 데이터를 store에 업데이트한다.
   *
   * @param {number} rowIndex - row 인덱스
   * @param {number} cellIndex - cell 인덱스
   * @param {number|string} newValue - 데이터
   */
  const updateData = (rowIndex, cellIndex, newValue) => {
    const row = stores.store.filter(data => data[0] === rowIndex);
    if (row) {
      row[0][ROW_DATA_INDEX][cellIndex] = newValue;
    }
  };
  return { setStore, updateData };
};
