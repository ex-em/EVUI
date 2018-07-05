<template>
  <div class="outer">
    <div class="group-slot-demo">
      <h5># Use Slot</h5>
      <radio-group
        v-model="SelectedItem"
      >
        <radio
          :label="groupName[0].label"
        />
        <radio
          :label="groupName[1].label"
        />
        <radio
          :label="groupName[2].label"
        />
      </radio-group>
    </div>
    <div class="group-list-demo">
      <h5># Use List</h5>
      <radio-group
        :list="groupName"
        v-model="SelectedItem"
      />
    </div>
    <p>Selected Item : {{ SelectedItem }}</p>
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
            label: 'Short Black',
          },
          {
            label: 'Latte',
          },
          {
            label: 'Flat White',
          },
        ],
        SelectedItem: 'Latte',
      };
    },
  };
</script>
