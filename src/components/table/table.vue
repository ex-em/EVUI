<template>
  <div
    id="grid"
    style="width:750px; height:350px;"
    class="evui-reset evui-grid">
    <div
      class="evui-grid-box"
      style="width: 748px; height: 348px;">
      <div
        id="grid_grid_body"
        class="evui-grid-body"
        style="height: 348px; top: 0px; bottom: 0px; left: 0px; right: 0px;">
        <div
          id="grid_grid_columns"
          class="evui-grid-columns"
          style="left: 1px;">
          <table>
            <tbody>
              <tr>
                <td
                  id="grid_grid_column_start"
                  class="evui-head"
                  col="start"
                  style="border-right: 0px; width: 0px;"/>
                <template v-for="(column, index) in columns">
                  <td
                    :key="index"
                    :col="index"
                    class="evui-head "
                    draggable="true"
                    @mouseup="sort(column, $event)"
                    @drag="test"
                    :style="{width: column.size}">
                    <div
                      class="evui-resizer"
                      name="0"
                      @mouseup.stop.prevent="resize(column,$event)"
                      :style="{ height: '25px', marginLeft: (parseInt(column.size)-4)+'px' }"/>
                    <div class="evui-col-header">
                      <div :ref="`${column.field}_sort`"/>
                      {{ column.caption }}
                    </div>
                  </td>
                </template>
                <td
                  class="evui-head evui-head-last"
                  col="end"
                  style="width: 17px;">
                  <div>&nbsp;</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          id="grid_grid_records"
          class="evui-grid-records"
          style="top: 25px; overflow-x: hidden; overflow-y: auto; left: 1px;">
          <table>
            <tbody>
              <tr line="0">
                <td
                  class="evui-grid-data evui-grid-data-spacer"
                  col="start"
                  style="height: 0px; width: 0px;"/>

                <template v-for="(column, index) in columns">
                  <td
                    :key="index"
                    class="evui-grid-data"
                    :col="index"
                    :style="{height: '0px', width: column.size}"/>
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

                  <template v-for="(col, colIndex) in columns">
                    <td
                      :key="colIndex"
                      :col="colIndex"
                      class="evui-grid-data "
                      style="">
                      <div
                        style="max-height: 24px;"
                        title="1">{{ row[col.field] }}
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
  </div>

</template>

<script>
  import '@/components/table/table2.css';
  import _ from 'lodash';

  export default {

    data() {
      return {
        columns: [
          { field: 'recid', caption: 'ID', size: '50px', sortable: true },
          // { field: 'fname', caption: 'First Name', size: '30%', sortable: true },
          // { field: 'lname', caption: 'Last Name', size: '30%', sortable: true },
          // { field: 'email', caption: 'Email', size: '40%' },
          { field: 'fname', caption: 'First Name', size: '169px', sortable: true },
          { field: 'lname', caption: 'Last Name', size: '168px', sortable: true },
          { field: 'email', caption: 'Email', size: '224px' },
          { field: 'sdate', caption: 'Start Date', size: '120px' },
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
      };
    },

    // 초기데이터는 다 생성시 정의해보자
    created() {
      // 소트 데이터 초기값을 기본 데이터롤 복사해서 넣어두자.
      // 얕은 복사 객체 내용은 안바뀔거 같아서 얕은 복사함.
      // 객체 안의 내용 바뀔거 같은면 깊은 복사로 변경 필요.
      // 일단 가즈아!!
      this.sortedData = this.records.slice();
      this.resultData = this.records.slice();
    },

    methods: {
      sort(column, event) {
        const sortTargelCls = this.$refs[`${column.field}_sort`][0].classList;

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
          sortTargelCls.add('evui-sort-up');
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
            sortTargelCls.add('evui-sort-up');
          } else {
            // 소트 된 컬럼을 눌렀을 경우 여기를 탄다.
            const direction = this.sortColumns[sortedColumnIndex].direction;

            // 먼저 ctrl 키 누르고 눌렀는지 확인해보자
            if (isMultiSort) {
              if (direction === 'asc') {
                // 내림차순으로 변경
                this.sortColumns[sortedColumnIndex].direction = 'desc';

                // 스타일을 입혀보자
                sortTargelCls.remove('evui-sort-up');
                sortTargelCls.add('evui-sort-down');
              } else {
                // desc 인경우 빼버림
                this.sortColumns.splice(sortedColumnIndex, 1);

                // sortcolumn 배열 크기가 0이면 소트 된게 없다
                if (this.sortColumns.length === 0) {
                  this.isSort = false;
                }

                // css 제거
                sortTargelCls.remove('evui-sort-down');
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
                sortTargelCls.remove('evui-sort-up');
                sortTargelCls.add('evui-sort-down');
              } else {
                // desc 인경우 빼버림
                this.sortColumns = [];

                // 소트 안된거임
                this.isSort = false;

                sortTargelCls.remove('evui-sort-down');
              }
              // 정렬 값을 resultData에 넣어주자
              this.resultData = _.cloneDeep(this.sortedData);
            }
          }
        }
      },
      resize() {
        // 리사이즈 이벤트  처리
      },
      test() {
        // 드래그 이벤트 처리
      },
    },
  };
</script>
