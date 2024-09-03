import { getCurrentInstance, nextTick } from 'vue';
import { numberWithComma } from '@/common/utils';

export const commonFunctions = (params) => {
  const { props } = getCurrentInstance();
  const { checkInfo } = params;
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
   * @param {object} column - 컬럼 정보
   * @param {number|string} value - 데이터
   * @returns {number|string} 변환된 데이터
   */
  const getConvertValue = (column, value) => {
    let convertValue = column.type === 'number' || column.type === 'float' ? Number(value) : value;

    if (column.type === 'number') {
      convertValue = numberWithComma(value);
      convertValue = convertValue === false ? value : convertValue;
    } else if (column.type === 'float') {
      const floatValue = convertValue.toFixed(column.decimal ?? 3);
      convertValue = floatValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
  const checkHeader = (rows) => {
    checkInfo.isHeaderChecked = !!rows.length && rows.every(row => row.checked);
    const uncheckableList = rows.filter(row => row.uncheckable);
    if (uncheckableList.length) {
      const checkedList = rows.filter(row => row.checked);
      const isAllUncheckable = rows.every(row => uncheckableList.includes(row));

      checkInfo.isHeaderChecked = !isAllUncheckable
        && (uncheckableList.length + checkedList.length === rows.length);
      checkInfo.isHeaderUncheckable = isAllUncheckable;
    }
    checkInfo.isHeaderIndeterminate = !!rows.length
      && rows.some(row => row.checked || row.indeterminate)
      && !checkInfo.isHeaderChecked;
  };
  return {
    isRenderer,
    getComponentName,
    getConvertValue,
    getColumnIndex,
    setPixelUnit,
    checkHeader,
  };
};

export const getUpdatedColumns = (stores) => {
  const { originColumns, filteredColumns } = stores;
  return originColumns.map((col) => {
    const changedCol = filteredColumns.find(fcol => fcol.index === col.index) ?? {};
    return {
      ...col,
      ...changedCol,
    };
  });
};

export const scrollEvent = (params) => {
  const {
    scrollInfo,
    stores,
    elementInfo,
    resizeInfo,
    pageInfo,
    summaryScroll,
    getPagingData,
    updatePagingInfo,
  } = params;
  /**
   * 수직 스크롤의 위치 계산 후 적용한다.
   */
  const updateVScroll = (isScroll) => {
    let store = stores.showTreeStore;
    if (pageInfo.isClientPaging) {
      store = getPagingData();
    }
    const bodyEl = elementInfo.body;
    if (bodyEl) {
      const rowHeight = resizeInfo.rowHeight;
      const rowCount = bodyEl.clientHeight > rowHeight
        ? Math.ceil(bodyEl.clientHeight / rowHeight) : store.length;
      const totalScrollHeight = store.length * rowHeight;
      let firstVisibleIndex = Math.floor(bodyEl.scrollTop / rowHeight);
      if (firstVisibleIndex > store.length - 1) {
        firstVisibleIndex = 0;
      }

      const lastVisibleIndex = firstVisibleIndex + rowCount + 1;
      const firstIndex = Math.max(firstVisibleIndex, 0);
      const lastIndex = lastVisibleIndex;
      const tableEl = elementInfo.table;

      stores.viewStore = store.slice(firstIndex, lastIndex);
      scrollInfo.hasVerticalScrollBar = rowCount < store.length
        || bodyEl.clientHeight < tableEl.clientHeight;
      scrollInfo.vScrollTopHeight = firstIndex * rowHeight;
      scrollInfo.vScrollBottomHeight = totalScrollHeight - (stores.viewStore.length * rowHeight)
        - scrollInfo.vScrollTopHeight;
      if (isScroll && pageInfo.isInfinite && scrollInfo.vScrollBottomHeight === 0) {
        pageInfo.prevPage = pageInfo.currentPage;
        pageInfo.currentPage = Math.ceil(lastIndex / pageInfo.perPage) + 1;
        pageInfo.startIndex = lastIndex;
        updatePagingInfo({ onScrollEnd: true });
      }
    }
  };
  /**
   * 수평 스크롤의 위치 계산 후 적용한다.
   */
  const updateHScroll = () => {
    const headerEl = elementInfo.header;
    const bodyEl = elementInfo.body;
    const tableEl = elementInfo.table;

    headerEl.scrollLeft = bodyEl.scrollLeft;
    summaryScroll.value = bodyEl.scrollLeft;
    scrollInfo.hasHorizontalScrollBar = bodyEl.clientWidth < tableEl.clientWidth;
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
      updateVScroll(true);
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
  const { props, emit } = getCurrentInstance();
  const {
    resizeInfo,
    elementInfo,
    checkInfo,
    stores,
    isRenderer,
    updateVScroll,
    updateHScroll,
    contextInfo,
  } = params;
  /**
   * 고정 너비, 스크롤 유무 등에 따른 컬럼 너비를 계산한다.
   */
  const calculatedColumn = () => {
    stores.viewStore = stores.showTreeStore;
    const store = stores.viewStore;
    let columnWidth = resizeInfo.columnWidth;
    if (resizeInfo.columnWidth > 0) {
      columnWidth = resizeInfo.columnWidth;
    }
    columnWidth = resizeInfo.columnWidth;
    let remainWidth = 0;
    if (resizeInfo.adjust && elementInfo.body) {
      const bodyEl = elementInfo.body;
      let elWidth = bodyEl.offsetWidth;
      const elHeight = bodyEl.offsetHeight;
      const result = stores.orderedColumns.reduce((acc, column) => {
        if (column.hide || column.hiddenDisplay) {
          return acc;
        }

        if (column.width) {
          acc.totalWidth += column.width;
        } else {
          acc.emptyCount++;
        }

        return acc;
      }, { totalWidth: contextInfo.customContextMenu.length ? 30 : 0, emptyCount: 0 });

      if (resizeInfo.rowHeight * store.length > elHeight - resizeInfo.scrollWidth) {
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

    stores.orderedColumns.forEach((column) => {
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
    resizeInfo.isResize = !resizeInfo.isResize;
  };
  /**
   * grid resize 이벤트를 처리한다.
   */
  const onResize = () => {
    nextTick(() => {
      if (resizeInfo.adjust) {
        stores.orderedColumns.forEach((column) => {
          const item = column;

          if (!props.columns[column.index]?.width && !item.resized) {
            item.width = 0;
          }

          return item;
        }, this);
      }

      calculatedColumn();
      if (elementInfo.body?.clientHeight) {
        updateVScroll();
      }
      if (elementInfo.body?.clientWidth) {
        updateHScroll();
      }
    });
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
    const headerEl = elementInfo.header;
    const bodyEl = elementInfo.body;
    const headerLeft = headerEl.getBoundingClientRect().left;
    const columnEl = headerEl.querySelector(`li[data-index="${columnIndex}"]`);
    const minWidth = isRenderer(stores.orderedColumns[columnIndex])
      ? resizeInfo.rendererMinWidth : resizeInfo.minWidth;
    const columnRect = columnEl.getBoundingClientRect();
    const maxRight = bodyEl.getBoundingClientRect().right - headerLeft;
    const resizeLineEl = elementInfo.resizeLine;
    const minLeft = columnRect.left - headerLeft + minWidth;
    const startLeft = columnRect.right - headerLeft;
    const startMouseLeft = event.clientX;
    const startColumnLeft = columnRect.left - headerLeft;

    bodyEl.style.overflow = 'auto';
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
        stores.orderedColumns[columnIndex].width = changedWidth;
        stores.orderedColumns[columnIndex].resized = true;
      }

      resizeInfo.showResizeLine = false;
      document.removeEventListener('mousemove', handleMouseMove);
      onResize();

      const updatedColumns = getUpdatedColumns(stores);
      emit('resize-column', {
        column: stores.orderedColumns[columnIndex],
        columns: updatedColumns,
      });
      emit('change-column-info', {
        type: 'resize',
        columns: updatedColumns,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };
  return { calculatedColumn, onResize, onShow, onColumnResize };
};

export const clickEvent = (params) => {
  const { emit } = getCurrentInstance();
  const selectInfo = params;
  const getClickedRowData = (event, row) => {
    const tagName = event.target.tagName.toLowerCase();
    let cellInfo = {};
    if (event.target.offsetParent) {
      if (tagName === 'td') {
        cellInfo = event.target.dataset;
      } else {
        cellInfo = event.target.closest('td')?.dataset ?? {};
      }
    }
    return {
      event,
      rowData: row,
      rowIndex: row.index,
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
  let timer = null;
  const onRowClick = (event, row) => {
    if (event.target && event.target.parentElement
      && (event.target.parentElement.classList.contains('row-checkbox-input')
        || event.target.closest('td')?.classList?.contains('row-contextmenu'))) {
      return false;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (selectInfo.useSelect) {
        if (row.selected) {
          row.selected = false;
          if (selectInfo.multiple) {
            if (event.ctrlKey) {
              selectInfo.selectedRow = selectInfo.selectedRow.filter(s => s.index !== row.index);
            } else {
              selectInfo.selectedRow = [row];
            }
          } else {
            selectInfo.selectedRow = [];
          }
        } else {
          row.selected = true;
          if (event.ctrlKey
            && selectInfo.multiple
            && (!selectInfo.limitCount || selectInfo.limitCount > selectInfo.selectedRow.length)) {
            selectInfo.selectedRow.push(row);
          } else {
            selectInfo.selectedRow = [row];
          }
        }
        emit('update:selected', selectInfo.selectedRow);
        emit('click-row', getClickedRowData(event, row));
      }
    }, 100);
    return true;
  };
  /**
   * row dblclick 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} row - row 데이터
   */
  const onRowDblClick = (event, row) => {
    clearTimeout(timer);
    emit('dblclick-row', getClickedRowData(event, row));
  };
  return { onRowClick, onRowDblClick };
};

export const checkEvent = (params) => {
  const {
    checkInfo,
    stores,
    checkHeader,
    pageInfo,
    getPagingData,
  } = params;
  const { emit } = getCurrentInstance();
  /**
   * row에 대한 체크 상태를 해제한다.
   *
   * @param {array} row - row 데이터
   */
  const unCheckedRow = (row) => {
    const index = stores.treeStore.findIndex(
      item => item.index === row.index);

    if (index !== -1) {
      stores.treeStore[index].checked = row.checked;
    }
  };
  const onCheckChildren = (node) => {
    if (node.hasChild) {
      node.children.forEach((children) => {
        const childNode = children;
        if (node.checked && !childNode.checked && !childNode.uncheckable) {
          checkInfo.checkedRows.push(childNode);
        }
        if (!node.checked) {
          checkInfo.checkedRows = checkInfo.checkedRows
            .filter(checked => checked.index !== childNode.index);
        }
        childNode.checked = node.checked && !childNode.uncheckable;

        if (childNode.hasChild) {
          onCheckChildren(childNode);
        }
      });
    }
  };
  const onCheckParent = (node) => {
    const parentNode = node.parent;
    if (parentNode) {
      const isCheck = parentNode.children.every(n => n.checked);
      parentNode.checked = isCheck && !parentNode.uncheckable;
      const uncheckableList = parentNode.children.filter(n => n.uncheckable);
      if (uncheckableList.length) {
        const checkedList = parentNode.children.filter(n => n.checked);
        if (uncheckableList.length + checkedList.length === parentNode.children.length) {
          parentNode.checked = true;
        }
      }

      parentNode.indeterminate = !isCheck
        && parentNode.children.some(n => n.checked || n.indeterminate);

      if (!parentNode.checked) {
        checkInfo.checkedRows = checkInfo.checkedRows
          .filter(checked => checked.index !== parentNode.index);
      } else {
        checkInfo.checkedRows.push(parentNode);
      }
      if (parentNode.parent) {
        onCheckParent(parentNode);
      }
    }
  };
  /**
   * checkbox click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} rowData - row 데이터
   */
  const onCheck = (event, rowData) => {
    let store = stores.store;
    if (pageInfo.isClientPaging) {
      store = getPagingData();
    }
    const isSingleMode = () => checkInfo.useCheckbox.mode === 'single';
    const unCheckHeader = () => {
      if (checkInfo.isHeaderChecked) {
        checkInfo.isHeaderChecked = false;
      }
    };
    const onSingleMode = () => {
      if (isSingleMode() && checkInfo.checkedRows.length > 0) {
        checkInfo.prevCheckedRow.checked = false;
        unCheckedRow(checkInfo.prevCheckedRow);
      }
    };
    const addCheckedRow = (row) => {
      if (isSingleMode()) {
        checkInfo.checkedRows = [row];
        return;
      }
      onCheckChildren(row);
      onCheckParent(row);
      checkInfo.checkedRows.push(row);
      row.indeterminate = false;
    };
    const removeCheckedRow = (row) => {
      if (isSingleMode()) {
        checkInfo.checkedRows = [];
        return;
      }
      checkInfo.checkedRows = checkInfo.checkedRows.filter(it => it.index !== row.index);
    };

    onSingleMode();
    if (rowData.checked) {
      addCheckedRow(rowData);
      checkHeader(store);
    } else {
      unCheckHeader();
      removeCheckedRow(rowData);
      onCheckChildren(rowData);
      onCheckParent(rowData);
    }
    checkInfo.prevCheckedRow = rowData;
    emit('update:checked', checkInfo.checkedRows);
    emit('check-row', event, rowData.index, rowData);
  };
  /**
   * all checkbox click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   */
  const onCheckAll = (event) => {
    const status = checkInfo.isHeaderChecked;
    let store = stores.store;
    if (pageInfo.isClientPaging) {
      store = getPagingData();
    }
    store.forEach((row) => {
      row.checked = status && !row.uncheckable;
      if (row.checked) {
        if (!checkInfo.checkedRows.find(checked => checked.index === row.index)) {
          checkInfo.checkedRows.push(row);
        }
      } else {
        checkInfo.checkedRows = checkInfo.checkedRows
          .filter(checked => checked.index !== row.index);
      }
      row.indeterminate = false;
    });
    checkInfo.isHeaderIndeterminate = false;
    emit('update:checked', checkInfo.checkedRows);
    emit('check-all', event, checkInfo.checkedRows);
  };
  return { onCheck, onCheckAll };
};

export const contextMenuEvent = (params) => {
  const { emit } = getCurrentInstance();
  const {
    contextInfo,
    stores,
    selectInfo,
    useGridSetting,
    columnSettingInfo,
    setColumnHidden,
    onSort,
  } = params;
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

          menuItem.selectedRow = row ?? [];

          return menuItem;
        });

      menuItems.push(...customItems);
    }
    contextInfo.contextMenuItems = menuItems;
  };
  const onColumnContextMenu = (event, column) => {
    if (event.target.className.includes('column-name--click')) {
      const sortable = column.sortable === undefined ? true : column.sortable;
      contextInfo.columnMenuItems = [
        {
          text: contextInfo.columnMenuTextInfo?.hide ?? 'Hide',
          iconClass: 'ev-icon-visibility-off',
          disabled: !useGridSetting.value || stores.orderedColumns.length === 1,
          click: () => {
            setColumnHidden(column.field);
            emit('change-column-status', {
              columns: stores.updatedColumns,
            });
            emit('change-column-info', {
              type: 'display',
              columns: stores.updatedColumns,
            });
          },
        },
        {
          text: contextInfo.columnMenuTextInfo?.ascending ?? 'Ascending',
          iconClass: 'ev-icon-allow2-up',
          disabled: !sortable,
          hidden: contextInfo.hiddenColumnMenuItem?.ascending,
          click: () => onSort(column, 'asc'),
        },
        {
          text: contextInfo.columnMenuTextInfo?.descending ?? 'Descending',
          iconClass: 'ev-icon-allow2-down',
          disabled: !sortable,
          hidden: contextInfo.hiddenColumnMenuItem?.descending,
          click: () => onSort(column, 'desc'),
        },
      ];
    } else {
      contextInfo.columnMenuItems.length = 0;
    }
  };
  /**
   * 마우스 우클릭 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   */
  const onContextMenu = (event) => {
    const target = event.target;
    const rowIndex = target.closest('.row')?.dataset?.index;

    if (rowIndex) {
      const index = stores.viewStore.findIndex(v => v.index === Number(rowIndex));
      const rowData = stores.viewStore[index];
      selectInfo.selectedRow = [rowData];
      setContextMenu();
      emit('update:selected', selectInfo.selectedRow);
    } else {
      selectInfo.selectedRow = [];
      setContextMenu(false);
      emit('update:selected', []);
    }
  };
  /**
   * 상단 우측의 Grid 옵션에 대한 Contextmenu 를 생성한다.
   *
   * @param {object} e - 이벤트 객체
   */
  const onGridSettingContextMenu = (e) => {
    const { useDefaultColumnSetting, columnSettingTextInfo } = columnSettingInfo;
    const columnListMenu = {
      text: columnSettingTextInfo?.title ?? 'Column List',
      isShowMenu: true,
      click: () => {
        columnSettingInfo.isShowColumnSetting = true;
        contextInfo.isShowMenuOnClick = true;
      },
    };

    if (contextInfo.customGridSettingContextMenu.length) {
      contextInfo.gridSettingContextMenuItems = [
        ...contextInfo.customGridSettingContextMenu,
      ];
    }

    if (useDefaultColumnSetting) {
      contextInfo.gridSettingContextMenuItems.push(columnListMenu);
    }
    contextInfo.gridSettingMenu.show(e);
  };
  return {
    setContextMenu,
    onContextMenu,
    onColumnContextMenu,
    onGridSettingContextMenu,
  };
};

export const treeEvent = (params) => {
  const { stores, onResize } = params;
  const setTreeNodeStore = () => {
    let nodeIndex = 0;
    const nodeList = [];

    function getDataObj(nodeObj) {
      const newObj = {};
      Object.keys(nodeObj).forEach((key) => {
        if (key !== 'children') {
          newObj[key] = nodeObj[key];
        }
      });
      return newObj;
    }

    function setNodeData(nodeInfo) {
      const { node, level, isShow, parent, uncheckable } = nodeInfo;
      if (node !== null && typeof node === 'object') {
        node.index = nodeIndex++;
        node.level = level;

        if (!Object.hasOwnProperty.call(node, 'checked')) {
          node.checked = false;
        }

        if (!Object.hasOwnProperty.call(node, 'selected')) {
          node.selected = false;
        }

        if (!Object.hasOwnProperty.call(node, 'show')) {
          node.show = isShow;
        }

        if (!Object.hasOwnProperty.call(node, 'expand')) {
          node.expand = true;
        }

        if (!Object.hasOwnProperty.call(node, 'isFilter')) {
          node.isFilter = false;
        }

        if (!Object.hasOwnProperty.call(node, 'uncheckable')) {
          node.uncheckable = uncheckable;
        }

        if (!Object.hasOwnProperty.call(node, 'indeterminate')) {
          node.indeterminate = false;
        }

        if (!Object.hasOwnProperty.call(node, 'data')) {
          node.data = getDataObj(node);
        }

        nodeList.push(node);

        if (!Object.hasOwnProperty.call(node, 'parent')) {
          node.parent = parent;
        }
        if (node.children) {
          node.hasChild = true;
          node.children.forEach(child =>
            setNodeData({
              node: child,
              level: level + 1,
              isShow: node.show && node.expand,
              parent: node,
              uncheckable: node.uncheckable,
            }),
          );
        }
      }
    }
    stores.treeRows.forEach((root) => {
      setNodeData({
        node: root,
        level: 0,
        isShow: true,
        parent: undefined,
        uncheckable: false,
      });
    });
    return nodeList;
  };
  const setExpandNode = (children, isShow, isFilter) => {
    children.forEach((nodeObj) => {
      const node = nodeObj;
      node.show = isFilter && isShow ? node.isFilter : isShow;
      if (node.hasChild) {
        setExpandNode(node.children, node.show && node.expand, node.isFilter);
      }
    });
  };
  const handleExpand = (node) => {
    const data = node;
    data.expand = !data.expand;
    setExpandNode(data.children, data.expand, data.isFilter);
    onResize();
  };
  return { setTreeNodeStore, handleExpand };
};

export const filterEvent = (params) => {
  const {
    stores,
    filterInfo,
    pageInfo,
    getConvertValue,
    onResize,
    checkHeader,
    getPagingData,
    updatePagingInfo,
  } = params;
  const makeParentShow = (data) => {
    if (!data?.parent) {
      return;
    }
    const { parent } = data;
    parent.show = true;
    parent.isFilter = true;
    makeParentShow(parent);
  };
  const makeChildShow = (data) => {
    if (!data?.children) {
      return;
    }
    const { children } = data;
    children.forEach((node) => {
      const childNode = node;
      if (childNode.parent.show && childNode.parent.expand) {
        childNode.show = true;
      } else {
        childNode.show = false;
      }
      childNode.isFilter = true;
      if (childNode.hasChild) {
        makeChildShow(childNode);
      }
    });
  };
  let timer = null;
  const onSearch = (searchWord) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      filterInfo.isSearch = false;
      filterInfo.searchWord = searchWord;
      const store = stores.treeStore;
      store.forEach((row) => {
        row.show = false;
        row.isFilter = false;
      });
      if (searchWord) {
        const filterStores = store.filter((row) => {
          let isSameWord = false;
          for (let ix = 0; ix < stores.orderedColumns.length; ix++) {
            const column = stores.orderedColumns[ix] || {};
            let columnValue = row[column.field] ?? null;
            column.type = column.type || 'string';
            if (columnValue !== null) {
              if (!column.hide && (column?.searchable === undefined || column?.searchable)) {
                columnValue = getConvertValue(column, columnValue).toString();
                isSameWord = columnValue.toLowerCase()
                  .includes(searchWord.toString().toLowerCase());
                if (isSameWord) {
                  break;
                }
              }
            }
          }
          return isSameWord;
        });
        filterStores.forEach((row) => {
          row.show = true;
          if (row.parent && !row.parent.expand) {
            row.show = false;
          }
          row.isFilter = true;
          makeParentShow(row);
          makeChildShow(row);
        });
        filterInfo.isSearch = true;
      } else {
        store.forEach((row) => {
          row.show = true;
          row.isFilter = false;
        });
        store.forEach((row) => {
          makeParentShow(row);
          makeChildShow(row);
        });
      }
      if (!searchWord && pageInfo.isClientPaging && pageInfo.prevPage) {
        pageInfo.currentPage = 1;
        stores.pagingStore = getPagingData();
      }
      updatePagingInfo({ onSearch: true });
      checkHeader(stores.store);
      onResize();
    }, 500);
  };
  return { onSearch };
};

export const pagingEvent = (params) => {
  const { emit } = getCurrentInstance();
  const {
    stores,
    pageInfo,
    sortInfo,
    filterInfo,
    elementInfo,
    clearCheckInfo,
  } = params;
  const getPagingData = () => {
    const start = (pageInfo.currentPage - 1) * pageInfo.perPage;
    const end = parseInt(start, 10) + parseInt(pageInfo.perPage, 10);
    return stores.showTreeStore.slice(start, end);
  };
  const updatePagingInfo = (eventName) => {
    emit('page-change', {
      eventName,
      pageInfo: {
        currentPage: pageInfo.currentPage,
        prevPage: pageInfo.prevPage,
        startIndex: pageInfo.startIndex,
        total: pageInfo.pageTotal,
        perPage: pageInfo.perPage,
      },
      sortInfo: {
        field: sortInfo.sortField,
        order: sortInfo.sortOrder,
      },
      searchInfo: {
        searchWord: filterInfo.searchWord,
        searchColumns: stores.orderedColumns
          .filter(c => !c.hide && (c?.searchable === undefined || c?.searchable))
          .map(d => d.field),
      },
    });
    if (pageInfo.isInfinite && (eventName?.onSearch || eventName?.onSort)) {
      pageInfo.currentPage = 1;
      elementInfo.body.scrollTop = 0;
      clearCheckInfo();
    }
  };
  const changePage = (beforeVal) => {
    if (pageInfo.isClientPaging) {
      pageInfo.prevPage = beforeVal;
      if (stores.showTreeStore.length <= pageInfo.perPage) {
        stores.pagingStore = stores.showTreeStore;
      } else {
        const start = (pageInfo.currentPage - 1) * pageInfo.perPage;
        const end = parseInt(start, 10) + parseInt(pageInfo.perPage, 10);
        stores.pagingStore = stores.showTreeStore.slice(start, end);
        elementInfo.body.scrollTop = 0;
        pageInfo.startIndex = start;
      }
    }
    updatePagingInfo({ onChangePage: true });
  };
  return { getPagingData, updatePagingInfo, changePage };
};

export const sortEvent = (params) => {
  const { sortInfo, stores, updatePagingInfo } = params;
  const { emit } = getCurrentInstance();

  const getDefaultSortType = (includeInit = true) => (includeInit ? ['asc', 'desc', 'init'] : ['asc', 'desc']);

  function OrderQueue() {
    this.orders = getDefaultSortType();
    this.dequeue = () => this.orders.shift();
    this.enqueue = o => this.orders.push(o);
  }

  const setSortOptionToOrderedColumns = (column, sortType = 'init') => {
    stores.orderedColumns.forEach((orderedColumn) => {
      if (orderedColumn.index === column?.index && sortType) {
        orderedColumn.sortOption = { sortType };
      } else {
        orderedColumn.sortOption = { sortType: 'init' };
      }
    });
  };

  const initializeHiddenColumnsSortType = () => {
    const hiddenColumns = stores.originColumns.filter(col => col.hiddenDisplay || col.hide);
    if (hiddenColumns.length) {
      hiddenColumns.forEach((col) => {
        col.sortOption = { sortType: 'init' };
      });
    }
  };

  const order = new OrderQueue();

  const setSortInfo = (column, emitTriggered = true) => {
    const { sortType } = column?.sortOption || {};
    sortInfo.sortColumn = column;
    sortInfo.sortField = column?.field;
    sortInfo.sortOrder = sortType;
    sortInfo.isSorting = !!(sortType);

    if (emitTriggered) {
      setSortOptionToOrderedColumns(column, sortType);

      emit('change-column-info', {
        type: 'sort',
        columns: getUpdatedColumns(stores),
      });
    }
  };

  const onSort = (column, sortOrder) => {
    const sortable = column.sortable === undefined ? true : column.sortable;
    if (sortable) {
      sortInfo.sortColumn = column;
      if (sortInfo.sortField !== column?.field) {
        order.orders = getDefaultSortType();
        sortInfo.sortField = column?.field;
      }
      if (sortOrder) {
        order.orders = getDefaultSortType();
        if (sortOrder === 'desc') {
          sortInfo.sortOrder = order.dequeue();
          order.enqueue(sortInfo.sortOrder);
        }
      }
      sortInfo.sortOrder = order.dequeue();
      order.enqueue(sortInfo.sortOrder);

      sortInfo.isSorting = true;
      updatePagingInfo({ onSort: true });

      initializeHiddenColumnsSortType();
      setSortOptionToOrderedColumns(column, sortInfo.sortOrder);

      const updatedColumInfo = getUpdatedColumns(stores);
      emit('sort-column', {
        field: sortInfo.sortField,
        order: sortInfo.sortOrder,
        column: sortInfo.sortColumn,
        columns: updatedColumInfo,
      });

      emit('change-column-info', {
        type: 'sort',
        columns: updatedColumInfo,
      });

      const compareValues = (nodeA, nodeB) => {
        const valueA = nodeA.data[sortInfo.sortField];
        const valueB = nodeB.data[sortInfo.sortField];

        if (valueA === valueB) return 0;

        const isAscending = sortInfo.sortOrder === 'asc';

        if (isAscending) return valueA > valueB ? 1 : -1;

        return valueA < valueB ? 1 : -1;
      };


      const sortTree = (nodes, depth = 0) => {
        const groupedNodes = {};

        nodes.forEach((node) => {
          const nodeDepth = node.level || depth;
          if (!groupedNodes[nodeDepth]) {
            groupedNodes[nodeDepth] = [];
          }
          groupedNodes[nodeDepth].push(node);
        });

        Object.keys(groupedNodes).forEach((key) => {
          groupedNodes[key].sort(compareValues);
        });

        nodes.length = 0;
        Object.values(groupedNodes).forEach((group) => {
          group.forEach((node) => {
            nodes.push(node);
            if (node.hasChild) {
              sortTree(node.children, node.level + 1);
            }
          });
        });
      };
      sortTree(stores.treeRows);
      stores.treeStore = stores.treeRows;
    }
  };

  return { onSort, setSortInfo };
};
