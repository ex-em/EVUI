<template>
  <div
    ref="evuiGrid"
    :style="{} | gridStyleFilter({width: width, height: height})"
    class="evui-reset evui-grid">
    <div
      class="evui-grid-box"
      style="width:100%;height:100%;">
      <div
        class="evui-grid-body"
        style="top: 0px; bottom: 0px; left: 0px; right: 0px;">
        <div
          ref="gridColumns"
          class="evui-grid-columns"
          style="">
          <table>
            <tbody>
              <tr>
                <td
                  id="grid_grid_column_start"
                  class="evui-head"
                  col="start"
                  style="border-right: 0px; width: 0px;"/>
                <template v-for="(column, index) in columnsInfo">
                  <td
                    :key="index"
                    :col="index"
                    :style="{width: column.width}"
                    :ref="`${column.field}_col`"
                    class="evui-head"
                    @mouseup="columnSort(column, $event)"
                    @mousedown.stop.prevent="columnMove(column, index, $event)">
                    <div
                      :style="{
                        height: '25px',
                        marginLeft: `${(parseFloat(column.width)-6)}px`
                      }"
                      class="evui-resizer"
                      @mousedown.stop.prevent="columnResize(column, index, $event)"/>
                    <div class="evui-col-header">
                      <div
                        v-if="column.sortable"
                        :ref="`${column.field}_sort`"/>
                      {{ column.caption }}
                    </div>
                  </td>
                </template>
                <td
                  :style="{width: `${endColWidth}px`}"
                  class="evui-head evui-head-last"
                  col="end">
                  <div>&nbsp;</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          id="grid_grid_records"
          class="evui-grid-records"
          style="top: 25px; overflow-x: auto; overflow-y: auto;"
          @scroll="scrollColumns">
          <table>
            <tbody>
              <tr line="0">
                <td
                  class="evui-grid-data evui-grid-data-spacer"
                  col="start"
                  style="height: 0px; width: 0px;"/>

                <template v-for="(column, index) in columnsInfo">
                  <td
                    :key="index"
                    :col="index"
                    :style="{height: '0px', width: column.width}"
                    class="evui-grid-data"/>
                </template>
              </tr>
              <tr
                id="grid_grid_rec_top"
                line="top"
                style="height: 0px">
                <td colspan="2000"/>
              </tr>

              <template v-for="(row, rowIndex) in resultData">
                <tr
                  :key="rowIndex"
                  :line="(rowIndex+1)"
                  :index="rowIndex"
                  :class="(rowIndex+1)%2 !== 0 ? 'evui-odd' : 'evui-even'"
                  style="height: 24px; ">
                  <td
                    class="evui-grid-data-spacer"
                    col="start"
                    style="border-right: 0"/>

                  <template v-for="(col, colIndex) in columnsInfo">
                    <td
                      :key="colIndex"
                      :col="colIndex"
                      class="evui-grid-data "
                      style="">
                      <div style="max-height: 24px;">
                        {{ row[col.field] }}
                      </div>
                    </td>
                  </template>

                  <td
                    class="evui-grid-data-last"
                    col="end"/>
                </tr>
              </template>

              <tr
                id="grid_grid_rec_bottom"
                line="bottom"
                style="height: 0px">
                <td
                  colspan="2000"
                  style="border: 0"/>
              </tr>
              <tr
                id="grid_grid_rec_more"
                style="display: none">
                <td
                  colspan="2000"
                  class="evui-load-more"/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      ref="headGhost"
      class="evui-head-ghost"/>
    <div
      ref="marker"
      class="col-intersection-marker">
      <div class="top-marker"/>
      <div class="bottom-marker"/>
    </div>
  </div>

</template>

