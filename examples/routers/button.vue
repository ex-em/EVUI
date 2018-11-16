<template>
  <div>
    <ev-button
      v-for="btn in btnList"
      :key="btn.name"
      :type="btn.type"
      :size="btn.size"
      :shape="btn.shape"
      :disabled="btn.disabled"
      @click="onClick"
    >
      {{ btn.text }}
    </ev-button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        btnList: [
          { text: 'default' },
          { text: 'primary', type: 'primary' },
          { text: 'small', type: 'primary', size: 'small' },
          { text: 'medium', type: 'primary', size: 'medium' },
          { text: 'large', type: 'primary', size: 'large' },
          { text: 'ghost', type: 'ghost' },
          { text: 'dashed', type: 'dashed' },
          { text: 'text', type: 'text' },
          { text: 'circle', type: 'primary', shape: 'circle' },
          { text: 'disabled', type: 'primary', disabled: true },
        ],
      };
    },
    methods: {
      onClick(e, text) {
        this.text = text;
      },
    },
  };

</script>
