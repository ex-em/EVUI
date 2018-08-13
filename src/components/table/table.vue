<template>
  <div style="width: 100%; height: 100%; position: relative;">
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
          style="top: 0px; bottom: 0px; left: 0px; right: 0px;"
        >
          <div
            ref="evuiGridRecords"
            class="evui-table-records"
            style="top: 25px; overflow-x: auto; overflow-y: auto;"
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

                      <template v-for="(col, colIndex) in originColumns">
                        <td
                          :key="colIndex"
                          :data-col="colIndex"
                          :style="{ textAlign: col.recordsAlign }"
                          class="evui-table-data"
                        >
                          <div style="max-height: 24px;">
                            {{ row[col.field] }}
                          </div>
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
                <tr>
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
                      @mouseup="columnSort(column, $event)"
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
                  >
                    <div>&nbsp;</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          v-if="pagination"
          class="evui-table-footer"
          style="bottom: 0px; left: 0px; right: 0px;"
        >
          <div>
            <div class="evui-table-footer-left"/>
            <div class="evui-table-footer-right">
              <button @click="movePage('start')">
                <i class="fas fa-angle-double-left"/>
              </button>
              <button @click="movePage('before')">
                <i class="fas fa-angle-left"/>
              </button>
              {{ currentPageInput }} / {{ lastPage }}
              <button @click="movePage('next')">
                <i class="fas fa-angle-right"/>
              </button>
              <button @click="movePage('end')">
                <i class="fas fa-angle-double-right"/>
              </button>
            </div>
            <div class="evui-table-footer-center"/>
          </div>
        </div>
      </div>
      <div
        ref="headGhost"
        class="evui-table-head-ghost"
      />
      <div
        ref="marker"
        class="evui-table-col-intersection-marker"
      >
        <div class="evui-table-top-marker"/>
        <div class="evui-table-bottom-marker"/>
      </div>
    </div>
    <div
      ref="evuiTableMenu"
      class="evui-table-menu"
    >
      <div
        class="evui-table-menu-tab-header"
      >
        <i class="fa fa-filter"/>
      </div>
      <div
        class="evui-table-menu-tab-body"
      >
        <table-filter-lite
          v-if="filter"
          :filter-condition="filterCondition"
          :field="menuField"
          @change="changeFilterValue"
        />
      </div>
    </div>
  </div>

</template>

