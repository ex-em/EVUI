<template>
  <div class="outer">
    <div class="group-slot-demo">
      <h5># Use Slot</h5>
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
    </div>
    <div class="group-list-demo">
      <h5># Use List</h5>
      <checkbox-group
        :list="groupName"
        v-model="itemNameList"
      />
    </div>
    <p>value List : {{ itemNameList }}</p>
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
            name: 'Short Black',
          },
          {
            name: 'Latte',
          },
          {
            name: 'Flat White',
          },
        ],
        itemNameList: [],
      };
    },
  };
</script>
