<template>
  <div class="evui-table-filter">
    <div class="evui-table-filter-body">
      <select
        v-model="firstFilterData.condition"
        @change="changeFilterValue(firstFilterData.index)"
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
        v-model="firstFilterData.text"
        type="text"
        @input="changeFilterValue($event, firstFilterData.index)"
      >
      <div>
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
        <div>
          <select v-model="secondFilterData.condition">
            <option
              v-for="item in condition"
              :value="item.value"
              :key="item.value"
            >
              {{ item.name }}
            </option>
          </select>
          <input
            v-model="secondFilterData.text"
            type="text"
            @input="changeFilterValue($event, secondFilterData.index)"
          >
          {{ field }}
        </div>
      </div>
    </div>
    <div class="evui-table-filter-foot">
      <div style="float:right">
        <button>Clear Filter</button>
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
        filterDataList: [],
        initFilterCondition: this.filterCondition,
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
      };
    },
    watch: {
      field() {
        if (this.filterCondition.length === 0) {
          for (let ix = 0, ixLen = this.resultFilteredData.length; ix < ixLen; ix++) {
            this.resultFilteredData[ix].text = '';
            this.resultFilteredData[ix].condition = 'equal';
          }
        } else {
          for (let ix = 0, ixLen = this.resultFilteredData.length; ix < ixLen; ix++) {
            this.resultFilteredData[ix].text = '';
            this.resultFilteredData[ix].condition = 'equal';
          }
          for (let jx = 0, jxLen = this.filterCondition.length; jx < jxLen; jx++) {
            const index = this.filterCondition[jx].index;
            this.resultFilteredData[index].text = this.filterCondition[jx].text;
            this.resultFilteredData[index].condition = this.filterCondition[jx].condition;
          }
        }
      },
    },
    created() {
      if (this.filterCondition.length > 0) {
        this.firstFilterData = this.filterCondition[0];
        this.filterDataList = this.filterCondition.slice(1);
      }
      this.filterDataList.push(this.firstFilterData);
      this.filterDataList.push(this.secondFilterData);
    },
    mounted() {
    },
    methods: {
      changeFilterValue(e, index) {
        if (e.target.value === '') {
          _.remove(this.resultFilteredData, data => data.index === index);
        } else {
          const data = [this.filterDataList[index]];
          this.resultFilteredData = _.unionWith(this.resultFilteredData, data, _.isEqual);
        }

        const result = {
          field: this.field,
          data: this.resultFilteredData,
        };


        // result.data = this.resultFilteredData;
        this.$emit('change', result);
      },
      // changeComboBox() {
      //
      // },
    },
  };
</script>
