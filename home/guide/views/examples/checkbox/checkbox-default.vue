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
            name: 'Normal',
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
