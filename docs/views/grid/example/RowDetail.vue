<template>
  <div class="case">
    <ev-grid
      :columns="columns"
      :rows="rows"
      :height="400"
      :option="{
        adjust: true,
      }"
    >
      <!-- cell renderer slot -->
      <template #toggle="{ item }">
        <div
          class="toggle-wrapper"
          @click="expendedRowDetail(item.row)"
        >
          <ev-icon
            icon="ev-icon-s-play"
            :class="{
              toggle: true,
              expended: item.row[2][0],
            }"
          />
        </div>
      </template>

      <!-- expended row slot -->
      <template #rowDetail="{ item }">
        <div class="row-detail-wrapper">
          <row-detail-content
            v-if="item.row[2][0]"
            :data="item.row[2]"
          />
        </div>
      </template>
    </ev-grid>
  </div>
</template>

<script>
import { ref } from 'vue';
import RowDetailContent from './partitals/RowDetailContent.vue';

export default {
  components: {
    RowDetailContent,
  },
  setup() {
    const columns = [
      {
        caption: '', field: 'toggle', type: 'boolean', width: 80,
      },
      {
        caption: 'Name', field: 'name', type: 'string',
      },
      {
        caption: 'Column1', field: 'column1', type: 'string',
      },
      {
        caption: 'Column2', field: 'column2', type: 'string',
      },
      {
        caption: 'Column3', field: 'column3', type: 'string',
      },
      {
        caption: 'Column4', field: 'column4', type: 'string', width: 100,
      },
    ];
    const rows = ref([]);


    const pushData = () => {
      const startIdx = rows.value.length + 1;

      for (let ix = startIdx; ix < startIdx + 30; ix++) {
        rows.value.push([
          (ix === 1),
          `name-${ix}`,
          `column1-${ix}`,
          `column2-${ix}`,
          `column3-${ix}`,
          `column4-${ix}`,
        ]);
      }
    };
    const expendedRowDetail = (row) => {
      const idx = row[0];
      rows.value[idx][0] = !rows.value[idx][0];
    };

    pushData();

    return {
      columns,
      rows,
      expendedRowDetail,
    };
  },
};
</script>

<style lang="scss">
@import '../../../style/index.scss';

.toggle-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
.toggle {
  transition: transform $animate-fast;
  &.expended {
    transform: rotate(90deg);
  }
}
</style>
