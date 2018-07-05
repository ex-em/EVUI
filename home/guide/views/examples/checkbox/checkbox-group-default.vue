<template>
  <div>
    <div class="group-slot-demo">
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
        />
      </checkbox-group>
      <p>value List : {{ itemNameList }}</p>
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
      };
    },
  };
</script>
<style scoped>
  div{
    display: inline-block;
  }
  p{
    padding: 5px;
  }
</style>
