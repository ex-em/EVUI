<template>
  <div>
    <toggle
      v-model="toggleValue1"
      :toggle-type="'tab'"
      :toggle-text="largeText1"
      :toggle-font-size="13"
    />
    {{ toggleValue1 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue2"
      :toggle-type="'tab'"
    />
    {{ toggleValue2 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue3"
      :toggle-type="'slide'"
      :toggle-text="largeText3"
    />
    {{ toggleValue3 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue4"
      :toggle-type="'slide'"
    />
    {{ toggleValue4 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue5"
      :toggle-type="'button'"
      :toggle-text="largeText5"
    />
    {{ toggleValue5 }}
    <br>
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import toggle from '@/components/toggle';

  export default {
    components: {
      toggle,
    },
    data() {
      return {
        toggleValue1: true,
        toggleValue2: false,
        toggleValue3: true,
        toggleValue4: false,
        toggleValue5: true,
        largeText1: {
          onText: 'ON_TEXT',
          offText: 'OFF',
        },
        largeText3: {
          onText: 'ON_TEXT',
          offText: 'OFF_TEXT',
        },
        largeText5: {
          onText: 'ON_TEXT',
          offText: 'OFF_TEXT',
        },
      };
    },
    methods: {
    },
  };
</script>
