<template>
  <div>
    <div
      v-for="item in baseCheckList"
      :key="item.id"
    >
      <checkbox
        v-model="item.bool"
        :label="item.name"
      />
      <p>{{ item.bool }}</p>
    </div>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      checkbox,
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
    padding: 3px;
  }
  p{
    margin-left: 30px;
  }
</style>
