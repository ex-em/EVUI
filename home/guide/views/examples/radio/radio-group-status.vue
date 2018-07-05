<template>
  <div class="outer">
    <div class="group-demo">
      <h5># Disable Items</h5>
      <radio-group
        v-model="selectedItem"
      >
        <radio
          :label="groupName[0].name"
          :disabled="true"
        />
        <radio
          :label="groupName[1].name"
        />
        <radio
          :label="groupName[2].name"
          :disabled="true"
        />
        <radio
          :label="groupName[3].name"
        />
        <radio
          :label="groupName[4].name"
        />
      </radio-group>
      <p>Selected Item : {{ selectedItem }}</p>
    </div>
    <div class="group-demo-disabled">
      <h5># Disable All</h5>
      <radio-group
        v-model="disabledItem"
      >
        <radio
          :label="disabledGroupName[0].name"
          :disabled="true"
        />
        <radio
          :label="disabledGroupName[1].name"
          :disabled="true"
        />
        <radio
          :label="disabledGroupName[2].name"
          :disabled="true"
        />
      </radio-group>
      <p>Selected Item : {{ disabledItem }}</p>
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
        selectedItem: 'iterator',
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
        disabledItem: 'steak',
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
