// @ts-nocheck //TODO -
import { getCurrentInstance, nextTick } from 'vue';
import { uniqBy } from 'lodash-es';
import { numberWithComma } from '@/common/utils';
import type { GridColumn } from './grid.types';

const ROW_INDEX = 0;
const ROW_CHECK_INDEX = 1;
const ROW_DATA_INDEX = 2;
const ROW_SELECT_INDEX = 3;
const ROW_EXPAND_INDEX = 4;

export const commonFunctions = () => {
  const { props } = getCurrentInstance()!;
  /**
   * 해당 컬럼이 사용자 지정 컬럼인지 확인한다.
   *
   * @param {object} column - 컬럼 정보
   * @returns {boolean} 사용자 지정 컬럼 유무
   */
  const isRenderer = (column: GridColumn): boolean => !!column?.render?.use;
  const getComponentName = (type = '') => {
    const setUpperCaseFirstStr = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);
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
   * @param {object} GridColumn - 컬럼 정보
   * @param {number|string} value - 데이터
   * @returns {number|string} 변환된 데이터
   */
  const getConvertValue = (
    column: GridColumn,
    value: number | string
  ): number | string => {
    let convertValue =
      column.type === 'number' || column.type === 'float'
        ? Number(value)
        : value;

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
  const getColumnIndex = (field: string): number =>
    props.columns.findIndex(
      (column: { field: string }) => column.field === field
    );
  const setPixelUnit = (value: any) => {
    let size = value;
    const hasPx = size.toString().indexOf('px') >= 0;
    const hasPct = size.toString().indexOf('%') >= 0;
    if (!hasPx && !hasPct) {
      size = `${size}px`;
    }
    return size;
  };

  return {
    isRenderer,
    getComponentName,
    getConvertValue,
    getColumnIndex,
    setPixelUnit,
  };
};

export const scrollEvent = (params: {
  scrollInfo: any;
  stores: any;
  elementInfo: any;
  resizeInfo: any;
  pageInfo: any;
  summaryScroll: any;
  getPagingData: any;
  updatePagingInfo: any;
  expandedInfo: any;
}) => {
  const {
    scrollInfo,
    stores,
    elementInfo,
    resizeInfo,
    pageInfo,
    summaryScroll,
    getPagingData,
    updatePagingInfo,
    expandedInfo,
  } = params;
  /**
   * 수직 스크롤의 위치 계산 후 적용한다.
   */
  const updateVScrollBase = (isScroll: any) => {
    const bodyEl = elementInfo.body;
    const rowHeight = resizeInfo.rowHeight;
    if (bodyEl) {
      let store = stores.store;
      if (pageInfo.isClientPaging) {
        store = getPagingData();
      }
      const rowCount =
        bodyEl.clientHeight > rowHeight
          ? Math.ceil(bodyEl.clientHeight / rowHeight)
          : store.length;
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
      scrollInfo.hasVerticalScrollBar =
        rowCount < store.length || bodyEl.clientHeight < tableEl.clientHeight;
      scrollInfo.vScrollTopHeight = firstIndex * rowHeight;
      scrollInfo.vScrollBottomHeight =
        totalScrollHeight -
        stores.viewStore.length * rowHeight -
        scrollInfo.vScrollTopHeight;
      if (
        isScroll &&
        pageInfo.isInfinite &&
        scrollInfo.vScrollBottomHeight === 0
      ) {
        pageInfo.prevPage = pageInfo.currentPage;
        pageInfo.currentPage = Math.ceil(lastIndex / pageInfo.perPage) + 1;
        pageInfo.startIndex = lastIndex;
        updatePagingInfo({ onScrollEnd: true });
      }
    }
  };

  /**
   *  rowDetail slot 시에는 가상 스크롤을 적용하지 않는다.
   */
  const updateVScroll = (isScroll: boolean) => {
    if (expandedInfo.useRowDetail) {
      let store = stores.store;
      if (pageInfo.isClientPaging) {
        store = getPagingData();
      }
      stores.viewStore = [...store];
      scrollInfo.vScrollTopHeight = 0;
      scrollInfo.vScrollBottomHeight = 0;
    } else {
      updateVScrollBase(isScroll);
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
    scrollInfo.hasHorizontalScrollBar =
      bodyEl.clientWidth < tableEl.clientWidth;
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

    if (isVertical && bodyEl?.clientHeight) {
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

export const resizeEvent = (params: {
  resizeInfo: any;
  elementInfo: any;
  checkInfo: any;
  expandedInfo: any;
  stores: any;
  isRenderer: any;
  updateVScroll: any;
  updateHScroll: any;
  contextInfo: any;
}) => {
  const { props, emit } = getCurrentInstance()!;
  const {
    resizeInfo,
    elementInfo,
    checkInfo,
    expandedInfo,
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
    let columnWidth = resizeInfo.columnWidth;
    let remainWidth = 0;
    if (resizeInfo.adjust) {
      const bodyEl = elementInfo.body;
      let elWidth = bodyEl.offsetWidth;
      const elHeight = bodyEl.offsetHeight;
      const rowHeight =
        bodyEl.querySelector('tr')?.offsetHeight || resizeInfo.rowHeight;
      const scrollWidth = elWidth - bodyEl.clientWidth;

      const result = stores.orderedColumns.reduce(
        (
          acc: { totalWidth: any; emptyCount: number },
          cur: { hide: any; hiddenDisplay: any; width: any }
        ) => {
          if (cur.hide || cur.hiddenDisplay) {
            return acc;
          }
          if (cur.width) {
            acc.totalWidth += cur.width;
          } else {
            acc.emptyCount++;
          }

          return acc;
        },
        {
          totalWidth: contextInfo.customContextMenu.length ? 30 : 0,
          emptyCount: 0,
        }
      );

      if (rowHeight * props.rows.length > elHeight) {
        elWidth -= scrollWidth;
      }

      if (checkInfo.useCheckbox.use) {
        elWidth -= resizeInfo.minWidth;
      }

      if (expandedInfo.useRowDetail) {
        elWidth -= resizeInfo.minWidth;
      }

      columnWidth = elWidth - result.totalWidth;
      if (columnWidth > 0) {
        remainWidth =
          columnWidth -
          Math.floor(columnWidth / result.emptyCount) * result.emptyCount;
        columnWidth = Math.floor(columnWidth / result.emptyCount);
      } else {
        columnWidth = resizeInfo.columnWidth;
      }

      columnWidth =
        columnWidth < resizeInfo.minWidth ? resizeInfo.minWidth : columnWidth;
      resizeInfo.columnWidth = columnWidth;
    }

    stores.orderedColumns.forEach((column: any) => {
      const item = column;
      const minWidth = isRenderer(column)
        ? resizeInfo.rendererMinWidth
        : resizeInfo.minWidth;
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
    nextTick(() => {
      if (resizeInfo.adjust) {
        stores.orderedColumns.forEach((column: { index: string | number }) => {
          const item = column;

          if (!item.resized) {
            item.width = props.columns[column.index].width ?? 0;
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

  const onShow = (isVisible: any) => {
    if (isVisible) {
      onResize();
    }
  };

  /**
   * column resize 이벤트를 처리한다.
   *
   * @param {number} columnIndex - 컬럼 인덱스
   */
  const onColumnResize = (columnIndex: number, event: Event) => {
    event.preventDefault();
    const headerEl = elementInfo.header;
    const bodyEl = elementInfo.body;
    const headerLeft = headerEl.getBoundingClientRect().left;
    const columnEl = headerEl.querySelector(`li[data-index="${columnIndex}"]`);
    const minWidth = isRenderer(stores.orderedColumns[columnIndex])
      ? resizeInfo.rendererMinWidth
      : resizeInfo.minWidth;
    const columnRect = columnEl.getBoundingClientRect();
    const resizeLineEl = elementInfo.resizeLine;
    const minLeft = columnRect.left - headerLeft + minWidth;
    const startLeft = columnRect.right - headerLeft;
    const startMouseLeft = event.clientX;
    const startColumnLeft = columnRect.left - headerLeft;

    bodyEl.style.overflow = 'auto';
    resizeLineEl.style.left = `${startLeft}px`;

    resizeInfo.showResizeLine = true;

    const handleMouseMove = (evt: { clientX: number }) => {
      const deltaLeft = evt.clientX - startMouseLeft;
      const proxyLeft = startLeft + deltaLeft;
      const resizeWidth = Math.max(minLeft, proxyLeft);

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

      emit('resize-column', {
        column: stores.orderedColumns[columnIndex],
        columns: stores.updatedColumns,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };
  return { calculatedColumn, onResize, onShow, onColumnResize };
};

export const clickEvent = (params: { selectInfo: any; stores: any }) => {
  const { emit } = getCurrentInstance()!;
  const { selectInfo, stores } = params;
  const getClickedRowData = (event: object, row: any[]) => {
    const tagName = event.target.tagName?.toLowerCase();
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
  let clickTimer: string | number | NodeJS.Timeout | null | undefined = null;
  let lastIndex = -1;
  const onRowClick = (
    event: {
      target: {
        parentElement: { classList: { contains: (arg0: string) => any } };
        closest: (arg0: string) => {
          (): any;
          new (): any;
          classList: {
            (): any;
            new (): any;
            contains: { (arg0: string): any; new (): any };
          };
        };
      };
      shiftKey: any;
      ctrlKey: any;
    },
    row: number[],
    isRight: any
  ) => {
    if (event.target.parentElement.classList?.contains('row-checkbox-input')) {
      return false;
    }
    const isContextmenu = !!event.target
      .closest('td')
      ?.classList?.contains('row-contextmenu');
    const onMultiSelectByKey = (
      keyType: string,
      selected: any,
      selectedRow: any
    ) => {
      if (keyType === 'shift') {
        const rowIndex = row[ROW_INDEX];
        if (lastIndex > -1) {
          for (
            let i = Math.min(rowIndex, lastIndex);
            i <= Math.max(rowIndex, lastIndex);
            i++
          ) {
            if (!selected) {
              stores.originStore[i][ROW_SELECT_INDEX] = true;
              if (lastIndex !== i) {
                selectInfo.selectedRow.push(
                  stores.originStore[i][ROW_DATA_INDEX]
                );
              }
            } else {
              stores.originStore[i][ROW_SELECT_INDEX] = false;
              const deselectedIndex = selectInfo.selectedRow.indexOf(
                stores.originStore[i][ROW_DATA_INDEX]
              );
              if (deselectedIndex > -1) {
                selectInfo.selectedRow.splice(deselectedIndex, 1);
              }
            }
          }
        }
      } else if (keyType === 'ctrl') {
        if (!selected) {
          selectInfo.selectedRow.push(selectedRow);
        } else {
          selectInfo.selectedRow.splice(
            selectInfo.selectedRow.indexOf(row[ROW_DATA_INDEX]),
            1
          );
        }
      }
    };

    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    clickTimer = setTimeout(() => {
      if (selectInfo.useSelect) {
        const rowData = row[ROW_DATA_INDEX];
        const selected = row[ROW_SELECT_INDEX];
        row[ROW_SELECT_INDEX] = !row[ROW_SELECT_INDEX];
        let keyType = '';
        if (event.shiftKey) {
          keyType = 'shift';
        } else if (event.ctrlKey) {
          keyType = 'ctrl';
        }

        if (selectInfo.multiple && keyType) {
          // multi select
          onMultiSelectByKey(keyType, selected, rowData);
        } else if (isRight || isContextmenu) {
          selectInfo.selectedRow = [...selectInfo.selectedRow];
          if (!selectInfo.selectedRow.includes(rowData)) {
            selectInfo.selectedRow = [rowData];
          }
        } else if (selected) {
          // single select
          selectInfo.selectedRow = [];
        } else {
          selectInfo.selectedRow = [rowData];
        }
        lastIndex = row[ROW_INDEX];
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
  const onRowDblClick = (event: object, row: Array<any>) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    emit('dblclick-row', getClickedRowData(event, row));
  };
  return { onRowClick, onRowDblClick };
};

export const checkEvent = (params: {
  checkInfo: any;
  stores: any;
  pageInfo: any;
  getPagingData: any;
}) => {
  const { checkInfo, stores, pageInfo, getPagingData } = params;
  const { props, emit } = getCurrentInstance()!;
  /**
   * row에 대한 체크 상태를 해제한다.
   *
   * @param {array} row - row 데이터
   */
  const unCheckedRow = (row: Array<any>) => {
    const index = stores.originStore.findIndex(
      (item: any[]) => item[ROW_DATA_INDEX] === row[ROW_DATA_INDEX]
    );

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
  const onCheck = (event: object, row: Array<any>) => {
    if (
      checkInfo.useCheckbox.mode === 'single' &&
      checkInfo.prevCheckedRow.length
    ) {
      checkInfo.prevCheckedRow[ROW_CHECK_INDEX] = false;
      unCheckedRow(checkInfo.prevCheckedRow);
    }

    if (row[ROW_CHECK_INDEX]) {
      if (checkInfo.useCheckbox.mode === 'single') {
        checkInfo.checkedRows = [row[ROW_DATA_INDEX]];
      } else {
        checkInfo.checkedRows.push(row[ROW_DATA_INDEX]);
      }
      let store = stores.store;
      if (pageInfo.isClientPaging) {
        store = getPagingData();
      }

      const isAllChecked = store
        .filter(
          (rowData: any[]) =>
            !props.uncheckable.includes(rowData[ROW_DATA_INDEX])
        )
        .filter(
          (rowData: any[]) =>
            !props.disabledRows.includes(rowData[ROW_DATA_INDEX])
        )
        .every((d: any[]) => d[ROW_CHECK_INDEX]);
      if (store.length && isAllChecked) {
        checkInfo.isHeaderChecked = true;
      }
      checkInfo.isHeaderIndeterminate = store.length && !isAllChecked;
    } else {
      if (checkInfo.useCheckbox.mode === 'single') {
        checkInfo.checkedRows = [];
      } else {
        checkInfo.checkedRows.splice(
          checkInfo.checkedRows.indexOf(row[ROW_DATA_INDEX]),
          1
        );
      }
      checkInfo.isHeaderChecked = false;
      checkInfo.isHeaderIndeterminate = !!(
        stores.store.length && checkInfo.checkedRows.length
      );
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
  const onCheckAll = (event: object) => {
    const isHeaderChecked = checkInfo.isHeaderChecked;
    let store = stores.store;
    if (pageInfo.isClientPaging) {
      store = getPagingData();
    }
    store.forEach((row: any[]) => {
      const uncheckable =
        props.uncheckable.includes(row[ROW_DATA_INDEX]) ||
        props.disabledRows.includes(row[ROW_DATA_INDEX]);
      if (isHeaderChecked) {
        if (
          !checkInfo.checkedRows.includes(row[ROW_DATA_INDEX]) &&
          !uncheckable
        ) {
          checkInfo.checkedRows.push(row[ROW_DATA_INDEX]);
        }
      } else {
        checkInfo.checkedRows.splice(
          checkInfo.checkedRows.indexOf(row[ROW_DATA_INDEX]),
          1
        );
      }

      if (!uncheckable) {
        row[ROW_CHECK_INDEX] = isHeaderChecked;
      }
    });
    checkInfo.isHeaderIndeterminate = false;
    emit('update:checked', checkInfo.checkedRows);
    emit('check-all', event, checkInfo.checkedRows);
  };
  return { onCheck, onCheckAll };
};

export const expandEvent = (params: { expandedInfo: any }) => {
  const { expandedInfo } = params;
  const { emit } = getCurrentInstance()!;

  /**
   * expand click 이벤트를 처리한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {array} row - row 데이터
   */
  const onExpanded = (event: object, row: Array<any>) => {
    const data = row[ROW_DATA_INDEX];
    const index = expandedInfo.expandedRows.indexOf(data);
    if (index === -1) {
      expandedInfo.expandedRows.push(data);
    } else {
      expandedInfo.expandedRows.splice(index, 1);
    }
    row[ROW_EXPAND_INDEX] = !row[ROW_EXPAND_INDEX];
    emit('update:expanded', expandedInfo.expandedRows);
    emit(
      'expand-row',
      event,
      row[ROW_DATA_INDEX],
      row[ROW_EXPAND_INDEX],
      row[ROW_INDEX]
    );
  };

  return {
    onExpanded,
  };
};

export const sortEvent = (params: {
  sortInfo: any;
  stores: any;
  updatePagingInfo: any;
}) => {
  const { sortInfo, stores, updatePagingInfo } = params;
  const { emit } = getCurrentInstance()!;
  function OrderQueue(this: any) {
    this.orders = ['asc', 'desc', 'init'];
    this.dequeue = () => this.orders.shift();
    this.enqueue = (o: any) => this.orders.push(o);
  }
  const order = new OrderQueue();
  /**
   * sort 이벤트를 처리한다.
   *
   * @param {object} column - 컬럼 정보
   * @param {string} sortOrder - 정렬 순서
   */
  const onSort = (column: object, sortOrder: string) => {
    const sortable = column.sortable === undefined ? true : column.sortable;
    if (sortable) {
      sortInfo.sortColumn = column;
      if (sortInfo.sortField !== column?.field) {
        order.orders = ['asc', 'desc', 'init'];
        sortInfo.sortField = column?.field;
      }
      if (sortOrder) {
        order.orders = ['asc', 'desc', 'init'];
        if (sortOrder === 'desc') {
          sortInfo.sortOrder = order.dequeue();
          order.enqueue(sortInfo.sortOrder);
        }
      }
      sortInfo.sortOrder = order.dequeue();
      order.enqueue(sortInfo.sortOrder);

      sortInfo.isSorting = true;
      updatePagingInfo({ onSort: true });
      emit('sort-column', {
        field: sortInfo.sortField,
        order: sortInfo.sortOrder,
        column: sortInfo.sortColumn,
      });
    }
  };
  /**
   * 설정값에 따라 해당 컬럼 데이터에 대해 정렬한다.
   */
  const setSort = () => {
    const { field, index } = sortInfo.sortColumn;
    const customSetAsc = sortInfo.sortFunction?.[field] ?? null;
    const setDesc = (a: number, b: number) => (a > b ? -1 : 1);
    const setAsc = (a: number, b: number) => (a < b ? -1 : 1);
    const numberSetDesc = (a: null, b: null) =>
      (a === null) - (b === null) || Number(b) - Number(a);
    const numberSetAsc = (a: null, b: null) =>
      (a === null) - (b === null) || Number(a) - Number(b);
    if (
      sortInfo.sortOrder === 'init' ||
      (!sortInfo.sortField && !sortInfo.isSorting)
    ) {
      stores.store.sort((a: any[], b: any[]) => {
        if (typeof a[ROW_INDEX] === 'number') {
          return setAsc(a[ROW_INDEX], b[ROW_INDEX]);
        }
        return 0;
      });
      return;
    }
    const type = sortInfo.sortColumn.type || 'string';
    const sortFn = sortInfo.sortOrder === 'desc' ? setDesc : setAsc;
    const numberSortFn =
      sortInfo.sortOrder === 'desc' ? numberSetDesc : numberSetAsc;
    const getColumnValue = (
      a: { [x: string]: { [x: string]: any } }[],
      b: { [x: string]: { [x: string]: any } }[]
    ) => {
      let aCol = a[ROW_DATA_INDEX][index];
      let bCol = b[ROW_DATA_INDEX][index];
      if (
        a[ROW_DATA_INDEX][index] &&
        typeof a[ROW_DATA_INDEX][index] === 'object'
      ) {
        aCol = a[ROW_DATA_INDEX][index][stores.originColumns[index]?.field];
        bCol = b[ROW_DATA_INDEX][index][stores.originColumns[index]?.field];
      }
      return { aCol, bCol };
    };

    if (customSetAsc) {
      stores.store.sort((a: any, b: any) => {
        const { aCol, bCol } = getColumnValue(a, b);
        const compareAscReturn = customSetAsc(aCol, bCol);
        return sortInfo.sortOrder === 'desc'
          ? -compareAscReturn
          : compareAscReturn;
      });
      return;
    }
    switch (type) {
      case 'string':
        stores.store.sort((a: any, b: any) => {
          let { aCol, bCol } = getColumnValue(a, b);
          if (
            (!aCol || typeof aCol === 'string') &&
            (!bCol || typeof bCol === 'string')
          ) {
            aCol = aCol || '';
            bCol = bCol || '';
            return sortFn(aCol?.toLowerCase(), bCol?.toLowerCase());
          }
          return 0;
        });
        break;
      case 'stringNumber':
        stores.store.sort((a: any, b: any) => {
          let { aCol, bCol } = getColumnValue(a, b);
          if (!aCol || typeof aCol === 'string' || typeof aCol === 'number') {
            aCol = aCol === '' ? null : aCol;
            bCol = bCol === '' ? null : bCol;
            return numberSortFn(aCol ?? null, bCol ?? null);
          }
          return 0;
        });
        break;
      default:
        stores.store.sort((a: any, b: any) => {
          const { aCol, bCol } = getColumnValue(a, b);
          if (!aCol || typeof aCol === 'number' || typeof aCol === 'boolean') {
            return numberSortFn(aCol ?? null, bCol ?? null);
          }
          return 0;
        });
        break;
    }
  };
  return { onSort, setSort };
};

export const filterEvent = (params: {
  columnSettingInfo: any;
  filterInfo: any;
  stores: any;
  checkInfo: any;
  pageInfo: any;
  getConvertValue: any;
  updateVScroll: any;
  getPagingData: any;
  updatePagingInfo: any;
  getColumnIndex: any;
}) => {
  const { props } = getCurrentInstance()!;
  const {
    columnSettingInfo,
    filterInfo,
    stores,
    checkInfo,
    pageInfo,
    getConvertValue,
    updateVScroll,
    getPagingData,
    updatePagingInfo,
    getColumnIndex,
  } = params;
  /**
   * 헤더 체크박스 상태를 체크한다.
   *
   * @param {array} rowData - row 데이터
   */
  const setHeaderCheckboxByFilter = (rowData: Array<any>) => {
    let checkedCount = 0;
    rowData.forEach((row) => {
      const isChecked = checkInfo.checkedRows.includes(row[ROW_DATA_INDEX]);
      row[ROW_CHECK_INDEX] = isChecked;
      checkedCount += isChecked ? 1 : 0;
    });
    if (rowData.length) {
      checkInfo.isHeaderChecked = rowData.length === checkedCount;
      checkInfo.isHeaderIndeterminate =
        rowData.length !== checkedCount && checkedCount > 0;
      checkInfo.isHeaderUncheckable = rowData.every(
        (row) =>
          props.uncheckable.includes(row[ROW_DATA_INDEX]) ||
          props.disabledRows.includes(row[ROW_DATA_INDEX])
      );
    }
  };
  /**
   * 전달받은 문자열 내 해당 키워드가 존재하는지 확인한다.
   *
   * @param {string} conditionValue - 검색 키워드
   * @param {string} value - 기준 문자열
   * @param {string} pos - 시작, 끝나는 문자열
   * @returns {boolean} 문자열 내 키워드 존재 유무
   */
  const findLike = (
    conditionValue: string,
    value: string,
    pos: string
  ): boolean => {
    if (typeof conditionValue !== 'string' || value === null) {
      return false;
    }
    const baseValueLower = value?.toLowerCase();
    const conditionValueLower = conditionValue?.toLowerCase();
    let result = baseValueLower.includes(conditionValueLower);
    if (pos) {
      if (pos === 'start') {
        result = baseValueLower.startsWith(conditionValueLower);
      } else if (pos === 'end') {
        result = baseValueLower.endsWith(conditionValueLower);
      }
    }
    return result;
  };
  /**
   * 필터 조건에 따라 문자열을 확인한다.
   *
   * @param {array} item - row 데이터
   * @param {object} condition - 필터 정보
   * @returns {boolean} 확인 결과
   */
  const stringFilter = (item: Array<any>, condition: object): boolean => {
    const comparison = condition.comparison;
    const conditionValue = condition.value;
    let value = item[ROW_DATA_INDEX][condition.index];
    if (value || value === 0) {
      value = `${item[ROW_DATA_INDEX][condition.index]}`;
    }
    let result;
    if (comparison === '=') {
      result = conditionValue?.toLowerCase() === value?.toLowerCase();
    } else if (comparison === '!=') {
      result = conditionValue?.toLowerCase() !== value?.toLowerCase();
    } else if (comparison === '%s%') {
      result = findLike(conditionValue, value);
    } else if (comparison === 'notLike') {
      result = !findLike(conditionValue, value);
    } else if (comparison === 's%') {
      result = findLike(conditionValue, value, 'start');
    } else if (comparison === '%s') {
      result = findLike(conditionValue, value, 'end');
    } else if (comparison === 'isEmpty') {
      result = value === undefined || value === null || value === '';
    } else if (comparison === 'isNotEmpty') {
      result = !!value;
    }

    return result;
  };
  /**
   * 필터 조건에 따라 숫자를 확인한다.
   *
   * @param {array} item - row 데이터
   * @param {object} condition - 필터 정보
   * @param {string} columnType - 데이터 유형
   * @returns {boolean} 확인 결과
   */
  const numberFilter = (
    item: Array<any>,
    condition: object,
    columnType: string
  ): boolean => {
    const comparison = condition.comparison;
    const conditionValue = Number(condition.value.replace(/,/g, '')); // 콤마 제거
    let value = Number(item[ROW_DATA_INDEX][condition.index]);
    let result;
    if (columnType === 'float') {
      value = Number(value.toFixed(3));
    }

    if (comparison === '=') {
      result = value === conditionValue;
    } else if (comparison === '>') {
      result = value > conditionValue;
    } else if (comparison === '<') {
      result = value < conditionValue;
    } else if (comparison === '<=') {
      result = value <= conditionValue;
    } else if (comparison === '>=') {
      result = value >= conditionValue;
    } else if (comparison === '!=') {
      result = value !== conditionValue;
    } else if (comparison === 'isEmpty') {
      result = value === undefined || value === null || isNaN(value);
    } else if (comparison === 'isNotEmpty') {
      result = !!value || value === 0;
    }

    return result;
  };
  const booleanFilter = (
    item: { [x: string]: any }[],
    condition: { comparison: any; value: any; index: string | number }
  ) => {
    const comparison = condition.comparison;
    const conditionValue = condition.value;
    const value = `${item[ROW_DATA_INDEX][condition.index]}`;
    let result;

    if (comparison === '=') {
      result = value === conditionValue;
    }

    return result;
  };
  /**
   * 필터 조건이 적용된 데이터를 반환한다.
   *
   * @param {array} data - row 데이터
   * @param {string} columnType - 데이터 유형
   * @param {object} condition - 필터 정보
   * @returns {boolean} 확인 결과
   */
  const getFilteringData = (
    data: Array<any>,
    columnType: string,
    condition: object
  ): boolean => {
    let filterFn =
      columnType === 'string' || columnType === 'stringNumber'
        ? stringFilter
        : numberFilter;
    if (columnType === 'boolean') {
      filterFn = booleanFilter;
    }
    return data.filter((row) => filterFn(row, condition, columnType)) || [];
  };
  /**
   * 전체 데이터에서 설정된 필터 적용 후 결과를 filterStore 에 저장한다.
   */
  const setFilter = () => {
    const filteringItemsByColumn = filterInfo.filteringItemsByColumn;
    const fields = Object.keys(filteringItemsByColumn);
    const originStore = stores.originStore;
    let filterStore = [];
    let filteredOnce = false;
    let prevStore: any[] = [];

    fields.forEach((field, idx) => {
      const filters = filteringItemsByColumn[field];
      const index = getColumnIndex(field);
      const columnType = props.columns[index].type;
      const OR = filterInfo.columnOperator === 'or';
      const AND = idx > 0 && filterInfo.columnOperator === 'and';

      filters.forEach((item: object, ix: number) => {
        if (!filterStore.length && !filteredOnce) {
          filterStore = getFilteringData(originStore, columnType, {
            ...item,
            index,
          });
        } else if (AND && item.operator === 'or') {
          if (ix > 0) {
            filterStore.push(
              ...getFilteringData(prevStore, columnType, {
                ...item,
                index,
              })
            );
          } else {
            // ix === 0
            filterStore = getFilteringData(prevStore, columnType, {
              ...item,
              index,
            });
          }
        } else if ((ix === 0 && OR) || (ix !== 0 && item.operator === 'or')) {
          filterStore.push(
            ...getFilteringData(originStore, columnType, {
              ...item,
              index,
            })
          );
        } else {
          filterStore = getFilteringData(filterStore, columnType, {
            ...item,
            index,
          });
        }
        filteredOnce = true;
      });
      prevStore = JSON.parse(JSON.stringify(filterStore));
    });

    if (!filteredOnce) {
      stores.filterStore = originStore;
    } else {
      stores.filterStore = uniqBy(filterStore, JSON.stringify);
    }
  };

  let searchTimer: string | number | NodeJS.Timeout | null | undefined = null;
  const onSearch = (searchWord: { toString: () => string }) => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      filterInfo.isSearch = false;
      filterInfo.searchWord = searchWord;
      if (searchWord) {
        stores.searchStore = stores.store.filter((row: any[]) => {
          let isShow = false;
          const rowData = columnSettingInfo.isFilteringColumn
            ? row[ROW_DATA_INDEX].filter((data: any, idx: any) =>
                columnSettingInfo.visibleColumnIdx.includes(idx)
              )
            : row[ROW_DATA_INDEX];

          for (let ix = 0; ix < stores.orderedColumns.length; ix++) {
            const column = stores.orderedColumns[ix] || {};
            let columnValue = rowData[ix] ?? null;
            column.type = column.type || 'string';
            if (columnValue !== null) {
              if (typeof columnValue === 'object') {
                columnValue = columnValue[column.field];
              }
              if (
                !column.hide &&
                (column?.searchable === undefined || column?.searchable)
              ) {
                columnValue = getConvertValue(column, columnValue).toString();
                isShow = columnValue
                  .toLowerCase()
                  .includes(searchWord.toString().toLowerCase());
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
      setHeaderCheckboxByFilter(stores.store);
      if (!searchWord && pageInfo.isClientPaging && pageInfo.prevPage) {
        pageInfo.currentPage = 1;
        stores.pagingStore = getPagingData();
      }

      updatePagingInfo({ onSearch: true });
      updateVScroll();
    }, 500);
  };
  return { onSearch, setFilter, setHeaderCheckboxByFilter };
};

export const contextMenuEvent = (params: {
  contextInfo: any;
  stores: any;
  selectInfo: any;
  onSort: any;
  filterInfo: any;
  useGridSetting: any;
  columnSettingInfo: any;
  setColumnHidden: any;
}) => {
  const {
    contextInfo,
    stores,
    selectInfo,
    onSort,
    filterInfo,
    useGridSetting,
    columnSettingInfo,
    setColumnHidden,
  } = params;
  /**
   * 컨텍스트 메뉴를 설정한다.
   *
   * @param {object} event - 이벤트 객체
   */
  let contextmenuTimer: string | number | NodeJS.Timeout | null | undefined =
    null;
  const { emit } = getCurrentInstance()!;
  const setContextMenu = (e: object) => {
    if (contextmenuTimer) {
      clearTimeout(contextmenuTimer);
    }
    const menuItems: any[] = [];
    contextmenuTimer = setTimeout(() => {
      if (contextInfo.customContextMenu.length) {
        const customItems = contextInfo.customContextMenu.map((item: any) => {
          const menuItem = item;
          if (menuItem.validate) {
            menuItem.disabled = !menuItem.validate(
              menuItem.itemId,
              selectInfo.selectedRow
            );
          }

          menuItem.selectedRow = selectInfo.selectedRow ?? [];
          menuItem.contextmenuInfo = selectInfo.contextmenuInfo ?? [];

          return menuItem;
        });

        menuItems.push(...customItems);
      }

      contextInfo.contextMenuItems = menuItems;
      contextInfo.menu.show(e);
    }, 200);
  };
  /**
   * 마우스 우클릭 이벤트를 처리한다.
   *
   * @param {object} e - 이벤트 객체
   */
  const onContextMenu = (e: object) => {
    e.preventDefault();
    const target = e.target;
    const rowIndex = target.closest('.row')?.dataset?.index;
    let clickedRow = null;
    if (rowIndex) {
      clickedRow = stores.viewStore.find(
        (row: number[]) => row[ROW_INDEX] === +rowIndex
      )?.[ROW_DATA_INDEX];
    }
    if (clickedRow) {
      selectInfo.contextmenuInfo = [clickedRow];
      setContextMenu(e);
    }
  };
  /**
   * 컬럼 기능을 수행하는 Contextmenu 를 생성한다.
   *
   * @param {object} event - 이벤트 객체
   * @param {object} column - 컬럼 정보
   */
  const onColumnContextMenu = (event: object, column: object) => {
    if (event.target.className === 'column-name') {
      const sortable = column.sortable === undefined ? true : column.sortable;
      const filterable =
        filterInfo.isFiltering && column.filterable === undefined
          ? true
          : column.filterable;
      const columnMenuItems = [
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
        {
          text: contextInfo.columnMenuTextInfo?.filter ?? 'Filter',
          iconClass: 'ev-icon-filter-list',
          click: () => {
            const docWidth = document.documentElement.clientWidth;
            const clientX = contextInfo.columnMenu.menuStyle.clientX;
            const pageX = contextInfo.columnMenu.menuStyle.pageX;
            const MODAL_WIDTH = 350;
            const isOver = docWidth < clientX + MODAL_WIDTH;
            if (isOver) {
              contextInfo.columnMenu.menuStyle.left = `${pageX - MODAL_WIDTH}px`;
            }
            filterInfo.filterSettingPosition = {
              top: contextInfo.columnMenu.menuStyle.top,
              left: contextInfo.columnMenu.menuStyle.left,
            };
            filterInfo.isShowFilterSetting = true;
            filterInfo.filteringColumn = column;
          },
          disabled: !filterable,
          hidden: contextInfo.hiddenColumnMenuItem?.filter,
        },
        {
          text: contextInfo.columnMenuTextInfo?.hide ?? 'Hide',
          iconClass: 'ev-icon-visibility-off',
          disabled: !useGridSetting.value || stores.orderedColumns.length === 1,
          hidden: contextInfo.hiddenColumnMenuItem?.hide,
          click: () => {
            setColumnHidden(column.field);
            emit('change-column-status', {
              columns: stores.updatedColumns,
            });
          },
        },
      ];
      contextInfo.columnMenuItems = [];
      if (!sortable && !filterable) {
        return;
      }
      contextInfo.columnMenuItems = columnMenuItems.filter(
        (item) => !item.hidden
      );
    }
  };
  /**
   * 상단 우측의 Grid 옵션에 대한 Contextmenu 를 생성한다.
   *
   * @param {object} e - 이벤트 객체
   */
  const onGridSettingContextMenu = (e: object) => {
    const { useDefaultColumnSetting, columnSettingTextInfo } =
      columnSettingInfo;
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

export const storeEvent = (params: {
  selectInfo: any;
  checkInfo: any;
  stores: any;
  sortInfo: any;
  elementInfo: any;
  filterInfo: any;
  expandedInfo: any;
  setSort: any;
  updateVScroll: any;
  setFilter: any;
}) => {
  const { props } = getCurrentInstance()!;
  const {
    selectInfo,
    checkInfo,
    stores,
    sortInfo,
    elementInfo,
    filterInfo,
    expandedInfo,
    setSort,
    updateVScroll,
    setFilter,
  } = params;
  /**
   * 전달된 데이터를 내부 store 및 속성에 저장한다.
   *
   * @param {array} rows - row 데이터
   * @param {boolean} isMakeIndex - 인덱스 생성 유무
   */
  const setStore = (rows: Array<any>, isMakeIndex: boolean = true) => {
    if (isMakeIndex) {
      const store: any[][] = [];
      let hasUnChecked = false;
      rows.forEach((row, idx) => {
        const checked = props.checked.includes(row);
        const uncheckable =
          props.uncheckable.includes(row) || props.disabledRows.includes(row);
        let selected = false;
        if (selectInfo.useSelect) {
          selected = props.selected.includes(row);
        }
        if (!checked && !uncheckable) {
          hasUnChecked = true;
        }
        let expanded = false;
        if (expandedInfo.useRowDetail) {
          expanded = props.expanded.includes(row);
        }
        const disabled = props.disabledRows.includes(row);
        store.push([
          idx,
          checked,
          row,
          selected,
          expanded,
          uncheckable,
          disabled,
        ]);
      });
      checkInfo.isHeaderChecked = rows.length > 0 ? !hasUnChecked : false;
      checkInfo.isHeaderIndeterminate =
        hasUnChecked && !!checkInfo.checkedRows.length;
      checkInfo.isHeaderUncheckable = rows.every(
        (row) =>
          props.uncheckable.includes(row) || props.disabledRows.includes(row)
      );
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
  return { setStore };
};

export const pagingEvent = (params: {
  stores: any;
  pageInfo: any;
  sortInfo: any;
  filterInfo: any;
  elementInfo: any;
  clearCheckInfo: any;
}) => {
  const { emit } = getCurrentInstance()!;
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
    return stores.store.slice(start, end);
  };
  const updatePagingInfo = (eventName: {
    onChangePage?: boolean;
    onSearch?: any;
    onSort?: any;
  }) => {
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
          .filter(
            (c: { hide: any; searchable: undefined }) =>
              !c.hide && (c?.searchable === undefined || c?.searchable)
          )
          .map((d: { field: any }) => d.field),
      },
    });
    if (pageInfo.isInfinite && (eventName?.onSearch || eventName?.onSort)) {
      pageInfo.currentPage = 1;
      elementInfo.body.scrollTop = 0;
      clearCheckInfo();
    }
  };
  const changePage = (beforeVal: any) => {
    if (pageInfo.isClientPaging) {
      pageInfo.prevPage = beforeVal;
      if (stores.store.length <= pageInfo.perPage) {
        stores.pagingStore = stores.store;
      } else {
        const start = (pageInfo.currentPage - 1) * pageInfo.perPage;
        const end = parseInt(start, 10) + parseInt(pageInfo.perPage, 10);
        stores.pagingStore = stores.store.slice(start, end);
        elementInfo.body.scrollTop = 0;
        pageInfo.startIndex = start;
      }
    }
    updatePagingInfo({ onChangePage: true });
  };
  return { getPagingData, updatePagingInfo, changePage };
};

export const columnSettingEvent = (params: {
  stores: any;
  columnSettingInfo: any;
  contextInfo: any;
  onSearch: any;
  onResize: any;
}) => {
  const { props, emit } = getCurrentInstance()!;
  const { stores, columnSettingInfo, contextInfo, onSearch, onResize } = params;

  const setPositionColumnSetting = (toolbarRef: {
    getBoundingClientRect: () => any;
  }) => {
    if (!columnSettingInfo.isShowColumnSetting) {
      return;
    }
    columnSettingInfo.columnSettingPosition.columnListMenuWidth = 0;

    if (contextInfo.gridSettingContextMenuItems.length) {
      // 컨텍스트 메뉴 형태인 경우
      const columnListMenu = contextInfo.gridSettingContextMenuItems.length - 1;
      const columnListMenuRect =
        contextInfo.gridSettingMenu?.rootMenuList?.$el?.children[0].children[
          columnListMenu
        ].getBoundingClientRect();

      columnSettingInfo.columnSettingPosition.columnListMenuWidth =
        columnListMenuRect.width;
      columnSettingInfo.columnSettingPosition.top = columnListMenuRect.top;
      columnSettingInfo.columnSettingPosition.left = columnListMenuRect.right;
    } else {
      // 컬럼 리스트만 있는 경우
      const toolbarRefDivRect = toolbarRef?.getBoundingClientRect();
      const toolbarHeight = toolbarRefDivRect?.height;

      columnSettingInfo.columnSettingPosition.top =
        toolbarRefDivRect?.top + toolbarHeight;
      columnSettingInfo.columnSettingPosition.left = toolbarRefDivRect?.right;
    }
  };

  const initColumnSettingInfo = () => {
    stores.filteredColumns.length = 0;
    columnSettingInfo.isShowColumnSetting = false;
    columnSettingInfo.isFilteringColumn = false;
    columnSettingInfo.visibleColumnIdx = [];
    columnSettingInfo.hiddenColumn = '';
  };
  const setFilteringColumn = () => {
    columnSettingInfo.visibleColumnIdx = stores.filteredColumns.map(
      (col: { index: any }) => col.index
    );

    const originColumnIdx = stores.originColumns
      .filter(
        (col: { hide: any; hiddenDisplay: any }) =>
          !col.hide || col.hiddenDisplay
      )
      .map((col: { index: any }) => col.index);
    const visibleColumnIdx = columnSettingInfo.visibleColumnIdx;

    columnSettingInfo.isFilteringColumn =
      visibleColumnIdx.length !== originColumnIdx.length;

    // 컬럼을 필터링했을 때, 검색어가 있는 경우 재검색
    if (props.option.searchValue) {
      onSearch(props.option.searchValue);
    }
    onResize();
  };
  const onApplyColumn = (columnNames: string | any[]) => {
    const columns = stores.orderedColumns.filter(
      (col: { hide: any; hiddenDisplay: any }) =>
        !col.hide && !col.hiddenDisplay
    );
    const isSameColumn =
      columnNames.length === columns.length &&
      columns.every((col: { field: any }) => columnNames.includes(col.field));

    if (isSameColumn) {
      return;
    }

    stores.filteredColumns = stores.originColumns.filter(
      (col: { field: any; caption: any; hiddenDisplay: boolean }) => {
        if (columnNames.includes(col.field) || !col.caption) {
          // 보여줄 컬럼들은 hiddenDisplay 속성을 false로 전부 적용
          col.hiddenDisplay = false;
          return true;
        }

        // 보여주지 않을 컬럼들은 hiddenDisplay 속성을 전부 ture로 적용
        col.hiddenDisplay = true;
        return false;
      }
    );
    columnSettingInfo.hiddenColumn = '';
    setFilteringColumn();
    emit('change-column-status', {
      columns: stores.updatedColumns,
    });
  };
  const setColumnHidden = (val: any) => {
    const columns = stores.orderedColumns.filter(
      (col: { hide: any; hiddenDisplay: any }) =>
        !col.hide && !col.hiddenDisplay
    );

    if (columns.length === 1) {
      return;
    }
    stores.filteredColumns = columns.filter(
      (col: { field: any; hiddenDisplay: boolean }) => {
        if (col.field !== val) {
          col.hiddenDisplay = false;
          return true;
        }
        col.hiddenDisplay = true;
        return false;
      }
    );
    columnSettingInfo.hiddenColumn = val;
    setFilteringColumn();
  };

  return {
    setPositionColumnSetting,
    initColumnSettingInfo,
    onApplyColumn,
    setColumnHidden,
  };
};

export const dragEvent = ({ stores }) => {
  const { emit } = getCurrentInstance()!;
  const setColumnMoving = (currentIndex: string, droppedIndex: string) => {
    const oldIndex = parseInt(currentIndex, 10);
    const newPositionIndex = parseInt(droppedIndex, 10);

    if (!Number.isInteger(oldIndex) || !Number.isInteger(newPositionIndex)) {
      return;
    }

    const columns = [...stores.orderedColumns];
    const movedColumn = columns[oldIndex];

    columns.splice(oldIndex, 1);
    columns.splice(newPositionIndex, 0, movedColumn);

    if (stores.filteredColumns.length) {
      stores.filteredColumns = columns;
    } else {
      stores.movedColumns = columns;
    }
  };
  const onDragStart = (e: {
    dataTransfer: { setData: (arg0: string, arg1: any) => void };
    currentTarget: { dataset: { index: any } };
  }) => {
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.index);
  };
  const onDragOver = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };
  const onDrop = (e: {
    preventDefault: () => void;
    dataTransfer: { getData: (arg0: string) => any };
    target: { parentNode: { dataset: { index: any } } };
  }) => {
    e.preventDefault();
    const currentIndex = e.dataTransfer.getData('text/plain');
    const droppedIndex = e.target.parentNode.dataset.index;
    setColumnMoving(currentIndex, droppedIndex);
    emit('change-column-order', {
      column: stores.orderedColumns[droppedIndex],
      columns: stores.updatedColumns,
    });
  };
  return {
    onDragStart,
    onDragOver,
    onDrop,
  };
};
