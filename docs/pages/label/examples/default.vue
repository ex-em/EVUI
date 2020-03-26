<template>
  <div>
    <div
      class="label-demo"
    >
      <Label
        :value="labelValue"
        :size="'medium'"
        :user-cls="'test'"
      />
      <Label
        :ref="'label1'"
        :value="labelValue"
        :size="'large'"
      />
    </div>
  </div>
</template>
<script>
  import Label from '@/components/label/label';

  export default {
    components: {
      Label,
    },
    data() {
      return {
        width: '40%',
        height: '100%',
        labelValue: 'Test Label Value',
      };
    },
    mounted() {
      // this.timer = setTimeout(() => { this.updateData(); }, 3000);
    },
    methods: {
      updateData() {
        this.labelValue = 'Updated Label Value';

        if (this.timer) {
          clearTimeout(this.timer);
        }
      },
    },
  };
</script>
<style scoped>
  .ev-label.test {
    font-size: 50px;
  }
</style>
