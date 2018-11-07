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
      <div style="width:20px; height:20px;">
        <i
          :class="'ei ei-l ei-check-on'"
        />
        TEST
      </div>
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
