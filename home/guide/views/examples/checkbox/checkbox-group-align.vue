<template>
  <div class="outer">
    <div class="box-demo">
      <h5># V-Box</h5>
      <checkbox-group
        :list="groupName"
        :group-align="'vbox'"
        v-model="itemNameList"
      />
      <h5># H-Box</h5>
      <checkbox-group
        :list="groupName"
        v-model="itemNameList"
      />
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      checkbox,
      checkboxGroup,
    },
    data() {
      return {
        groupName: [
          {
            label: 'Mac Book Pro',
          },
          {
            label: 'Mac Pro',
          },
          {
            label: 'Mac Book Air',
          },
        ],
        itemNameList: ['Mac Book Pro', 'Mac Pro'],
      };
    },
  };
</script>
<style scoped>
  .box-demo {
    padding-top: 2px;
    padding-left: 1px;
  }
  h5 {
    padding-top: 3px;
    padding-bottom: 3px;
  }
</style>
