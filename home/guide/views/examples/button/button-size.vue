<template>
  <div class="btn-size">
    <Button
      v-for="btn in btnList"
      :key="btn.name"
      :name="btn.name"
      :text="btn.text"
      :type="btn.type"
      :size="btn.size"
      :btn-style="btn.btnStyle"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import Button from '@/components/button';

  export default {
    components: {
      Button,
    },
    data() {
      return {
        btnList: [],
      };
    },
    mounted() {
      this.btnList = this.getBtnList();
    },
    methods: {
      getBtnList() {
        let btn;
        const btnList = [
          { text: 'small', name: 'smallBtn', type: 'primary', size: 'small' },
          { text: 'normal', name: 'normalBtn', type: 'primary', size: 'normal' },
          { text: 'large', name: 'largeBtn', type: 'primary', size: 'large' },
        ];

        for (let ix = 0, ixLen = btnList.length; ix < ixLen; ix++) {
          btn = btnList[ix];

          if (ix > 0) {
            btn.btnStyle = {
              marginLeft: '8px',
            };
          }
        }

        return btnList;
      },
    },
  };
</script>

<style scoped>
  .btn-size{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
