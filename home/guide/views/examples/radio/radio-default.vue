<template>
  <div>
    <div
      v-for="item in baseCheckList"
      :key="item.id"
    >
      <radio
        v-model="item.bool"
        :label="item.name"
      />
      <p>{{ item.bool }}</p>
    </div>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import radio from '@/components/radio/radio';

  export default {
    components: {
      radio,
    },
    data() {
      return {
        baseCheckList: [
          {
            bool: true,
            name: 'value01',
          },
          {
            bool: true,
            name: 'value02',
          },
          {
            bool: false,
            name: 'value03',
          },
        ],
      };
    },
  };
</script>
<style scoped>
  div{
    display: inline-block;
  }
  p{
    margin-left: 30px;
  }
</style>
