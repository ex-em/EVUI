<template>
  <div class="outer">
    <div class="box-demo">
      <h5># Handle Custom Event</h5>
      <radio-group
        :list="groupName"
        :group-align="'vbox'"
        v-model="selectedItem"
        @on-change="selectEvent"
      />
      <p>my new work station : {{ value }}</p>
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
        value: '',
        maxLength: 255,
      };
    },
    methods: {
      selectEvent: function selectEvent(newValue) {
        if (this.value.length >= 80) {
          this.value = '';
        }
        this.value += ` ${newValue}`;
      },
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
