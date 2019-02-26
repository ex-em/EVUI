<template>
  <div>
    <div style="width: 400px; height: 200px; border: 1px solid #FF0000;">
      <loadingmask
        v-show="true"
        :bar-count="10"
        :bar-width="40"
        :bar-height="7"
        :border-radius="5"
        :bar-color="'rgba(0, 155, 155, 0.5)'"
        :spinner-radius="45"
        :anim-interval="3"
      />
    </div>
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import loadingmask from '@/components/loadingmask/loadingmask';

  export default {
    components: {
      loadingmask,
    },
    data() {
      return {
      };
    },
    methods: {
    },
  };
</script>
