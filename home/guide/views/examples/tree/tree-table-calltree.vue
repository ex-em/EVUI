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
      this.rowData = this.arrayToTree(rowList);
    },
    methods: {
      arrayToTree(data) {
        const result = [];
        this.createTree(data, result, 0, 0, 0);
        return result;
      },
      createTree(data, result, index, preLvl, parentList, endResult) {
        if (index === data.length) {
          return;
        }
        let resultList = result;
        let parentArray = parentList;
        const lvl = data[index].level - 1;
        if (index === 0) {
          resultList.push({
            children: [],
            expend: null,
            data: data[index],
          });
          this.createTree(data, resultList, index + 1, lvl, [0], resultList);
        } else if (preLvl === lvl) {
          let parentIndex;
          resultList = endResult;
          for (let ix = 0, ixLen = lvl; ix < ixLen; ix++) {
            parentIndex = parentArray[ix];
            resultList = resultList[parentIndex].children;
          }
          resultList.push({
            children: [],
            expend: null,
            data: data[index],
          });
          const temp = parentArray[lvl] + 1;
          parentArray[lvl] = temp;
          parentArray = parentArray.slice(0, lvl + 1);

          this.createTree(data, resultList,
            index + 1, lvl, parentArray, endResult);
        }
        if (preLvl < lvl) {
          const parentIndex = parentArray[preLvl];
          if (!parentArray[lvl]) {
            parentArray.push(0);
          } else {
            // parentArray = parentArray.slice(0, lvl);
            parentArray.push(0);
          }

          resultList[parentIndex].expend = true;
          resultList[parentIndex].children.push({
            children: [],
            expend: null,
            data: data[index],
          });
          this.createTree(data, resultList[parentIndex].children,
            index + 1, lvl, parentArray, endResult);
        }
        if (preLvl > lvl) {
          let parentIndex;
          resultList = endResult;
          for (let ix = 0, ixLen = lvl; ix < ixLen; ix++) {
            parentIndex = parentArray[ix];
            resultList = resultList[parentIndex].children;
          }
          resultList.push({
            children: [],
            expend: null,
            data: data[index],
          });
          const temp = parentArray[lvl] + 1;
          parentArray[lvl] = temp;
          parentArray = parentArray.slice(0, lvl + 1);
          this.createTree(data, resultList,
            index + 1, lvl, parentArray, endResult);
        }
      },
    },
  };
</script>
