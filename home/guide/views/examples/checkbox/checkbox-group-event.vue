<template>
  <div class="outer">
    <div class="custom-event-demo">
      <div class="inner-event-demo">
        <h5># All Check Box</h5>
        <checkbox
          v-model="allChecked"
          :label="'all check'"
          :disabled="isDisabled"
          @on-change="handleModelList"
        />
        <checkbox-group
          :list="eventGroupList"
          v-model="modelList"
          :disabled="isDisabled"
          @on-change="changeAllChecked"
        />
        <h5># Disable All</h5>
        <Button
          text="change disabled"
          @click="changeDisabled"
        />
        <p>Selected List : {{ modelList }}</p>
      </div>
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';
  import Button from '@/components/button';

  export default {
    components: {
      checkbox,
      checkboxGroup,
      Button,
    },
    data() {
      return {
        allChecked: false,
        modelList: [],
        eventGroupList: [
          {
            label: 'map',
          },
          {
            label: 'reduce',
          },
          {
            label: 'slice',
          },
        ],
        isDisabled: false,
      };
    },
    methods: {
      handleModelList() {
        if (this.allChecked) {
          this.modelList = ['map', 'reduce', 'slice'];
        } else {
          this.modelList = [];
        }
      },
      changeAllChecked(data) {
        if (data.length === this.eventGroupList.length) {
          this.allChecked = true;
        } else {
          this.allChecked = false;
        }
      },
      changeDisabled() {
        this.isDisabled = !this.isDisabled;
      },
    },
  };
</script>
<style scoped>
  .inner-event-demo {
    padding-top: 2px;
    padding-left: 1px;
  }
  h5 {
    padding-top: 3px;
    padding-bottom: 3px;
  }
</style>
