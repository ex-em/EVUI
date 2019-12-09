<template>
  <div
    :style="{} | gridStyleFilter({width: width, height: height})"
  >
    <div
      ref="evuiGrid"
      :style="{} | gridStyleFilter({width: width, height: height})"
      class="evui-table-reset evui-table"
    >
      <div
        class="evui-grid-box"
        style="width:100%;height:100%;"
      >
        <div
          ref="evuiGridBody"
          class="evui-table-body"
          style="top: 0; bottom: 0; left: 0; right: 0;"
        >
          <div
            ref="evuiGridRecords"
            :style="{ top: `${headerHeight + 1}px` }"
            class="evui-table-records"
            @scroll="scrollColumns"
          >
            <div
              ref="evuiRecordsTable"
            >
              <table>
                <tbody>
                  <tr>
                    <td
                      class="evui-table-data evui-table-data-spacer"
                      data-col="start"
                      style="height: 0px; width: 0px;"
                    />

                    <template v-for="(column, index) in originColumns">
                      <td
                        :key="index"
                        :data-col="index"
                        :style="{height: '0px', width: column.width}"
                        class="evui-table-data"
                      />
                    </template>
                  </tr>

                  <template v-for="(row, rowIndex) in resultData">
                    <tr
                      :key="rowIndex"
                      :class="(rowIndex+1)%2 !== 0 ? 'evui-odd' : 'evui-even'"
                      :style="{height: `${rowHeight}px`}"
                    >
                      <td
                        class="evui-table-data-spacer"
                        data-col="start"
                        style="border-right: 0"
                      />

                      <template
                        v-if="!elbow"
                      >
                        <td
                          v-for="(col, colIndex) in originColumns"
                          :key="colIndex"
                          :data-col="colIndex"
                          :style="{ textAlign: col.recordsAlign }"
                          class="evui-table-data"
                        >
                          <div
                            v-if="col.type === 'string' && col.cellRender === null"
                            class="evui-table-records-col"
                            style="max-height: 20px;"
                          >
                            <template v-if="treeGroupColumn === col.field">
                              <i
                                v-for="level in row.level"
                                :key="level"
                                class="evui-tree-empty"
                              />
                              <i
                                v-if="!row.leaf"
                                :class="row.expend ? 'evui-tree-minus':'evui-tree-plus'"
                                @click="toggle(row, $event)"
                              />
                              <i
                                v-else
                                class="evui-tree-empty"
                              />
                            </template>
                            <div
                              :style="{ lineHeight: `${rowHeight}px` }"
                              class="evui-table-records-text"
                            >
                              {{ row.data[col.field] }}
                            </div>
                          </div>
                          <div
                            v-else
                            :class="col.type === 'number' ? 'evui-col-number' : ''"
                            class="evui-table-records-col"
                            style="max-height: 20px;"
                            v-html="cellRender(row.data[col.field], col.type, col.cellRender, row)"
                          />
                        </td>
                      </template>

                      <template
                        v-else
                      >
                        <td
                          v-for="(col, colIndex) in originColumns"
                          :key="colIndex"
                          :data-col="colIndex"
                          :style="{ textAlign: col.recordsAlign }"
                          class="evui-table-data"
                        >
                          <div
                            v-if="col.type === 'string' && col.cellRender === null"
                            class="evui-table-records-col"
                            style="max-height: 20px;"
                          >
                            <template
                              v-if="treeGroupColumn === col.field"
                            >
                              <i
                                v-for="(elbow, index) in row.elbow"
                                :key="index"
                                :class="elbow ? 'evui-tree-elbow-line':'evui-tree-empty'"
                              />
                              <i
                                v-if="!row.leaf && !row.expend"
                                :class="row.last ?
                                'evui-tree-elbow-plus-end':'evui-tree-elbow-plus'"
                                @click="toggle(row, $event)"
                              />
                              <i
                                v-if="!row.leaf && row.expend"
                                :class="row.last ?
                                'evui-tree-elbow-minus-end':'evui-tree-elbow-minus'"
                                @click="toggle(row, $event)"
                              />
                              <i
                                v-if="row.leaf"
                                :class="row.last ? 'evui-tree-elbow-end':'evui-tree-elbow'"
                              />
                              <ev-checkbox
                                v-if="checkbox && row.leaf"
                                v-model="row.checked"
                                :size="'small'"
                                :type="'square'"
                                @on-click="changeCheckbox($event, row)"
                                @on-change="checkChageEvent($event, row)"
                              />
                              <ev-checkbox
                                v-if="checkbox && !row.leaf"
                                v-model="row.checked"
                                :size="'small'"
                                :type="'square'"
                                :after-type="row.afterType"
                                @on-click="changeCheckbox($event, row)"
                                @on-change="checkChageEvent($event, row)"
                              />
                            </template>
                            <div
                              :style="{ lineHeight: `${rowHeight}px` }"
                              class="evui-table-records-text"
                            >
                              {{ row.data[col.field] }}
                            </div>
                          </div>
                          <div
                            v-else
                            :class="col.type === 'number' ? 'evui-col-number' : ''"
                            class="evui-table-records-col"
                            style="max-height: 20px;"
                            v-html="cellRender(row.data[col.field], col.type, col.cellRender, row)"
                          />
                        </td>
                      </template>
                      <td
                        class="evui-table-data-last"
                        data-col="end"
                      />
                    </tr>
                  </template>

                  <tr
                    style="display: none"
                  >
                    <td
                      colspan="2000"
                      class="evui-table-load-more"
                    />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            ref="gridColumns"
            class="evui-table-columns"
            style=""
          >
            <table>
              <tbody>
                <tr
                  :style="{ height: `${headerHeight}px` }"
                >
                  <td
                    class="evui-table-columns-head"
                    data-col="start"
                    style="border-right: 0px; width: 0px;"
                  />
                  <template v-for="(column, index) in originColumns">
                    <td
                      :key="index"
                      :data-col="index"
                      :style="{width: column.width}"
                      :ref="`${column.field}_col`"
                      class="evui-table-columns-head"
                      @mousedown.stop.prevent="columnMove(column, index, $event)"
                    >
                      <div
                        :style="{
                          height: '25px',
                          marginLeft: `${(parseFloat(column.width)-6)}px`
                        }"
                        class="evui-table-columns-resizer"
                        @mousedown.stop.prevent="columnResize(column, index, $event)"
                      />
                      <div class="evui-table-col-header">
                        <div
                          v-if="column.sortable"
                          :ref="`${column.field}_sort`"
                        />
                        {{ column.caption }}
                        <span
                          v-if="filter"
                          class="fa fa-filter"
                          style="float: right; cursor: pointer;"
                          @mousedown="clickFilter"
                          @mouseup.stop.prevent
                        />
                      </div>
                    </td>
                  </template>
                  <td
                    :style="{width: `${endColWidth}px`}"
                    class="evui-table-columns-head evui-table-columns-head-last"
                    data-col="end"
                  />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import util from '@/common/utils.table';
  import treeUtil from '@/components/tree/tree.util';
  import _ from 'lodash-es';
  import '@/styles/lib/fontawesome.css';

  export default {
    filters: {
      gridStyleFilter(obj, style) {
        const styleObj = _.defaults(obj, style);
        styleObj.width = util.numberToPixel(style.width);
        styleObj.height = util.numberToPixel(style.height);

        return styleObj;
      },
    },

    props: {
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: '100%',
      },
      virtualScroll: {
        type: Boolean,
        default: false,
      },
      filter: {
        type: Boolean,
        default: false,
      },
      columns: {
        type: Array,
        default() {
          return [];
        },
      },
      records: {
        type: Array,
        default() {
          return [];
        },
      },
      elbow: {
        type: Boolean,
        default: false,
      },
      checkbox: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        // originData
        originData: this.records,
        originColumns: this.columns,

        // sort 관련 데이터들
        sortColumns: [],
        sortedData: [],
        isSort: false,

        // 최종 데이터 담을 곳
        resultData: [],

        // 넓이 계산용
        gridBoxWidth: 0,
        gridBoxHeight: 0,
        gridRecordsHeight: 0,
        footerHeight: 24,

        // 컬럼들값보다 그리드가 클때 마지막 추가 컬럼 크기
        endColWidth: 0,
        scrollBarSize: 17,

        // 컬럼 정보 세팅
        columnDefaultProperty: {
          min: 20,
          max: null,
          size: null,
          width: 0,
          sortable: false,
          recordsAlign: 'left',
          type: 'string',
          cellRender: null,
        },
        rowHeight: 20,

        // 가상 스크롤 관련
        virtualRowCount: 0,
        virtualTop: 0,
        virtualBottom: 0,
        prevScrollTop: 0,

        // 그리드가 퍼센트인지 확인용
        isPercentSize: false,
        isWidthPercent: false,
        isHeightPercent: false,
        noSizeColList: [], // size value 안한 컬럼 갯수
        percentColList: [],
        sizeColSum: 0, // 구할수 없는 size 값 빼고 합

        verticalScroll: false,

        // 이벤트 관련 flag 값
        resizeFlag: false,

        treeGroupColumn: '',

        headerHeight: 30,

        // 체크 데이터
        checkedObjData: [],
        checkedData: [],
      };
    },
    computed: {
    },
    created() {
      window.addEventListener('resize', this.draw);
      if (!this.treeGroupColumn && this.originColumns[0]) {
        this.treeGroupColumn = this.originColumns[0].field;
      }
    },
    mounted() {
      // 그리드박스 높이 너비 가져오기
      this.gridBoxHeight = this.$refs.evuiGrid.clientHeight;
      this.gridBoxWidth = this.$refs.evuiGrid.clientWidth;
      this.gridRecordsHeight = this.$refs.evuiGridRecords.offsetHeight;
      const result = treeUtil.transformTreeToArray(this.originData, this.checkbox);
      this.checkedData = result.checkedData;
      this.checkedObjData = result.checkedObjData;
      // this.sortedData = this.originData.slice();

      this.$nextTick(() => {
        if (this.virtualScroll) {
          this.virtualRowCount = Math.ceil(this.gridRecordsHeight / this.rowHeight) + 1;
          // this.s
          this.virtualBottom = this.virtualRowCount;
          this.$refs.evuiRecordsTable.style.height = `${this.originData.length * this.rowHeight}px`;

          this.resultData = this.originData.slice(this.virtualTop, this.virtualBottom);
        } else {
          this.resultData = result.resultData;
        }

        // 그리드 sizeColSum 계산 및 size 값이 없는경우 빼고 값 설정
        for (let ix = 0, ixLen = this.originColumns.length; ix < ixLen; ix++) {
          // 초기화 먼저
          _.defaults(this.originColumns[ix], this.columnDefaultProperty);
          // 컬럼 너비랑, % 값인지를 가지고 있자
          const colWidth = util.quantity(this.originColumns[ix].size);
          const isPercentValue = colWidth ? colWidth.unit === '%' : false;
          const min = util.quantity(this.originColumns[ix].min).value;
          const max = this.originColumns[ix].max ?
            util.quantity(this.originColumns[ix].max).value : undefined;

          // 숫자로 넘어올때 px 붙여주기용 이상한 값 처리등 % 값일때 처리
          if (isPercentValue) {
            const percentToPixel = Math.floor(this.gridBoxWidth * (colWidth.value / 100));
            this.originColumns[ix].width = `${util.checkColSize(percentToPixel, min, max)}px`;
            this.sizeColSum += util.checkColSize(percentToPixel, min, max);
          } else if (colWidth === undefined) {
            this.noSizeColList.push(this.originColumns[ix]); // 얕은복사 % 숫자 px도 아닐때
          } else {
            this.originColumns[ix].width = `${util.checkColSize(colWidth.value, min, max)}px`; // px 숫자일때
            this.sizeColSum += util.checkColSize(colWidth.value, min, max);
          }
        }

        this.verticalScroll = this.gridRecordsHeight < (this.resultData.length * this.rowHeight);
        let leftSize;
        if (this.verticalScroll) {
          leftSize = this.gridBoxWidth - this.sizeColSum - this.scrollBarSize;
          this.endColWidth = this.scrollBarSize;
        } else {
          leftSize = this.gridBoxWidth - this.sizeColSum;
          this.endColWidth = 0;
        }


        // 그리드 크기 남은공간에 size 집어 넣기 size값 없는놈들
        const colSize = Math.floor(leftSize / this.noSizeColList.length);
        if (this.noSizeColList.length > 0) {
          for (let ix = 0, ixLen = this.noSizeColList.length; ix < ixLen; ix++) {
            const min = util.quantity(this.noSizeColList[ix].min).value;
            const max = this.noSizeColList[ix].max ?
              util.quantity(this.noSizeColList[ix].max).value : undefined;
            const isLastIndex = (ix + 1) === ixLen;
            if (!isLastIndex) {
              leftSize -= util.checkColSize(colSize, min, max);
              this.noSizeColList[ix].width = `${util.checkColSize(colSize, min, max)}px`;
            } else {
              this.noSizeColList[ix].width = `${util.checkColSize(leftSize, min, max)}px`;
            }

            this.sizeColSum += util.checkColSize(colSize, min, max);
          }
        } else if (leftSize > 0) {
          this.endColWidth = this.gridBoxWidth - this.sizeColSum;
        }
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.draw);
    },
    methods: {
      columnResize(column, index, event) {
        // 리사이즈 이벤트  처리
        const vm = this;
        // sort랑 이벤트 충돌때문에 flag값으로 처리
        this.resizeFlag = true;
        const startOffset = util.quantity(vm.originColumns[index].width).value - event.screenX;
        const min = util.quantity(vm.originColumns[index].min).value;
        const max = vm.originColumns[index].max ?
          util.quantity(vm.originColumns[index].max).value : undefined;

        function onMouseMove(e) {
          e.stopPropagation();
          e.preventDefault();
          const colWidth = util.checkColSize((e.screenX + startOffset), min, max);
          vm.sizeColSum -= util.quantity(vm.originColumns[index].width).value;
          vm.sizeColSum += colWidth;
          vm.originColumns[index].width = `${colWidth}px`;
          if (vm.gridBoxWidth > vm.sizeColSum) {
            vm.endColWidth = vm.gridBoxWidth - vm.sizeColSum;
          } else if (vm.verticalScroll) {
            vm.endColWidth = vm.scrollBarSize;
          } else {
            vm.endColWidth = 0;
          }
          vm.$forceUpdate();
        }

        function onMouseUp(e) {
          e.stopPropagation();
          e.preventDefault();
          vm.resizeFlag = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      },
      columnMove(column, index, event) {
        // 컬럼 무브 처리
        event.stopPropagation();
        event.preventDefault();
        const vm = this;
        const clientRect = this.$refs.evuiGrid.getBoundingClientRect();
        const startClientX = clientRect.left;
        const startClientY = clientRect.top;


        let colIndex; // 드랍 할 컬럼 인덱스

        // 컬럼 고스트 무브
        function moveAt(clientX, clientY) {
          const posX = (clientX - startClientX) + 15;
          const posY = (clientY - startClientY) + 20;
          vm.$refs.headGhost.style.cssText =
            `top: ${posY}px; left: ${posX}px; display: block`;
        }

        // 컬럼 배열 변경
        function changeColumn(dragCol, dropCol, comlumnData) {
          if (dragCol === dropCol) {
            return;
          }
          if (dragCol < dropCol) {
            vm.originColumns.splice(dropCol, 0, comlumnData);
            vm.originColumns.splice(dragCol, 1);
          } else {
            vm.originColumns.splice(dragCol, 1);
            vm.originColumns.splice(dropCol, 0, comlumnData);
          }
        }

        // 마우스 이동할때 이벤트
        function onMouseMove(e) {
          moveAt(e.clientX, e.clientY);

          const targetEl = e.target;
          if (!targetEl) {
            return;
          }

          const targetCol = targetEl.closest('.evui-table-columns-head');

          if (!targetCol) {
            return;
          }


          if (targetCol.getAttribute('data-col') === 'start' || targetCol.getAttribute('data-col') === 'end') {
            return;
          }

          colIndex = +targetCol.getAttribute('data-col');

          const targetColHalfWidth = targetCol.offsetWidth / 2;
          const targetColPoint = e.pageX - targetCol.getBoundingClientRect().x;

          if (targetColHalfWidth > targetColPoint) {
            vm.$refs.marker.style.left = `${targetCol.offsetLeft}px`;
          } else {
            vm.$refs.marker.style.left = `${targetCol.offsetLeft + targetCol.offsetWidth}px`;
            colIndex += 1;
          }
        }

        // 마우스 업 이벤트
        function onMouseUp(e) {
          e.stopPropagation();
          e.preventDefault();
          vm.$refs.headGhost.style.display = 'none';
          vm.$refs.marker.style.display = 'none';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp, true);

          if (colIndex !== undefined) {
            changeColumn(index, colIndex, vm.originColumns[index]);
          }
        }
        // sort랑 이벤트 충돌을 피하기 위해
        this.columnTimeout = setTimeout(() => {
          // this.$refs.headGhost.style.display = 'block';
          this.$refs.marker.style.display = 'block';
          this.$refs.headGhost.textContent = column.caption;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp, true);
          moveAt(event.clientX, event.clientY);
        }, 200);
      },
      scrollColumns(e) {
        // horizontal 스크롤용
        const vm = this;
        this.$refs.gridColumns.scrollLeft = e.currentTarget.scrollLeft;

        if (!this.virtualScroll) {
          return;
        }
        // vertical 스크롤용
        const scrollTop = this.$refs.evuiGridRecords.scrollTop;

        function onJump() {
          vm.virtualTop = parseInt(scrollTop / vm.rowHeight, 10);
          vm.virtualBottom = vm.virtualTop + vm.virtualRowCount;
          vm.$refs.evuiRecordsTable.style.paddingTop = `${vm.virtualTop * vm.rowHeight}px`;
          if (vm.isSort) {
            vm.resultData = vm.sortedData.slice(vm.virtualTop, vm.virtualBottom);
          } else if (vm.isFilter) {
            vm.resultData = vm.filteredData.slice(vm.virtualTop, vm.virtualBottom);
          } else {
            vm.resultData = vm.originData.slice(vm.virtualTop, vm.virtualBottom);
          }
          vm.prevScrollTop = scrollTop;
        }

        function onNearScroll() {
          // 현재 스크롤된양
          const nextTop = parseInt(scrollTop / vm.rowHeight, 10);

          if (vm.virtualTop !== nextTop) {
            vm.virtualTop = nextTop;
            vm.virtualBottom = vm.virtualTop + vm.virtualRowCount;
          }
          vm.$refs.evuiRecordsTable.style.paddingTop = `${vm.virtualTop * vm.rowHeight}px`;
          if (vm.isSort) {
            vm.resultData = vm.sortedData.slice(vm.virtualTop, vm.virtualBottom);
          } else if (vm.isFilter) {
            vm.resultData = vm.filteredData.slice(vm.virtualTop, vm.virtualBottom);
          } else {
            vm.resultData = vm.originData.slice(vm.virtualTop, vm.virtualBottom);
          }
          vm.prevScrollTop = scrollTop;
        }

        if (Math.abs(scrollTop - vm.prevScrollTop) > vm.gridRecordsHeight) {
          onJump();
        } else {
          onNearScroll();
        }
      },

      draw() {
        // 그리드박스 높이 너비 가져오기
        this.$nextTick(() => {
          this.gridBoxHeight = this.$refs.evuiGrid.clientHeight;
          this.gridBoxWidth = this.$refs.evuiGrid.clientWidth;
          this.gridRecordsHeight = this.$refs.evuiGridRecords.offsetHeight;
          // 초기화
          this.sizeColSum = 0;
          this.noSizeColList = [];
          this.endColWidth = 0;

          const result = treeUtil.transformTreeToArray(this.originData, this.checkbox);
          this.resultData = result.resultData;
          this.checkedData = result.checkedData;
          this.checkedObjData = result.checkedObjData;

          // 그리드 sizeColSum 계산 및 size 값이 없는경우 빼고 값 설정
          for (let ix = 0, ixLen = this.originColumns.length; ix < ixLen; ix++) {
            // 초기화 한번 시켜주고요
            _.defaults(this.originColumns[ix], this.columnDefaultProperty);
            // 컬럼 너비랑, % 값인지를 가지고 있자
            const colWidth = util.quantity(this.originColumns[ix].size);
            const isPercentValue = colWidth ? colWidth.unit === '%' : false;
            const min = util.quantity(this.originColumns[ix].min).value;
            const max = this.originColumns[ix].max ?
              util.quantity(this.originColumns[ix].max).value : undefined;

            // 숫자로 넘어올때 px 붙여주기용 이상한 값 처리등 % 값일때 처리
            if (isPercentValue) {
              const percentToPixel = Math.floor(this.gridBoxWidth * (colWidth.value / 100));
              this.originColumns[ix].width = `${util.checkColSize(percentToPixel, min, max)}px`;
              this.sizeColSum += util.checkColSize(percentToPixel, min, max);
            } else if (colWidth === undefined) {
              this.noSizeColList.push(this.originColumns[ix]); // 얕은복사 % 숫자 px도 아닐때
            } else {
              this.originColumns[ix].width = `${util.checkColSize(colWidth.value, min, max)}px`; // px 숫자일때
              this.sizeColSum += util.checkColSize(colWidth.value, min, max);
            }
          }

          if (this.isFilter) {
            this.verticalScroll = this.gridRecordsHeight <
              (this.filteredData.length * this.rowHeight);
          } else {
            this.verticalScroll = this.gridRecordsHeight <
              (this.resultData.length * this.rowHeight);
          }

          let leftSize;
          if (this.verticalScroll) {
            leftSize = this.gridBoxWidth - this.sizeColSum - this.scrollBarSize;
            this.endColWidth = this.scrollBarSize;
          } else {
            leftSize = this.gridBoxWidth - this.sizeColSum;
            this.endColWidth = 0;
          }

          // 그리드 크기 남은공간에 size 집어 넣기 size값 없는놈들
          const colSize = Math.floor(leftSize / this.noSizeColList.length);
          if (this.noSizeColList.length > 0) {
            for (let ix = 0, ixLen = this.noSizeColList.length; ix < ixLen; ix++) {
              // debugger;
              const min = util.quantity(this.noSizeColList[ix].min).value;
              const max = this.noSizeColList[ix].max ?
                util.quantity(this.noSizeColList[ix].max).value : undefined;
              const isLastIndex = (ix + 1) === ixLen;
              if (!isLastIndex) {
                leftSize -= util.checkColSize(colSize, min, max);
                this.noSizeColList[ix].width = `${util.checkColSize(colSize, min, max)}px`;
              } else {
                this.noSizeColList[ix].width = `${util.checkColSize(leftSize, min, max)}px`;
              }

              this.sizeColSum += util.checkColSize(colSize, min, max);
            }
          } else if (leftSize > 0) {
            this.endColWidth = this.gridBoxWidth - this.sizeColSum;
          }
        this.$forceUpdate();
        });
      },
      setColumns(columns) {
        this.originColumns = columns;
        if (!this.treeGroupColumn && this.originColumns[0]) {
          this.treeGroupColumn = this.originColumns[0].field;
        }
      },
      setData(data) {
        this.originData = data;
      },
      cellRender(value, type, cellRender, row) {
        if (cellRender) {
          return cellRender(value, row);
        } else if (type === 'number') {
          return value ? Number(value).toLocaleString() : value;
        }
        return value;
      },
      clearData() {
        this.originData = [];
        this.sortedData = [];
        this.filteredData = [];
        this.virtualRowCount = 0;
        this.virtualTop = 0;
        this.virtualBottom = 0;
        this.prevScrollTop = 0;
      },
      toggle(row) {
        const rowData = row;
        // const result = treeUtil.transformTreeToArray(this.originData, this.checkbox);
        rowData.expend = !rowData.expend;
        // this.resultData = result.resultData;
        // this.checkedData = result.checkedData;
        // this.checkedObjData = result.checkedObjData;
        this.draw();
      },
      changeCheckbox(checked, row) {
        const rowData = row;
        const checkTarget = checked.target;
        rowData.checked = checkTarget.checked;
        if (!row.leaf) {
          rowData.afterType = '';
          treeUtil.childrenCheck(row.children, checkTarget.checked);
        }
         this.draw();
      },
      getCheckedData() {
        return this.checkedData;
      },
      checkChageEvent(e, row) {
        this.$emit('check-change', e, row);
      },
      test() {
        console.log('check');
      },
    },
  };
</script>

<style scoped src="@/components/tree/tree.table.grey.css"/>
<style>
  .evui-table-records-col .ev-checkbox .small {
    height: 19px;
  }
</style>
