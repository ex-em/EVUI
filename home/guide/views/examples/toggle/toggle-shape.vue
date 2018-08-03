<template>
  <div>
    <toggle
      v-model="toggleValue1"
      :toggle-type="'slide'"
      :toggle-shape="'circle'"
      :toggle-text="largeText"
    />
    {{ toggleValue1 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue2"
      :toggle-type="'slide'"
      :toggle-shape="'circle'"
      :toggle-text="largeText"
    />
    {{ toggleValue2 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue3"
      :toggle-type="'slide'"
      :toggle-shape="'square'"
      :toggle-text="largeText"
    />
    {{ toggleValue3 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue4"
      :toggle-type="'slide'"
      :toggle-shape="'square'"
      :toggle-text="largeText"
    />
    {{ toggleValue4 }}
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
        largeText: {
          onText: 'ON',
          offText: 'OFF',
          fontSize: 11,
        },
      };
    },
    methods: {
    },
  };
</script>
