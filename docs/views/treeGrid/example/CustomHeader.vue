<template>
  <div class="case">
    <ev-tree-grid
      :columns="gridColumns"
      :rows="tableData"
      :height="400"
      :option="{
        adjust: true,
      }"
    >
      <template #customHeader>
        <div class="grid-custom-header">
          <div
            v-for="item in customHeaderData"
            :key="item.type"
            :style="{
              left: `${item.fromTime / totalRenderSec * 100}%`,
              width: `${(item.toTime - item.fromTime) / totalRenderSec * 100}%`,
              backgroundColor: item.color
            }"
            :class="`grid-custom-header__content grid-custom-header__content--${item.type}`"
          />
        </div>
      </template>
      <template #customCell="{ item }">
        <div class="grid-custom-cell">
          <div
            class="grid-custom-cell__content"
            :style="{
              width: `${(item.data.customCell.toTime - item.data.customCell.fromTime) / totalRenderSec * 100}%`,
              left: `${item.data.customCell.fromTime / totalRenderSec * 100}%`,
            }"
          />
        </div>
      </template>
    </ev-tree-grid>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const totalRenderSec = 5000;
    const customHeaderData = [
      {
        type: 'attr1',
        color: '#00BEB8',
        fromTime: 0,
        toTime: 894,
      },
      {
        type: 'attr2',
        color: '#C02CD3',
        fromTime: 895,
        toTime: 1031,
      },
      {
        type: 'attr3',
        color: '#0273D7',
        fromTime: 1032,
        toTime: 1246,
      },
      {
        type: 'attr4',
        color: '#6DD790',
        fromTime: 1247,
        toTime: 1832,
      },
      {
        type: 'attr5',
        color: '#FFC032',
        fromTime: 3703,
        toTime: totalRenderSec,
      },
    ];
    const getData = () => {
      tableData.value = [
        {
          id: 'Exem 0',
          date: '2016-05-01',
          name: '1111',
          customCell: {
            fromTime: 0,
            toTime: 125,
          },
          expand: true,
        },
        {
          id: 'Exem 1',
          date: '2016-05-01',
          name: '2222',
          value: 123,
          customCell: {
            fromTime: 13,
            toTime: 2152,
          },
          expand: true,
          children: [{
            id: 'Exem 2',
            date: '2016-05-02',
            name: '2',
            value: 222,
            customCell: {
              fromTime: 13,
              toTime: 1879,
            },
            expand: false,
            children: [{
              id: 'Exem 3',
              date: '2016-05-02',
              name: '3',
              value: 3333,
              customCell: {
                fromTime: 13,
                toTime: 871,
              },
              uncheckable: true,
            }, {
              id: 'Exem 4',
              date: '2016-05-02',
              name: '4',
              customCell: {
                fromTime: 37,
                toTime: 529,
              },
              expand: false,
              uncheckable: true,
              children: [{
                id: 'Exem 5',
                date: '2016-05-02',
                name: '5',
                customCell: {
                  fromTime: 37,
                  toTime: 476,
                },
                children: [{
                  id: 'Exem 51',
                  date: '2016-05-02',
                  name: '1251',
                  customCell: {
                    fromTime: 37,
                    toTime: 378,
                  },
                  children: [{
                    id: 'Exem 52',
                    date: '2016-05-02',
                    name: '20000',
                    customCell: {
                      fromTime: 186,
                      toTime: 476,
                    },
                  }],
                }],
              }, {
                id: 'Exem 6',
                date: '2016-05-02',
                name: '6',
                customCell: {
                  fromTime: 317,
                  toTime: 529,
                },
              }],
            }],
          }, {
            id: 'Exem 7',
            date: '2016-05-03',
            name: '7',
            customCell: {
              fromTime: 487,
              toTime: 3474,
            },
            children: [{
              id: 'Exem 8',
              date: '2016-05-03',
              name: '8',
              value: 333,
              customCell: {
                fromTime: 487,
                toTime: 1951,
              },
            }, {
              id: 'Exem 9',
              date: '2016-05-03',
              name: '9',
              customCell: {
                fromTime: 762,
                toTime: 2145,
              },
            }, {
              id: 'Exem 10',
              date: '2016-05-03',
              name: '10',
              customCell: {
                fromTime: 861,
                toTime: 2368,
              },
            }],
          }, {
            id: 'Exem 11',
            date: '2016-05-04',
            name: '11',
            customCell: {
              fromTime: 2384,
              toTime: 3474,
            },
          }],
        },
      ];
    };
    const gridColumns = ref([
      { caption: 'ID', field: 'id', type: 'number' },
      { caption: 'Date', field: 'date', type: 'string' },
      {
        caption: 'Name',
        field: 'name',
        type: 'float',
        summaryType: 'sum',
        summaryOnlyTopParent: true,
        summaryRenderer: 'Sum: {0} 최상위 부모만 summary',
        decimal: 1,
      },
      {
        caption: 'Value',
        field: 'value',
        type: 'number',
        summaryType: 'sum',
        summaryRenderer: 'Sum: {0} 모든 row summary',
        decimal: 1,
      },
      { caption: 't', field: 'customCell', type: 'string', width: 300, customHeader: true },
    ]);

    getData();
    return {
      gridColumns,
      tableData,
      customHeaderData,
      totalRenderSec,
    };
  },
};
</script>

<style lang="scss" scoped>
.grid-custom-header {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #EEEEEE;
  &__content {
    position: absolute;
    height: 100%;
  }
}
:deep(.customCell) {
  padding: 0 !important;
  & > div {
    height: 100%;
  }
  .td-content {
    height: 100%;
  }
}
.grid-custom-cell {
  position: relative;
  width: 100%;
  height: 100%;
  &__content {
    position: absolute;
    height: 100%;
    background-color: #087AED;
  }
}
</style>
