<template>
  <div class="btn-shape">
    <Button
      v-for="btn in btnList"
      :key="btn.name"
      :name="btn.name"
      :text="btn.text"
      :type="btn.type"
      :shape="btn.shape"
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
          { text: 'default', name: 'defaultBtn', type: 'primary' },
          { text: 'circle', name: 'circleBtn', type: 'primary', shape: 'circle' },
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
  .btn-shape{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
