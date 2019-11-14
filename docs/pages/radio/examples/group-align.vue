<template>
  <div class="outer">
    <div class="box-demo">
      <h5># V-Box</h5>
      <radio-group
        :list="groupName"
        :group-align="'vbox'"
        v-model="selectedItem"
      />
      <h5># H-Box</h5>
      <radio-group
        :list="groupName"
        v-model="selectedItem"
      />
    </div>
  </div>
</template>
<script>
  import radio from '@/components/radio/radio';
  import radioGroup from '@/components/radio/radio-group';

  export default {
    components: {
      radio,
      radioGroup,
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
        selectedItem: 'Mac Book Pro',
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
