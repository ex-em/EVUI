<template>
  <div class="case">
    <ev-grid
      v-model:expanded="expandedRowsMV"
      :columns="columns"
      :rows="rows"
      :height="400"
      :option="{
        adjust: true,
        customContextMenu: menuItems,
        rowDetail: {
          use: useRowDetail,
        }
      }"
      @expand-row="onExpandRow"
      @resize-column="onResizeColumn"
    >
      <template #rowDetail="{ item }">
        <row-detail-content
          :data="item.row[2]"
        />
      </template>
    </ev-grid>
    <div class="description">
      <div class="form-rows">
        <span class="badge yellow">
          Use Row Detail
        </span>
        <ev-toggle
            v-model="useRowDetail"
        />
      </div>
      <div class="form-row">
        <span class="badge yellow">
          Expanded Row
        </span>
        <ev-text-field
          v-model="expandedRowText"
          type="textarea"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import RowDetailContent from './partitals/RowDetailContent.vue';

export default {
  components: {
    RowDetailContent,
  },
  setup() {
    const menuItems = ref([
      {
        text: 'Menu1',
        click: param => console.log(`[Menu1] Selected Row Data: ${param?.selectedRow}`),
      }, {
        text: 'Menu2',
        click: param => console.log('[Menu2]', param.contextmenuInfo),
      },
    ]);
    const columns = [
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
    const useRowDetail = ref(true);
    const expandedRowsMV = ref([]);
    const expandedRowText = ref('');
    const pushData = () => {
      const startIdx = rows.value.length + 1;

      for (let ix = startIdx; ix < startIdx + 30; ix++) {
        rows.value.push([
          `name-${ix}`,
          `column1-${ix}`,
          `column2-${ix}`,
          `column3-${ix}`,
          `column4-${ix}`,
        ]);
      }
    };
    const onExpandRow = () => {
      let result = '';
      expandedRowsMV.value.forEach((row) => {
        result += JSON.stringify(row);
      });
      expandedRowText.value = result;
    };
    const onResizeColumn = (columnInfo) => {
      console.log('[onResizeColumn]', columnInfo);
    };

    pushData();

    watch(useRowDetail, () => {
      onExpandRow();
    });

    return {
      menuItems,
      columns,
      rows,
      useRowDetail,
      expandedRowsMV,
      expandedRowText,
      onExpandRow,
      onResizeColumn,
    };
  },
};
</script>

<style lang="scss">
.description {
  .form-rows {
    display: flex;
    margin-bottom: 5px;
  }
  .ev-text-field, .ev-input-number, .ev-select {
    width: 80%;
  }
  .badge {
    margin-bottom: 2px;
    margin-right: 5px !important;
  }
  .ev-toggle {
    margin-right: 10px;
  }
}
</style>
