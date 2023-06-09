<template>
  <template v-if="isShowColumnSetting">
    <teleport to="#ev-grid-column-setting-modal">
      <section
        ref="columnSettingWrapper"
        v-clickoutside="hideColumnSetting"
        class="ev-grid-column-setting"
        :style="columnSettingStyle"
      >
        <div class="ev-grid-column-setting__header">
          <p class="header-title"> Column List </p>
          <ev-text-field
            v-model="searchVm"
            type="search"
            placeholder="Search"
            @input="onSearchColumn"
          />
        </div>
        <div class="ev-grid-column-setting-line" />
        <div class="ev-grid-column-setting__content">
          <template v-if="columnList.length">
            <ev-checkbox-group
              v-model="checkColumnGroup"
              @change="onCheckColumn"
            >
              <ev-checkbox
                v-for="(column, idx) in columnList"
                :key="`column_${idx}`"
                :label="column?.label"
              />
            </ev-checkbox-group>
          </template>
          <template v-else>
            <p class="is-empty"> No records </p>
          </template>
        </div>
        <div class="ev-grid-column-setting-line" />
        <div class="ev-grid-column-setting__footer">
          <ev-button
            type="primary"
            size="small"
            :disabled="isDisabled"
            @click="onApplyColumn"
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
import { computed, inject, nextTick, onBeforeMount, reactive, ref, watch, watchEffect } from 'vue';

export default {
  name: 'EVGridColumnSetting',
  directives: {
    clickoutside,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: [Array],
      default: () => [],
    },
    hiddenColumn: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update:isShow': null,
    'apply-column': null,
  },
  setup(props, { emit }) {
    const isShowColumnSetting = computed({
      get: () => props.isShow,
      set: val => emit('update:isShow', val),
    });

    const columnSettingWrapper = ref(null);
    const searchVm = ref('');
    const isSearch = ref(false);
    const checkColumnGroup = ref([]);
    const originColumnList = ref([]);
    const searchColumnList = ref([]);
    const applyColumnList = ref([]);
    const columnList = computed(() => (isSearch.value
      ? searchColumnList.value : originColumnList.value));
    const isDisabled = computed(() => !columnList.value.length);

    let timer = null;
    let lastCheckedColumn = null;

    const columnSettingIcon = inject('columnSettingIcon');
    const columnSettingStyle = reactive({
      top: null,
      left: null,
    });

    const onCheckColumn = (columns) => {
      if (columns?.length === 1) {
        lastCheckedColumn = columns[0];
      } else if (columns?.length < 1 && lastCheckedColumn !== null) { // 최소 한개 컬럼은 선택되도록
        checkColumnGroup.value.push(lastCheckedColumn);
      }
    };

    const onSearchColumn = (searchWord) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        isSearch.value = false;

        if (searchWord) {
          const lowerCasedSearchWord = searchWord.toString().toLowerCase();
          searchColumnList.value = originColumnList.value.filter((column) => {
            const columnName = column.label.toString().toLowerCase();
            return columnName.includes(lowerCasedSearchWord);
          });

          isSearch.value = true;
        }
      }, 500);
    };

    const onApplyColumn = () => {
      applyColumnList.value = columnList.value
        .filter(col => checkColumnGroup.value.includes(col.label));
      const checkedColumns = applyColumnList.value.map(col => col.text);

      emit('apply-column', checkedColumns);
      isShowColumnSetting.value = false;
    };

    const setColumns = () => {
      originColumnList.value = props.columns
        .filter(col => !col.hide && col.caption)
        .map(col => ({
          label: col.caption,
          text: col.field,
        }));

      checkColumnGroup.value = originColumnList.value?.map(col => col.label) || [];
    };

    const initValue = () => {
      const columns = applyColumnList.value.length ? applyColumnList.value : originColumnList.value;
      checkColumnGroup.value = columns.map(col => col.label || []);

      searchVm.value = '';
      isSearch.value = false;
      searchColumnList.value.length = 0;
    };

    const hideColumnSetting = () => {
      isShowColumnSetting.value = false;
      initValue();
    };

    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-grid-column-setting-modal';
      root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      const hasRoot = document.getElementById('ev-grid-column-setting-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };

    onBeforeMount(() => initWrapperDiv());

    watch(() => props.columns, () => {
      setColumns();
    }, { immediate: true });

    watchEffect(async () => {
      if (!isShowColumnSetting.value) {
        return;
      }
      await nextTick();

      const columnSettingWrapperRect = columnSettingWrapper.value?.getBoundingClientRect();
      const columnSettingIconRect = columnSettingIcon.value?.getBoundingClientRect();
      const COLUMN_SETTING_WIDTH = columnSettingWrapperRect?.width;
      const COLUMN_SETTING_ICON_SIZE = columnSettingIconRect?.width;
      const top = columnSettingIcon.value?.offsetTop;
      const left = columnSettingIcon.value?.offsetLeft;

      if (COLUMN_SETTING_WIDTH && COLUMN_SETTING_ICON_SIZE && top && left) {
        columnSettingStyle.top = `${top + (COLUMN_SETTING_ICON_SIZE + 5)}px`;
        columnSettingStyle.left = `${left - (COLUMN_SETTING_WIDTH - COLUMN_SETTING_ICON_SIZE)}px`;
      }
    });

    watch(() => props.hiddenColumn, (value) => {
      let filterColumns = [];

      if (applyColumnList.value.length) {
        filterColumns = applyColumnList.value.filter(col => col.text !== value);
      } else {
        filterColumns = originColumnList.value.filter(col => col.text !== value);
        applyColumnList.value = filterColumns;
      }
      checkColumnGroup.value = filterColumns.map(col => col.label);
    });

    return {
      columnSettingWrapper,
      columnSettingStyle,
      isShowColumnSetting,
      checkColumnGroup,
      columnList,
      searchVm,
      isDisabled,
      onSearchColumn,
      onApplyColumn,
      onCheckColumn,
      hideColumnSetting,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'style/grid.scss';
.ev-grid-column-setting {
  position: absolute;
  width: 180px;
  border: 1px solid #D0D0D0;
  background: #FFFFFF;
  font-size: 12px;
  &__header {
    padding: 10px;

    .ev-text-field {
      margin-top: 10px;
    }
  }

  &__content {
    height: 100px;
    padding: 5px 10px;
    overflow: auto;

    .ev-checkbox {
      display: block;
      padding: 5px 0;
    }
  }

  &__footer {
    display: flex;
    padding: 5px 10px;

    .ev-button {
      margin-left: auto;
    }
  }

  &-line {
    border: 1px solid #D0D0D0;
  }
}
</style>
