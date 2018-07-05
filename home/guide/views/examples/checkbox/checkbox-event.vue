<template>
  <div>
    <div class="custom-event-demo">
      <checkbox
        v-model="checked"
        :label="label"
        @on-change="changeFn"
      />
      <p>{{ name }} : {{ value }}</p>
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
        checked: false,
        code: 97,
        label: ' fire Custom Event',
        value: '',
        name: 'Add Char',
      };
    },
    methods: {
      changeFn: function changeFns(checked) {
        let value = this.value;
        let code = this.code;

        if (code === 123) {
          value = '';
          code = 97;
        } else if (checked === true) {
          value += String.fromCharCode(code);
          code++;
        }

        this.value = value;
        this.code = code;
      },
    },
  };
</script>
<style scoped>
  p {
    padding: 3px;
  }
 .disable-demo{
   display: inline-block;
 }
</style>
