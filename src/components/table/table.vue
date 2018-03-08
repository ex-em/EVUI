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
                    :style="{width: column.size}">
                    <div
                      class="evui-resizer"
                      name="0"
                      style="height: 25px; margin-left: 46.0057px;"/>
                    <div class="evui-col-header  ">
                      <div class=""/>
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

              <template v-for="(row, rowIndex) in records">
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
          { recid: 14, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 15, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        ],
      };
    },
  };
</script>
