<template>
  <div class="case">
    <ev-grid
      :columns="columns"
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
              width: `${(item.row[2][3].toTime - item.row[2][3].fromTime) / totalRenderSec * 100}%`,
              left: `${item.row[2][3].fromTime / totalRenderSec * 100}%`,
            }"
          />
        </div>
      </template>
    </ev-grid>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const columns = ref([
      { caption: 'Name', field: 'userName', type: 'string', width: 80, fixed: true },
      { caption: 'number', field: 'number', type: 'number', width: 80 },
      { caption: 'boolean', field: 'boolean', type: 'boolean', width: 80 },
      { caption: '', field: 'customCell', type: 'string', width: 300, customHeader: true },
    ]);
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
    let initSec = 0;
    const getData = (count, startIndex) => {
      const temp = [];
      const booleans = [true, false];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        const fromAccTime = !ix ? 0 : Math.floor(Math.random() * 200);
        const fromTimeRange = initSec + fromAccTime;
        let fromRenderTime;
        if (fromTimeRange > totalRenderSec) {
          fromRenderTime = totalRenderSec;
          initSec = totalRenderSec;
        } else {
          initSec = fromTimeRange;
          fromRenderTime = fromTimeRange;
        }
        const toAccTime = Math.floor(Math.random() * 4000);
        const toTimeRange = fromRenderTime + toAccTime;
        const toRenderTime = toTimeRange > totalRenderSec ? totalRenderSec : toTimeRange;
        temp.push([
          `user_${ix + 1}`,
          ix,
          booleans[ix % 2],
          {
            fromTime: fromRenderTime,
            toTime: toRenderTime,
          },
        ]);
      }
      return temp;
    };

    tableData.value = getData(20, 0);

    return {
      columns,
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
  padding: 0;
  & > div {
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
