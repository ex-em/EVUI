<template>
  <div>
    <div style="width: 400px; height: 200px;">
      <loadingmask
        v-show="true"
        :is-show="true"
        :bar-count="10"
        :width="'40px'"
        :height="'7px'"
        :border-radius="'5px'"
        :bar-color="'rgba(0, 155, 155, 0.5)'"
        :fadebar-radius="'45px'"
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