<script>
  import '@/components/table/table2.css';
  import util from '@/common/utils.table';
  import _ from 'lodash';

  export default {

    filters: {
      gridStyleFilter(obj, style) {
        const styleObj = _.defaults(obj, style);
        styleObj.width = util.numberToPixel(style.width);
        styleObj.height = util.numberToPixel(style.height);

        return styleObj;
      },
      gridBoxFilter(obj, style) {
        const styleObj = _.defaults(obj, style);

        // %면 그냥  넣어주고 px이면 -2 해서 넣어준다. 양쪽 border 크기
        if (util.isPercentValue(style.width)) {
          styleObj.width = util.numberToPixel(style.width);
        } else {
          const boxWidth = `${util.quantity(style.width).value - 2}px`;
          styleObj.width = util.numberToPixel(boxWidth);
        }

        if (util.isPercentValue(style.height)) {
          styleObj.height = util.numberToPixel(style.height);
        } else {
          const boxHeight = `${util.quantity(style.height).value - 2}px`;
          styleObj.height = util.numberToPixel(boxHeight);
        }

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
    },

    data() {
      return {
        columns: [
          { field: 'recid', caption: 'ID', size: '50px', sortable: true },
          // { field: 'fname', caption: 'First Name', size: '30%', sortable: true },
          // { field: 'lname', caption: 'Last Name', size: '30%', sortable: true },
          // { field: 'email', caption: 'Email', size: '40%' },
          { field: 'fname', caption: 'First Name', size: '169px', sortable: true },
          { field: 'lname', caption: 'Last Name', size: '168px', sortable: true },
          { field: 'email', caption: 'Email', size: '104px' },
          { field: 'sdate', caption: 'Start Date' },
          { field: 'edate', caption: 'End Date' },
        ],
        records: [
          { recid: 1, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 10, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 11, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 12, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 13, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 200, fname: 'Manny', lname: 'Zilver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 14, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 15, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        ],

        // sort 관련 데이터들
        sortColumns: [],
        sortedData: [],
        isSort: false,

        // 최종 데이터 담을 곳
        resultData: [],

        // 넓이 계산용
        gridBoxWidth: 0,
        gridBoxHeight: 0,

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
        },

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

      };
    },

    computed: {
      columnsInfo() {
        return this.columns;
      },
    },

    // 초기데이터는 다 생성시 정의해보자
    created() {
      // window.addEventListener('resize',this.test);
      // this.width = util.numberToPixel(this.width);

      // 소트 데이터 초기값을 기본 데이터롤 복사해서 넣어두자.
      // 얕은 복사 객체 내용은 안바뀔거 같아서 얕은 복사함.
      // 객체 안의 내용 바뀔거 같은면 깊은 복사로 변경 필요.
      // 일단 가즈아!!
      this.sortedData = this.records.slice();
      this.resultData = this.records.slice();
    },
    mounted() {
      // 그리드박스 높이 너비 가져오기
      this.gridBoxHeight = this.$refs.evuiGrid.clientHeight;
      this.gridBoxWidth = this.$refs.evuiGrid.clientWidth;

      // 그리드 sizeColSum 계산 및 size 값이 없는경우 빼고 값 설정
      for (let ix = 0, ixLen = this.columns.length; ix < ixLen; ix++) {
        // 초기화 한번 시켜주고요
        _.defaults(this.columns[ix], this.columnDefaultProperty);
        // 컬럼 너비랑, % 값인지를 가지고 있자
        const colWidth = util.quantity(this.columns[ix].size);
        const isPercentValue = colWidth ? colWidth.unit === '%' : false;
        const min = util.quantity(this.columns[ix].min).value;
        const max = this.columns[ix].max ? util.quantity(this.columns[ix].max).value : undefined;

        // 숫자로 넘어올때 px 붙여주기용 이상한 값 처리등 % 값일때 처리
        if (isPercentValue) {
          const percentToPixel = this.gridBoxWidth * (colWidth.value / 100);
          this.columns[ix].width = `${util.checkColSize(percentToPixel, min, max)}px`;
          this.sizeColSum += util.checkColSize(percentToPixel, min, max);
        } else if (colWidth === undefined) {
          this.noSizeColList.push(this.columns[ix]); // 얕은복사 % 숫자 px도 아닐때
        } else {
          this.columns[ix].width = `${util.checkColSize(colWidth.value, min, max)}px`; // px 숫자일때
          this.sizeColSum += util.checkColSize(colWidth.value, min, max);
        }
      }

      this.verticalScroll = (this.gridBoxHeight - 25) < (this.records.length * 24);
      let leftSize;
      if (this.verticalScroll) {
        leftSize = this.gridBoxWidth - this.sizeColSum - this.scrollBarSize;
        this.endColWidth = this.scrollBarSize;
      } else {
        leftSize = this.gridBoxWidth - this.sizeColSum;
        this.endColWidth = 0;
      }


      // 그리드 크기 남은공간에 size 집어 넣기 size값 없는놈들
      const colSize = leftSize / this.noSizeColList.length;
      if (this.noSizeColList.length > 0) {
        for (let ix = 0, ixLen = this.noSizeColList.length; ix < ixLen; ix++) {
          // debugger;
          const min = util.quantity(this.noSizeColList[ix].min).value;
          const max = this.noSizeColList[ix].max ?
            util.quantity(this.noSizeColList[ix].max).value : undefined;
          this.noSizeColList[ix].width = `${util.checkColSize(colSize, min, max)}px`;
          this.sizeColSum += util.checkColSize(colSize, min, max);
        }
      } else if (leftSize > 0) {
        this.endColWidth = this.gridBoxWidth - this.sizeColSum;
      }
      this.$forceUpdate();
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
          this.sortedData = _.orderBy(this.sortedData, column.field, 'asc');

          // 정렬 값을 resultData에 넣어주자
          this.resultData = _.cloneDeep(this.sortedData);

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
              this.sortedData = this.records.slice();

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
            this.resultData = _.cloneDeep(this.sortedData);

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
              this.sortedData = this.records.slice();

              // 정렬을 해보자.
              const filedList = _.map(this.sortColumns, 'field');
              const directionList = _.map(this.sortColumns, 'direction');
              this.sortedData = _.orderBy(this.sortedData, filedList, directionList);

              // 정렬 값을 resultData에 넣어주자
              this.resultData = _.cloneDeep(this.sortedData);
            } else {
              this.sortedData = this.records.slice();

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
              this.resultData = _.cloneDeep(this.sortedData);
            }
          }
        }
      },
      columnResize(column, index, event) {
        // 리사이즈 이벤트  처리
        const vm = this;
        // sort랑 이벤트 충돌때문에 flag값으로 처리
        this.resizeFlag = true;
        const startOffset = util.quantity(vm.columns[index].width).value - event.screenX;
        const min = util.quantity(vm.columns[index].min).value;
        const max = vm.columns[index].max ? util.quantity(vm.columns[index].max).value : undefined;

        function onMouseMove(e) {
          e.stopPropagation();
          e.preventDefault();
          const colWidth = util.checkColSize((e.screenX + startOffset), min, max);
          vm.sizeColSum -= util.quantity(vm.columns[index].width).value;
          vm.sizeColSum += colWidth;
          vm.columns[index].width = `${colWidth}px`;
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
        const startOffsetY = this.$refs.evuiGrid.offsetTop - 20; // 기본 Y 고스트 위치용
        const startOffsetX = this.$refs.evuiGrid.offsetLeft - 15; // 기본 X 고스트 위치용

        let colIndex; // 드랍 할 컬럼 인덱스

        // 컬럼 고스트 무브
        function moveAt(pageX, pageY) {
          // debugger;
          vm.$refs.headGhost.style.left = `${pageX - startOffsetX}px`;
          vm.$refs.headGhost.style.top = `${pageY - startOffsetY}px`;
        }

        // 컬럼 배열 변경
        function changeColumn(dragCol, dropCol, comlumnData) {
          if (dragCol !== dropCol) {
            vm.columns.splice(dragCol, 1);
            vm.columns.splice(dropCol, 0, comlumnData);
          }
        }

        // 마우스 이동할때 이벤트
        function onMouseMove(e) {
          moveAt(e.pageX, e.pageY);

          const targetEl = e.target;
          if (!targetEl) {
            return;
          }

          const targetCol = targetEl.closest('.evui-head');

          if (!targetCol) {
            return;
          }


          if (targetCol.getAttribute('col') === 'start' || targetCol.getAttribute('col') === 'end') {
            return;
          }

          colIndex = +targetCol.getAttribute('col');
          const targetColHalfWidth = targetCol.offsetWidth / 2;
          const targetColPoint = e.pageX - targetCol.getBoundingClientRect().x;

          if (targetColHalfWidth > targetColPoint) {
            vm.$refs.marker.style.left = `${targetCol.offsetLeft}px`;
            // targetCol.style.borderLeft = '1px solid #72b2ff';
          } else {
            vm.$refs.marker.style.left = `${targetCol.offsetLeft + targetCol.offsetWidth}px`;
            // targetCol.style.borderRightColor = '#72b2ff';
          }
        }

        // 마우스 업 이벤트
        function onMouseUp(e) {
          e.stopPropagation();
          e.preventDefault();

          changeColumn(index, colIndex, vm.columns[index]);
          vm.$refs.headGhost.style.display = 'none';
          vm.$refs.marker.style.display = 'none';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp, true);
        }

        // sort랑 이벤트 충돌을 피하기 위해
        this.columnTimeout = setTimeout(() => {
          this.$refs.headGhost.style.display = 'block';
          this.$refs.marker.style.display = 'block';
          this.$refs.headGhost.textContent = column.caption;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp, true);

          moveAt(event.pageX, event.pageY);
        }, 100);
      },
      scrollColumns(e) {
        this.$refs.gridColumns.scrollLeft = e.currentTarget.scrollLeft;
      },
    },
  };
</script>
