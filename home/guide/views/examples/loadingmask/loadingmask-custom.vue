<template>
  <div>
    <div style="width: 400px; height: 200px;">
      <loadingmask
        v-show="true"
        :width="'40px'"
        :height="'7px'"
        :bar-count="10"
        :border-radius="'5px'"
        :bar-color="'rgba(0, 155, 155, 0.5)'"
        :fadebar-radius="'55px'"
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
        loadingMaskData: {
          borderRadius: '10px',
          barColor: 'rgba(255, 0, 0, 0.5)',
          fadebarRadius: '20px',
          animInterval: 2,
        },
      };
    },
    methods: {
    },
  };
</script>
