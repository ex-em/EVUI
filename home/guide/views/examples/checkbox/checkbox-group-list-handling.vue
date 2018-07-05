<template>
  <div class="outer"/>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      checkbox,
      checkboxGroup,
    },
    data() {
      return {
        checkAll: false,
        isDisabled: true,
        groupName: [
          {
            name: 'apple',
          },
          {
            name: 'orange',
          },
          {
            name: 'banana',
          },
        ],
        itemNameList: [],
        groupNameAnother: [
          {
            name: 'map',
          },
          {
            name: 'reduce',
          },
          {
            name: 'slice',
          },
        ],
        itemNameListAnother: [],
        groupNameTheOhter: [
          {
            name: 'cheese',
          },
          {
            name: 'ham',
          },
          {
            name: 'egg',
          },
        ],
        itemNameListTheOhter: ['cheese', 'ham'],
      };
    },
    methods: {
      handleCheckAll() {
        if (this.checkAll) {
          this.itemNameListAnother = ['map', 'reduce', 'slice'];
        } else {
          this.itemNameListAnother = [];
        }
      },
      checkAllGroupChange(data) {
        if (data.length === this.groupNameAnother.length) {
          this.checkAll = true;
        } else {
          this.checkAll = false;
        }
      },
      clickEvent() {
        this.isDisabled = !this.isDisabled;
      },
    },
  };
</script>
<style scoped>
  .group-slot-demo {
    width: 300px;
    display: inline-block;
  }
  .group-list-demo {
    width: 300px;
    display: inline-block;
  }
</style>