<script>
  // import '@/components/table/table2.css';
  // import TableFilter from '@/components/table/table.filter';
  import TableFilterLite from '@/components/table/table.filter.lite';
  import util from '@/common/utils.table';
  import _ from 'lodash';
  import '@/styles/all.css';

  export default {
    components: {
      TableFilterLite,
    },
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
      pagination: {
        type: Boolean,
        default: false,
      },
      pageSize: {
        type: Number,
        default: 50,
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
        },
        rowHeight: 24,

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


        // filter 관련
        filterConditionObj: {}, // 필터링 한 조건들 넣을곳 컬럼 선택시
        filterConditionList: [], // 필터링 한 조건들 넣을곳 배열
        filteredData: [], // filter된 데이터값 넣을곳
        originFilterdData: [], // sort 안된 필터링 데이터
        exFilteredData: [], // filter 버튼 눌렸을시 그 컬럼 제외한 필터 실행 데이터
        isFilter: false,
        filterCondition: [], // 넘길때 사용,
        // recentCondition: [],

        // menu관련
        menuClickFlag: false,
        menuField: '',

        // 이벤트 관련 flag 값
        resizeFlag: false,

        // 현재페이지, 마지막페이지
        currentPage: 0,
        lastPage: 0,
      };
    },
    computed: {
      // columnsInfo() {
      //   console.log("ttt")
      //   return this.columns;
      // },
      currentPageInput: {
        get() {
          return this.currentPage;
        },
        set(value) {
          if (value === 0 || value > this.lastPage) {
            return;
          }
          this.currentPage = value;
          const start = (this.currentPage - 1) * this.pageSize;
          const end = this.currentPage * this.pageSize;

          if (this.isSort) {
            this.resultData = this.sortedData.slice(start, end);
          } else if (this.isFilter) {
            this.resultData = this.filteredData.slice(start, end);
          } else {
            this.resultData = this.originData.slice(start, end);
          }
        },
      },
    },
    created() {
      window.addEventListener('resize', this.draw);
    },
    mounted() {
      // 그리드박스 높이 너비 가져오기
      this.gridBoxHeight = this.$refs.evuiGrid.clientHeight;
      this.gridBoxWidth = this.$refs.evuiGrid.clientWidth;
      this.gridRecordsHeight = this.$refs.evuiGridRecords.offsetHeight;
      this.sortedData = this.originData.slice();

      this.$nextTick(() => {
        if (this.pagination) {
          const gridBody = this.$refs.evuiGridBody;
          gridBody.style.height = `${gridBody.offsetHeight - this.footerHeight}px`;

          this.currentPage = 1;
          this.lastPage = Math.ceil(this.originData.length / this.pageSize);
          const start = (this.currentPage - 1) * this.pageSize;
          const end = this.currentPage * this.pageSize;
          this.resultData = this.originData.slice(start, end);
        } else if (this.virtualScroll) {
          this.virtualRowCount = Math.ceil(this.gridRecordsHeight / this.rowHeight) + 1;
          // this.s
          this.virtualBottom = this.virtualRowCount;
          this.$refs.evuiRecordsTable.style.height = `${this.originData.length * this.rowHeight}px`;

          this.resultData = this.originData.slice(this.virtualTop, this.virtualBottom);
        } else {
          this.resultData = this.originData.slice();
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

        this.verticalScroll = this.gridRecordsHeight < (this.originData.length * this.rowHeight);
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
      });
      // this.$forceUpdate();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.draw);
    },
    methods: {
      columnSort(column, event) {
        if (this.columnTimeout) {
          clearTimeout(this.columnTimeout);
        }

        if (!column.sortable || this.resizeFlag) {
          return;
        }

        const sortTargetCls = this.$refs[`${column.field}_sort`][0].classList;

        // sort 된적이 없다면 무조건 sort 기능 실행시켜야지
        if (!this.isSort) {
          // sort 불린 값 true로
          this.isSort = true;

          // 자 소트 눌린필드를 sortcolumn에 넣어보자
          // 멀티 소트를 대비해 넣자
          this.sortColumns.push({
            field: column.field,
            direction: 'asc',
          });

          // 정렬을 해보자.
          if (this.isFilter) {
            this.sortedData = _.orderBy(this.filteredData, column.field, 'asc');
          } else {
            this.sortedData = _.orderBy(this.sortedData, column.field, 'asc');
          }

          // 정렬 값을 resultData에 넣어주자
          // pagination 조거 추가됨
          if (this.pagination) {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = this.currentPage * this.pageSize;
            this.resultData = this.sortedData.slice(start, end);
          } else {
            this.resultData = this.sortedData.slice(); // 깊은 복사에서 얕은 복사로 변경
          }

          // 이제 css를 변경해줘야겠지?
          sortTargetCls.add('evui-sort-up');
        } else {
          const sortedColumnIndex = _.findIndex(this.sortColumns, ['field', column.field]);
          const isMultiSort = event.ctrlKey;
          // -1이면 다른컬럼 클릭한거다
          if (sortedColumnIndex === -1) {
            // ctrl 키 누르고 클릭했으면 멀티 소트 기능 제공
            if (isMultiSort) {
              // 멀티소트이니 추가해주자
              this.sortColumns.push({
                field: column.field,
                direction: 'asc',
              });
            } else {
              // 새로 누른거니까 소트 아이콘 기존거 다 지우자
              for (let ix = 0, ixLen = this.sortColumns.length; ix < ixLen; ix++) {
                // up 모양 삭제
                this.$refs[`${this.sortColumns[ix].field}_sort`][0].classList.remove('evui-sort-up');
                // down 모양 삭제
                this.$refs[`${this.sortColumns[ix].field}_sort`][0].classList.remove('evui-sort-down');
              }
              // 소트 컬럼 초기화 한번해주자
              this.sortColumns = [];
              // 새로 누르는거니까 데이터도 초기화 해줘야겠지?
              // this.sortedData =
              if (this.isFilter) {
                this.sortedData = this.filteredData;
              } else {
                this.sortedData = this.originData;
              }

              // 소트 컬럼 추가 해주고
              this.sortColumns.push({
                field: column.field,
                direction: 'asc',
              });
            }

            // 정렬을 해보자.
            const filedList = _.map(this.sortColumns, 'field');
            const directionList = _.map(this.sortColumns, 'direction');
            this.sortedData = _.orderBy(this.sortedData, filedList, directionList);

            // 정렬 값을 resultData에 넣어주자
            // pagination 조거 추가됨
            if (this.pagination) {
              const start = (this.currentPage - 1) * this.pageSize;
              const end = this.currentPage * this.pageSize;
              this.resultData = this.sortedData.slice(start, end);
            } else {
              this.resultData = this.sortedData; // 깊은 복사에서 얕은 복사로 변경
            }

            // 이제 css를 변경해줘야겠지?
            sortTargetCls.add('evui-sort-up');
          } else {
            // 소트 된 컬럼을 눌렀을 경우 여기를 탄다.
            const direction = this.sortColumns[sortedColumnIndex].direction;

            // 먼저 ctrl 키 누르고 눌렀는지 확인해보자
            if (isMultiSort) {
              if (direction === 'asc') {
                // 내림차순으로 변경
                this.sortColumns[sortedColumnIndex].direction = 'desc';

                // 스타일을 입혀보자
                sortTargetCls.remove('evui-sort-up');
                sortTargetCls.add('evui-sort-down');
              } else {
                // desc 인경우 빼버림
                this.sortColumns.splice(sortedColumnIndex, 1);

                // sortcolumn 배열 크기가 0이면 소트 된게 없다
                if (this.sortColumns.length === 0) {
                  this.isSort = false;
                }

                // css 제거
                sortTargetCls.remove('evui-sort-down');
              }

              // sortedData 초기화 안전빵
              if (this.isFilter) {
                this.sortedData = this.filteredData;
              } else {
                this.sortedData = this.originData;
              }

              // 정렬을 해보자.
              const filedList = _.map(this.sortColumns, 'field');
              const directionList = _.map(this.sortColumns, 'direction');
              this.sortedData = _.orderBy(this.sortedData, filedList, directionList);

              // 정렬 값을 result Data에 넣어주자
              // pagination 조건 추가됨
              if (this.pagination) {
                const start = (this.currentPage - 1) * this.pageSize;
                const end = this.currentPage * this.pageSize;
                this.resultData = this.sortedData.slice(start, end);
              } else {
                this.resultData = this.sortedData.slice(); // 깊은 복사에서 얕은 복사로 변경
              }
            } else {
              if (this.isFilter) {
                this.sortedData = this.originFilterdData;
              } else {
                this.sortedData = this.originData;
              }

              // 새로 누른거니가 소트 아이콘 기존거 다 지우자
              for (let ix = 0, ixLen = this.sortColumns.length; ix < ixLen; ix++) {
                // up 모양 삭제
                this.$refs[`${this.sortColumns[ix].field}_sort`][0].classList.remove('evui-sort-up');
                // down 모양 삭제
                this.$refs[`${this.sortColumns[ix].field}_sort`][0].classList.remove('evui-sort-down');
              }

              // asc->desc로 변경
              if (direction === 'asc') {
                // 초기화
                this.sortColumns = [];

                // 내림차순으로 변경
                this.sortColumns.push({
                  field: column.field,
                  direction: 'desc',
                });

                // 정렬을 해보자.
                this.sortedData = _.orderBy(this.sortedData, column.field, 'desc');

                // 스타일을 입혀보자
                sortTargetCls.remove('evui-sort-up');
                sortTargetCls.add('evui-sort-down');
              } else {
                // desc 인경우 빼버림
                this.sortColumns = [];

                // 소트 안된거임
                this.isSort = false;

                sortTargetCls.remove('evui-sort-down');
              }
              // 정렬 값을 resultData에 넣어주자
              // pagination 조거 추가됨
              if (this.pagination) {
                const start = (this.currentPage - 1) * this.pageSize;
                const end = this.currentPage * this.pageSize;
                this.resultData = this.sortedData.slice(start, end);
              } else {
                this.resultData = this.sortedData; // 깊은 복사에서 얕은 복사로 변경
              }
            }
          }
        }
      },
      forceSort() {
        const filedList = _.map(this.sortColumns, 'field');
        const directionList = _.map(this.sortColumns, 'direction');
        if (this.isFilter) {
          this.sortedData = _.orderBy(this.exFilteredData, filedList, directionList);
        } else {
          this.sortedData = _.orderBy(this.originData, filedList, directionList);
        }
      },
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
      movePage(value) {
        switch (value) {
          case 'start' :
                this.currentPageInput = 1;
                break;
          case 'before' :
                this.currentPageInput -= 1;
                break;
          case 'next' :
                this.currentPageInput += 1;
                break;
          case 'end' :
                this.currentPageInput = this.lastPage;
                break;
          default:
                break;
        }
      },
      addRow(row, pos) {
        if (pos === 'start') {
          this.originData.unshift(row);
          this.originData.slice();
          this.draw();
        } else if (pos === 'end') {
          this.originData.push(row);
          // this.records.slice();
        } else {
          this.originData.push(row);
          // this.records.slice();
        }
      },
      draw() {
        // 그리드박스 높이 너비 가져오기
        this.gridBoxHeight = this.$refs.evuiGrid.clientHeight;
        this.gridBoxWidth = this.$refs.evuiGrid.clientWidth;
        this.gridRecordsHeight = this.$refs.evuiGridRecords.offsetHeight;
        // 초기화
        this.sizeColSum = 0;
        this.noSizeColList = [];
        this.endColWidth = 0;
        if (this.pagination) {
          const gridBody = this.$refs.evuiGridBody;

          // resize 대비해서 추가 resize 개발 후 검토 필요
          if ((this.gridBoxHeight - this.footerHeight) !== gridBody.offsetHeight) {
            gridBody.style.height = `${gridBody.offsetHeight - this.footerHeight}px`;
          }
          const start = (this.currentPage - 1) * this.pageSize;
          const end = this.currentPage * this.pageSize;

          if (this.isFilter) {
            this.lastPage = Math.ceil(this.filteredData.length / this.pageSize);
            this.resultData = this.filteredData.slice(start, end);
          } else if (this.isSort) {
            this.lastPage = Math.ceil(this.sortedData.length / this.pageSize);
            this.resultData = this.sortedData.slice(start, end);
          } else {
            this.lastPage = Math.ceil(this.originData.length / this.pageSize);
            this.resultData = this.originData.slice(start, end);
          }
        } else if (this.virtualScroll) {
          this.virtualRowCount = Math.ceil(this.gridRecordsHeight / this.rowHeight) + 1;
          this.virtualBottom = this.virtualRowCount;
          if (this.isFilter) {
            this.$refs.evuiRecordsTable.style.height = `${this.filteredData.length * this.rowHeight}px`;
            this.resultData = this.filteredData.slice(this.virtualTop, this.virtualBottom);
          } else if (this.isSort) {
            this.$refs.evuiRecordsTable.style.height = `${this.sortedData.length * this.rowHeight}px`;
            this.resultData = this.sortedData.slice(this.virtualTop, this.virtualBottom);
          } else {
            this.$refs.evuiRecordsTable.style.height = `${this.originData.length * this.rowHeight}px`;
            this.resultData = this.originData.slice(this.virtualTop, this.virtualBottom);
          }
        } else if (this.isFilter) {
          this.resultData = this.filteredData;
        } else if (this.isSort) {
          this.resultData = this.sortedData;
        } else {
          this.resultData = this.originData;
        }

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
            (this.originData.length * this.rowHeight);
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
      },
      checkCondition(data1, data2, condition, andOr, exResult) {
        let result;
        switch (condition) {
          case 'equal':
            if (andOr === 'and') {
              result = exResult && (data1 === data2);
            } else if (andOr === 'or') {
              result = exResult || (data1 === data2);
            } else {
              result = data1 === data2;
            }
            break;
          case 'notEqual':
            if (andOr === 'and') {
              result = exResult && (data1 !== data2);
            } else if (andOr === 'or') {
              result = exResult || (data1 !== data2);
            } else {
              result = data1 !== data2;
            }
            break;
          case 'like':
            if (andOr === 'and') {
              result = exResult && (data1.indexOf(data2) > -1);
            } else if (andOr === 'or') {
              result = exResult || (data1.indexOf(data2) > -1);
            } else {
              result = (data1.indexOf(data2) > -1);
            }
            break;
          case 'notLike':
            if (andOr === 'and') {
              result = exResult && (data1.indexOf(data2) === -1);
            } else if (andOr === 'or') {
              result = exResult || (data1.indexOf(data2) === -1);
            } else {
              result = (data1.indexOf(data2) === -1);
            }
            break;
          default :
            break;
        }
        return result;
      },

      changeFilterValue(param) {
        // const result = _.cloneDeep(param);
        const field = param.field;
        const andOrCondition = param.andOrCondition;
        const dataList = param.data;
        const valueList = [];
        const isFilter = param.nullValueCnt !== dataList.length;

        for (let ix = 0, ixLen = dataList.length; ix < ixLen; ix++) {
          if (dataList[ix].text !== '') {
            valueList.push({
              condition: dataList[ix].condition,
              text: dataList[ix].text,
            });
          }
        }

        this.filterConditionObj[field] = {
          field,
          isFilter,
          dataList,
          valueList,
        };
        if (isFilter) {
          this.filteredData = _.filter(this.exFilteredData, (data) => {
            let resultCondition = true;
            for (let ix = 0, ixLen = valueList.length; ix < ixLen; ix++) {
              const data1 = data[field].toString();
              const data2 = valueList[ix].text;
              const condition = valueList[ix].condition;

              if (ix > 0) {
                resultCondition
                  = this.checkCondition(data1, data2, condition, andOrCondition, resultCondition);
              } else {
                resultCondition = this.checkCondition(data1, data2, condition);
              }
            }
            return resultCondition;
          });
        } else {
          this.filteredData = this.exFilteredData;
        }

        this.filterConditionList = _.filter(this.filterConditionObj,
          data => data.isFilter === true);
        // 필터 상태 프래그값 설정
        if (this.filterConditionList.length > 0) {
          this.isFilter = true;
        } else {
          this.isFilter = false;
        }

        if (this.isSort) {
          const filedList = _.map(this.sortColumns, 'field');
          const directionList = _.map(this.sortColumns, 'direction');

          this.originFilterdData = this.filteredData;
          this.filteredData = _.orderBy(this.filteredData, filedList, directionList);
          this.sortedData = this.filteredData;
        } else {
          this.originFilterdData = this.filteredData;
        }

        this.draw();
      },
      columnFilter(menuField) {
        if (!this.isFilter) {
          this.exFilteredData = this.originData;
          return;
        }

        this.exFilteredData = this.originData;
        //
        // if (this.isSort) {
        //   const filedList = _.map(this.sortColumns, 'field');
        //   const directionList = _.map(this.sortColumns, 'direction');
        //   this.exFilteredData = _.orderBy(this.originData, filedList, directionList);
        // }

        for (let ix = 0, ixLen = this.filterConditionList.length; ix < ixLen; ix++) {
          const field = this.filterConditionList[ix].field;
          const valueList = this.filterConditionList[ix].valueList;
          const andOrCondition = this.filterConditionList[ix].andOrCondition;
          if (field !== menuField) {
            this.exFilteredData = _.filter(this.exFilteredData, (data) => {
              let resultCondition = true;
              for (let jx = 0, jxLen = valueList.length; jx < jxLen; jx++) {
                const data1 = data[field].toString();
                const data2 = valueList[jx].text;
                const condition = valueList[jx].condition;

                if (ix > 0) {
                  resultCondition
                    = this.checkCondition(data1, data2, condition, andOrCondition, resultCondition);
                } else {
                  resultCondition = this.checkCondition(data1, data2, condition);
                }
              }
              return resultCondition;
            });
          }
        }
        if (menuField === undefined) {
          this.filteredData = this.exFilteredData;
          this.originFilterdData = this.exFilteredData;
          if (this.isSort) {
            const filedList = _.map(this.sortColumns, 'field');
            const directionList = _.map(this.sortColumns, 'direction');
            this.filteredData = _.orderBy(this.exFilteredData, filedList, directionList);
          }
        }
      },
      clickFilter(event) {
        event.stopPropagation();
        event.preventDefault();
        const vm = this;
        const clientRect = this.$refs.evuiGrid.getBoundingClientRect();
        const startClientX = clientRect.left;
        const startClientY = clientRect.top;
        const startOffsetX = this.$refs.evuiGrid.offsetLeft;
        const startOffsetY = this.$refs.evuiGrid.offsetTop;
        const posX = (event.clientX - startClientX - event.offsetX) + startOffsetX + 6;
        const posY = (event.clientY - startClientY - event.offsetY) + startOffsetY + 7;
        const targetCol = event.target.closest('.evui-table-columns-head');
        const colIndex = +targetCol.getAttribute('data-col');

        function onClick(e) {
          e.stopPropagation();
          const menuEl = e.target.closest('.evui-table-menu');
          if (menuEl) {
            return;
          }
          vm.$refs.evuiTableMenu.style.display = 'none';
          vm.menuClickFlag = false;
          document.removeEventListener('mousedown', onClick, true);
        }
        this.$refs.evuiTableMenu.style.cssText =
          `left: ${posX}px; top: ${posY}px; display: block;`;
        if (!this.menuClickFlag) {
          document.addEventListener('mousedown', onClick, true);
          this.menuClickFlag = true;
        }

        this.menuField = this.originColumns[colIndex].field;
        if (this.filterConditionObj[this.menuField]) {
          this.filterCondition = this.filterConditionObj[this.menuField].dataList;
        } else {
          this.filterCondition = [];
        }
        this.columnFilter(this.menuField);
      },
      setData(data) {
        this.originData = data;
        if (this.isFilter) {
          this.columnFilter();
        }
        if (this.isSort) {
          this.forceSort();
        } else {
          this.sortedData = data.slice();
        }
      },
    },
  };
</script>
<style scoped src="@/components/table/table2.css"/>
