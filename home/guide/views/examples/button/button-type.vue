<template>
  <div class="btn-type">
    <Button
      v-for="btn in btnList"
      :key="btn.name"
      :name="btn.name"
      :text="btn.text"
      :type="btn.type"
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
          { text: 'origin', name: 'originBtn', type: '' },
          { text: 'default', name: 'defaultBtn' },
          { text: 'primary', name: 'primaryBtn', type: 'primary' },
          { text: 'ghost', name: 'ghostBtn', type: 'ghost' },
          { text: 'dashed', name: 'dashedBtn', type: 'dashed' },
          { text: 'text', name: 'textBtn', type: 'text' },
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
  .btn-type{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
