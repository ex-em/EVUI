<template>
  <template v-if="isShowFilterSetting">
    <teleport to="#ev-grid-column-setting-modal">
      <section
        v-clickoutside="() => { isShowFilterSetting = false }"
        class="ev-grid-filter-setting"
        :style="{
          top: $props.position.top,
          left: $props.position.left,
        }"
      >
        <div class="ev-grid-filter-setting__header">
          <ev-icon icon="ev-icon-filter-list"></ev-icon>
          <span class="header-title"> Filter ({{$props.column.caption}}) </span>
        </div>
        <div class="ev-grid-filter-setting__content">
          <div
            v-for="(item, idx) in filteringItems"
            :key="idx"
            class="ev-grid-filter-setting__row">
            <ev-select
              v-model="item.operator"
              class="ev-grid-filter-setting__row--operator"
              :items="items1"
              :disabled="idx > 1"
              :style="{
                visibility: idx > 0 ? 'visible' : 'hidden',
              }"
              @change="changeOperator"
            />
            <ev-select
              v-model="item.comparison"
              class="ev-grid-filter-setting__row--comparison"
              :items="items2"
            />
            <ev-text-field
              v-model="item.value"
              class="ev-grid-filter-setting__row--value"
            />
            <div
              class="ev-grid-filter-setting__row--button"
            >
              <ev-icon
                icon="ev-icon-trash2"
                @click="removeRow(idx)"
              />
            </div>
          </div>
          <div class="ev-grid-filter-setting__row--button add">
            <ev-icon
              icon="ev-icon-add"
              @click="addRow"
            />
          </div>
        </div>
        <div class="ev-grid-filter-setting__footer">
          <ev-button
            type="primary"
            @click="applyFiltering"
          >
            OK
          </ev-button>
        </div>
      </section>
    </teleport>
  </template>
</template>

<script>
import { clickoutside } from '@/directives/clickoutside';
import { computed, ref, watch } from 'vue';

export default {
  name: 'EVGridFilterSetting',
  directives: {
    clickoutside,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object,
      default: () => ({
        top: 0,
        left: 0,
      }),
    },
    column: {
      type: Object,
      default: () => ({}),
    },
    items: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: {
    'update:isShow': null,
    'apply-filtering': null,
  },
  setup(props, { emit }) {
    const filteringItems = ref([]);
    const columnField = computed(() => props.column?.field);
    const items1 = [
      { name: 'AND', value: 'and' },
      { name: 'OR', value: 'or' },
    ];
    const numberItems = [
      { name: '=', value: '=' },
      { name: '!=', value: '!=' },
      { name: '<', value: '<' },
      { name: '>', value: '>' },
      { name: '<=', value: '<=' },
      { name: '>=', value: '>=' },
    ];
    const stringItems = [
      { name: 's%', value: 's%' }, // starts with
      { name: '%s', value: '%s' }, // ends with
      { name: '%s%', value: '%s%' }, // contains
      { name: 'Not Like', value: 'notLike' }, // does not contains
      { name: '=', value: '=' }, // is
      { name: '!=', value: '!=' }, // is not
    ];
    const getComparisonItems = (columnType) => {
      if (columnType === 'string' || columnType === 'stringNumber') {
        return stringItems;
      } else if (columnType === 'number' || columnType === 'float') {
        return numberItems;
      } else if (columnType === 'boolean') {
        return [
          { name: '=', value: '=' },
        ];
      }
      return [];
    };
    const items2 = computed(() => getComparisonItems(props.column.type));
    const isShowFilterSetting = computed({
      get: () => props.isShow,
      set: val => emit('update:isShow', val),
    });
    const addRow = () => {
      const operator = filteringItems.value.length > 2 ? filteringItems.value[2].operator : 'and';
      filteringItems.value.push({
        comparison: '=',
        operator,
        value: '',
      });
    };
    const removeRow = (idx) => {
      if (filteringItems.value.length > 1) {
        filteringItems.value.splice(idx, 1);
      } else if (idx === 0) {
        filteringItems.value[0].value = '';
      }
    };
    const changeOperator = (val) => {
      filteringItems.value = filteringItems.value.map(item => ({ ...item, operator: val }));
    };
    const applyFiltering = () => {
      emit(
        'apply-filtering',
        columnField.value,
        filteringItems.value.filter(item => item.value),
      );
    };
    watch(
      () => props.isShow,
      (isShow) => {
        const rowList = [];
        if (isShow && columnField.value) {
          if (!props.items[columnField.value]?.length) {
            rowList.push({
              comparison: '=',
              operator: 'and',
              value: '',
            });
          } else {
            props.items[columnField.value].forEach((row) => {
              rowList.push(row);
            });
          }
          filteringItems.value = rowList;
        }
      },
    );

    return {
      filteringItems,
      isShowFilterSetting,
      items1,
      items2,
      addRow,
      removeRow,
      changeOperator,
      applyFiltering,
    };
  },
};
</script>

<style lang="scss">
.ev-grid-filter-setting {
  position: absolute;
  width: auto;
  border: 1px solid #D0D0D0;
  background: #FFFFFF;
  font-size: 12px;
  z-index: 1;
  &__header {
    padding: 10px;

    .ev-text-field {
      margin-top: 10px;
    }
  }
  &__row {
    display: flex;
    width: 100%;
    padding: 6px 0;
    gap: 5px;
    .ev-select__wrapper {
      width: inherit;
    }
    &--operator {
      width: 80px;
    }
    &--comparison {
      width: 120px;
    }
    &--value {
      width: 120px;
    }
    &--button {
      display: flex;
      justify-content: center;
      align-items: center;
      &.add {
        padding: 6px 0;
        justify-content: end;
      }
      i {
        font-size: 22px;
        margin-left: 8px;
        &:hover {
          opacity: 0.6;
          cursor: pointer;
        }
      }
    }
  }
  &__content {
    padding: 0 10px;
    border-top: 1px solid #CED4DA;
    border-bottom: 1px solid #CED4DA;
  }

  &__footer {
    display: flex;
    padding: 5px 10px;

    .ev-button {
      margin-left: auto;
    }
  }
}
</style>
