<template>
  <div class="case">
    <ev-tree-grid
      :columns="columns"
      :rows="tableData"
      :option="{
        useCheckbox: {
          use: useCheckboxMV.use,
          headerCheck: useCheckboxMV.headerCheck,
        },
      }"
    >
      <!-- renderer start -->
      <template #gridButton>
        <ev-button
          type="ghost"
          size="small"
          @click="onRowDelete"
        >
          Delete
        </ev-button>
        <ev-button
          size="small"
          @click="onRowEdit"
        >
          Edit
        </ev-button>
      </template>
      <template #check="{ item }">
        <ev-checkbox
          v-model="item.data[item.fieldName]"
          label="check"
          @click.stop=""
          @dblclick.stop=""
        />
      </template>
      <template #slide="{ item }">
        <ev-slider
          v-model="item.data[item.fieldName]"
          range
          readonly
          :mark="{
            33.33: 'W',
            66.66: 'C',
          }"
          :color="['#3C81F6', '#FADE4C', '#FF470E']"
          :show-tooltip="false"
        />
      </template>
      <template #custom="{ item }">
        <span
          :class="getStateClass(item.data[item.fieldName])"
        >
          <span class="v-chip__content"> {{ item.data[item.fieldName] }} </span>
        </span>
      </template>
      <template #inputNumber="{ item }">
        <ev-input-number
          v-model="item.data[item.fieldName]"
          :max="100"
          :min="0"
          @click.stop="onInputNumberClick"
          @dblclick.stop=""
        />
      </template>
    </ev-tree-grid>
  </div>
</template>
<script>
import { ref, reactive } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const useCheckboxMV = reactive({
      use: true,
      headerCheck: true,
    });
    const getData = () => {
      tableData.value = [{
        check: true,
        slide: [33.33, 66.66],
        inputNumber: 10,
        custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
        expand: true,
        children: [{
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          expand: false,
          children: [{
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
            expand: false,
            children: [{
              check: true,
              slide: [33.33, 66.66],
              inputNumber: 10,
              custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
              children: [{
                check: true,
                slide: [33.33, 66.66],
                inputNumber: 10,
                custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
                children: [{
                  check: true,
                  slide: [33.33, 66.66],
                  inputNumber: 10,
                  custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
                }],
              }],
            }, {
              check: true,
              slide: [33.33, 66.66],
              inputNumber: 10,
              custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
            }],
          }],
        }, {
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          children: [{
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }],
        }, {
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
        }],
      }];
    };
    const columns = ref([
      {
        caption: 'Check',
        field: 'check',
        type: 'boolean',
        width: 170,
      },
      {
        caption: 'Slide',
        field: 'slide',
        type: 'string',
        width: 120,
      },
      {
        caption: 'InputNumber',
        field: 'inputNumber',
        type: 'number',
        width: 120,
      },
      {
        caption: 'Custom',
        field: 'custom',
        type: 'string',
        width: 100,
      },
      {
        caption: '',
        field: 'gridButton',
        type: 'boolean',
        width: 120,
      },
    ]);
    const onInputNumberClick = () => {
      console.log('On click InputNumber');
    };
    const onRowDelete = () => {
      console.log('On click Delete');
    };
    const onRowEdit = () => {
      console.log('On click RowEdit');
    };
    const getStateClass = (value) => {
      let stateColor = 'green';
      if (value >= 70) {
        stateColor = 'yellow';
      } else if (value >= 50) {
        stateColor = 'red';
      }
      return {
        'v-chip': true,
        'v-size--default': true,
        [stateColor]: true,
      };
    };
    getData();
    return {
      columns,
      tableData,
      useCheckboxMV,
      onInputNumberClick,
      onRowDelete,
      onRowEdit,
      getStateClass,
    };
  },
};
</script>
<style lang="scss" scoped>
.description {
  min-width: 200px;
}
.form-rows {
  display: flex;
  margin-bottom: 5px;
}
.form-row {
  width: 50%;
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
.v-chip {
  display: inline-flex;
  position: relative;
  height: 32px;
  padding: 0 12px;
  align-items: center;
  cursor: default;
  color: #FFFFFF;
  line-height: 20px;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  text-decoration: none;
  transition-duration: .28s;
  transition-property: box-shadow, opacity;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 16px;
  font-size: 14px;

  &.green {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  &.yellow {
    background-color: #F7DF6A;
    border-color: #F7DF6A;
  }
  &.red {
    background-color: #FF4949;
    border-color: #FF4949;
  }
}
.v-chip .v-chip__content {
  display: inline-flex;
  height: 100%;
  align-items: center;
  max-width: 100%;
}
</style>
