<template>
  <div class="btn-size">
    <div
      v-for="(row, rowIdx) in btnList"
      :key="`row_${rowIdx}`"
      :style="{ width: '100%', height: '55px', margin: '5px' }"
    >
      <ev-button
        v-for="(btn, btnIdx) in row"
        :key="`row_${rowIdx}_btn_${btnIdx}`"
        :style="{ marginLeft: btnIdx === 0 ? '' : btnIdx % 4 === 0 ? '15px' : '5px' }"
        :type="'primary'"
        :size="btn.size"
        :shape="btn.shape"
      >
        <i :class="btn.iconCls" />
        {{ btn.text }}
      </ev-button>
      <br>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        btnList: this.getBtnList(),
      };
    },
    methods: {
      getBtnList() {
        return [
          [
            { size: 'small', shape: 'square', text: 'small' },
            { size: 'medium', shape: 'square', text: 'medium' },
            { size: 'large', shape: 'square', text: 'large' },
          ],
          [
            { size: 'small', shape: 'square', text: 'small' },
            { size: 'small', shape: 'square', text: 'small', iconCls: 'ei ei-bell' },
            { size: 'medium', shape: 'square', text: 'medium' },
            { size: 'medium', shape: 'square', text: 'medium', iconCls: 'ei ei-bell' },
            { size: 'large', shape: 'square', text: 'large' },
            { size: 'large', shape: 'square', text: 'large', iconCls: 'ei ei-bell' },
          ],
          [
            { size: 'small', shape: 'square', text: 'small' },
            { size: 'small', shape: 'circle', text: '', iconCls: 'ei ei-bell' },
            { size: 'medium', shape: 'square', text: 'medium' },
            { size: 'medium', shape: 'circle', text: '', iconCls: 'ei ei-bell' },
            { size: 'large', shape: 'square', text: 'large' },
            { size: 'large', shape: 'circle', text: '', iconCls: 'ei ei-bell' },
          ],
        ];
      },
    },
  };
</script>

<style>
  .btn-size{
    display: inline-block;
    margin: 5px;
    height: 180px;
  }
</style>
