<template>
  <div>
    <toggle
      v-model="toggleValue1"
      :toggle-obj="largeObj"
      :toggle-text="largeText1"
      :toggle-font-size="18"
    />
    {{ toggleValue1 }}
    <toggle
      v-model="toggleValue2"
      :toggle-text="largeText2"
      :toggle-font-size="13"
    />
    {{ toggleValue2 }}
    <toggle
      v-model="toggleValue3"
      :toggle-obj="smallObj"
    />
    {{ toggleValue3 }}
  </div>
</template>

<script>
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
        largeObj: {
          width: 80,
          height: 34,
        },
        largeText1: {
          onText: 'ON',
          offText: '',
        },
        largeText2: {
          onText: 'ON',
          offText: 'OFF',
        },
        smallObj: {
          width: 30,
          height: 14,
        },
      };
    },
    methods: {
    },
  };
</script>
