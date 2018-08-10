<template>
  <div class="evui-table-filter">
    <div class="evui-table-filter-body">
      <div
        style="height: 20px;"
      >
        <input
          v-model="andOrCondition"
          type="radio"
          value="and"
        >
        <label> AND </label>
        <input
          v-model="andOrCondition"
          type="radio"
          value="or"
        >
        <label> OR </label>
        <div style="float:right">
          <button
            ref="addButton"
            disabled="true"
            @click="addButton"
          >
            Add Condition
          </button>
        </div>
      </div>
      <div
        v-for="(item, index) in filterDataList"
        :key="index"
        style="margin:3px;"
      >
        <select
          v-model="item.condition"
          @change="changeCondition"
        >
          <option
            v-for="item in condition"
            :value="item.value"
            :key="item.value"
          >
            {{ item.name }}
          </option>
        </select>
        <input
          v-model="item.text"
          type="text"
          style="width:120px;"
          @focus="focusTextbox(index, $event.target.value)"
          @input="changeFilterValue(index, $event.target.value)"
        >
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash';

  export default {
    props: {
      filterCondition: {
        type: Array,
        default() {
          return [];
        },
      },
      field: {
        type: String,
        default: '', // 수정 필요 테스트
      },
    },
    data() {
      return {
        condition: [
          { name: 'Equal', value: 'equal' },
          { name: 'Not equal', value: 'notEqual' },
          { name: 'Like', value: 'like' },
          { name: 'Not Like', value: 'notLike' },
        ],
        filterDataList: [{
          condition: 'equal',
          text: '',
        }],
        firstFilterData: {
          index: 0,
          condition: 'equal',
          text: '',
        },
        secondFilterData: {
          index: 1,
          condition: 'equal',
          text: '',
        },
        andOrCondition: 'and',
        resultFilteredData: [],
        exText: '',
        nullValueCnt: 1,
      };
    },
    watch: {
      field() {
        if (this.filterCondition.length === 0) {
          this.filterDataList = [{
            condition: 'equal',
            text: '',
          }];
        } else {
          this.filterDataList = this.filterCondition;
        }
      },
    },
    methods: {
      changeFilterValue(index, value) {
        if (this.exText === value) {
          return;
        }
        if (this.changeTimeout) {
          clearTimeout(this.changeTimeout);
        }
        this.exText = value;
        this.filterDataList[index].text = value;
        this.nullValueCnt = _.filter(this.filterDataList, data => data.text === '').length;

        if (this.nullValueCnt === 0) {
          this.$refs.addButton.disabled = false;
        } else {
          this.$refs.addButton.disabled = true;
        }

        const result = {
          field: this.field,
          andOrCondition: this.andOrCondition,
          data: this.filterDataList,
          nullValueCnt: this.nullValueCnt,
        };

        this.changeTimeout = setTimeout(() => {
          this.$emit('change', result);
        }, 200);
      },
      addButton() {
        this.filterDataList.push({
          condition: 'equal',
          text: '',
        });
        this.$refs.addButton.disabled = true;
      },
      changeCondition() {
        const result = {
          field: this.field,
          andOrCondition: this.andOrCondition,
          data: this.filterDataList,
          nullValueCnt: this.nullValueCnt,
        };

        this.$emit('change', result);
      },
      focusTextbox(index, value) {
        this.exText = value;
      },
    },
  };
</script>
<style scoped>
  .evui-table-filter-body,  .evui-table-filter-body select, .evui-table-filter-body input{
    font-family: Verdana, Arial, sans-serif;
    font-size: 11px;
  }
</style>>
