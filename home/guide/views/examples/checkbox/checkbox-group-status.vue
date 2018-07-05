<template>
  <div class="outer">
    <div class="group-demo">
      <h5># Disable Items</h5>
      <checkbox-group
        v-model="itemNameList"
      >
        <checkbox
          :label="groupName[0].name"
        />
        <checkbox
          :label="groupName[1].name"
        />
        <checkbox
          :label="groupName[2].name"
          :disabled="true"
        />
        <checkbox
          :label="groupName[3].name"
        />
        <checkbox
          :label="groupName[4].name"
          :disabled="true"
        />
      </checkbox-group>
      <p>Selected List : {{ itemNameList }}</p>
    </div>
    <div class="group-demo-disabled">
      <h5># Disable All</h5>
      <checkbox-group
        v-model="disabledList"
      >
        <checkbox
          :label="disabledGroupName[0].name"
          :disabled="true"
        />
        <checkbox
          :label="disabledGroupName[1].name"
          :disabled="true"
        />
        <checkbox
          :label="disabledGroupName[2].name"
          :disabled="true"
        />
      </checkbox-group>
      <p>Selected List : {{ disabledList }}</p>
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
            name: 'map',
          },
          {
            name: 'reduce',
          },
          {
            name: 'slice',
          },
          {
            name: 'filter',
          },
          {
            name: 'iterator',
          },
        ],
        itemNameList: ['reduce'],
        disabledGroupName: [
          {
            name: 'pizza',
          },
          {
            name: 'chicken',
          },
          {
            name: 'steak',
          },
        ],
        disabledList: ['steak'],
      };
    },
  };
</script>
<style scoped>
  .group-demo, .group-demo-disabled {
    padding-top: 2px;
    padding-left: 1px;
  }
  h5 {
    padding-top: 3px;
    padding-bottom: 3px;
  }
</style>
