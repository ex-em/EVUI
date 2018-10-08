<template>
  <div style="width:100%">
    <ev-tree-table
      ref="test"
      :width="'1000px'"
      :height="'350px'"
      :columns="columns"
      :records="rowData"
      :elbow="true"
    />
  </div>
</template>

<script>
  import _ from 'lodash';
  import util from 'main/commons/util';
  import packet from './packet.json';

  export default {
    data() {
      return {
        columns: [
          { field: 'class_name', caption: '클래스', size: '400px' },
          { field: 'method_name', caption: '메소드', size: '300px' },
          { field: 'error_count', caption: '예외(에러) 발생 건수', size: '120px' },
          { field: 'exec_count', caption: '실행 건수', size: '100px' },
          { field: 'elapse_time', caption: '수행 시간', size: '100px' },
          { field: 'elapse_ratio', caption: '수행 시간 백분율', size: '100px' },
          { field: 'method_type', caption: '메소드 유형', size: '100px' },
        ],
        field: [
          'level',
          'was_id',
          'was_name',
          'method_id',
          'crc',
          'class_name',
          'method_name',
          'calling_method_id',
          'calling_crc',
          'error_count',
          'exec_count',
          'elapse_time',
          'elapse_ratio',
          'method_type',
          'method_seq',
          'level_id',
          'host_name',
          'tid',
          'cpu_time',
          'parameter',
          'time',
          'elapse_time_us',
          'ext_seq',
        ],
        packetData: packet,
        rowData: [],
      };
    },
    created() {
      const rowList = [];
      for (let ix = 0, ixLen = this.packetData.length; ix < ixLen; ix++) {
        rowList.push(_.zipObject(this.field, this.packetData[ix]));
      }
      this.rowData = util.arrayToTree(rowList);
    },
  };
</script>
