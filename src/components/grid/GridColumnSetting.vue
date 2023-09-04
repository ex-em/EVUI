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
                :tooltip-title="column?.label ?? ''"
              />
            </ev-checkbox-group>
          </template>
          <template v-else>
            <p class="is-empty"> No records </p>
          </template>
        </div>
        <div class="ev-grid-column-setting__footer">
          <ev-button
            type="primary"
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
import { computed, inject, nextTick, onBeforeMount, reactive, ref, watch } from 'vue';

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

    const toolbarWrapperDiv = inject('toolbarWrapper');
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

    const initSearchValue = () => {
      searchVm.value = '';
      isSearch.value = false;
      searchColumnList.value.length = 0;
    };

    const initValue = () => {
      const columns = applyColumnList.value.length ? applyColumnList.value : originColumnList.value;
      checkColumnGroup.value = columns
        .filter(col => !col.checked)
        .map(col => col.label);
      initSearchValue();
    };
    const onApplyColumn = () => {
      applyColumnList.value = originColumnList.value
        .filter((col) => {
          if (checkColumnGroup.value.includes(col.label)) {
            if (col?.checked) {
              col.checked = false;
            }
            return true;
          }
          return false;
        });
      const checkedColumns = applyColumnList.value.map(col => col.text);

      emit('apply-column', checkedColumns);
      initSearchValue();
      isShowColumnSetting.value = false;
    };

    const setColumns = () => {
      originColumnList.value = props.columns
        .filter(col => !col.hide && col.caption)
        .map(col => ({
          label: col.caption,
          text: col.field,
          checked: col.hiddenDisplay,
        }));
      checkColumnGroup.value = originColumnList.value
        .filter(col => !col.checked)
        .map(col => col.label);
      applyColumnList.value.length = 0;
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
    }, { immediate: true, deep: true });

    watch(() => isShowColumnSetting.value, async () => {
      if (!isShowColumnSetting.value) {
        return;
      }
      await nextTick();

      const columnSettingWrapperRect = columnSettingWrapper.value?.getBoundingClientRect();
      const toolbarWrapperDivRect = toolbarWrapperDiv.value?.getBoundingClientRect();

      const columnSettingWidth = columnSettingWrapperRect?.width;
      const toolbarHeight = toolbarWrapperDivRect?.height;
      const columnSettingTop = toolbarWrapperDivRect?.top + document.documentElement.scrollTop;
      const columnSettingRight = toolbarWrapperDivRect?.right + document.documentElement.scrollLeft;

      columnSettingStyle.top = `${columnSettingTop + toolbarHeight}px`;
      columnSettingStyle.left = `${columnSettingRight - columnSettingWidth}px`;
    });

    watch(() => props.hiddenColumn, (value) => {
      const filterColumns = applyColumnList.value.length
        ? applyColumnList.value.filter(col => col.text !== value)
        : originColumnList.value.filter(col => (col.text !== value && !col.checked));

      applyColumnList.value = filterColumns;
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

<style lang="scss">
.ev-grid-column-setting {
  position: absolute;
  width: 180px;
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

  &__content {
    height: 120px;
    padding: 0 10px;
    border-top: 1px solid #CED4DA;
    border-bottom: 1px solid #CED4DA;
    overflow: auto;

    .ev-checkbox {
      display: block;
      padding: 10px 0;

      .ev-checkbox-label {
        width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .is-empty {
      height: 30px;
      text-align: center;
    }
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
