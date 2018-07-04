<template>
  <div class="evui-codeview">
    <div
      :style="{ height: boxHeight+'px' }"
      :class="isActive"
      class="evui-codeview-example"
    >
      <div
        ref="exampleLayer"
        class="evui-codeview-example-layer"
      >
        <slot/>
      </div>
      <div class="evui-codeview-split-layer"/>
      <div
        ref="codeLayer"
        class="evui-codeview-code-layer"
      >
        <codemirror
          :value="rawCode"
          :options="codeOption"
        />
      </div>
      <div
        class="evui-codeview-example-bar"
        @click.stop="onBottomClick"
      >
        <div
          :class="selectIconClasses"
          class="evui-codeview-example-bar-icon"
        >
          <icon class="fa-sort-down"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { codemirror } from 'vue-codemirror-lite';
  import icon from '@/components/icon/icon';

  export default {
    components: {
      icon,
      codemirror,
    },
    props: {
      codeUrl: {
        type: String,
        default: '',
      },
      height: {
        type: Number,
        default: 200,
      },
    },
    data() {
      return {
        resource: {},
        rawCode: '',
        boxHeight: this.height,
        txtBottomBar: 'Expand',
        isExpand: false,
        codeOption: {
          mode: 'vue',
          tabSize: 4,
          lineNumbers: false,
          lineWrapping: true,
          scrollbarStyle: null,
          readOnly: true,
        },
      };
    },
    computed: {
      isActive() {
        return [
          {
            expand: this.isExpand,
          },
        ];
      },
      selectIconClasses() {
        return [
          {
            'select-down': this.txtBottomBar !== 'Expand',
          },
        ];
      },
    },
    created() {
      this.$http.get(this.codeUrl)
        .then((result) => {
          this.rawCode = result.data;
        }, (error) => {
          throw new Error(error);
        });
    },
    methods: {
      onBottomClick: function onBottomClick() {
        const codeLayerHeight = this.$refs.codeLayer.getBoundingClientRect().height;
        const exampleLayerHeight = this.$refs.exampleLayer.getBoundingClientRect().height;

        if (this.txtBottomBar === 'Expand') {
          this.txtBottomBar = 'Hide';
          this.boxHeight = codeLayerHeight + exampleLayerHeight + 33;
        } else {
          this.txtBottomBar = 'Expand';
          this.boxHeight = this.height;
        }

        this.isExpand = !this.isExpand;
      },
    },
  };
</script>
<style scoped>
  .evui-codeview{
    padding: 5px;
  }
  .evui-codeview-example{
    position: relative;
    display: block;
    flex-direction: column;
    width: 100%;
    border: 1px solid #dfe6e9;
    padding: 10px 10px 20px 10px;
    border-radius: 6px;
    overflow: hidden;
    transition: height .8s ease-in-out;
  }
  .evui-codeview-example.expand{
    transition: height .8s ease-in-out;
  }
  .evui-codeview-example-layer{
    position: relative;
  }
  .evui-codeview-split-layer{
    position: relative;
    border-bottom: 1px solid #dfe6e9;
  }
  .evui-codeview-code-layer{
    position: relative;
    width: 100%;
    font-size: 8px;
  }
  .evui-codeview-example-bar{
    position: absolute;
    left: 0px;
    bottom: 0px;
    width: 100%;
    height: 37px;
    padding: 6px;
    z-index: 10;
  }
  .evui-codeview-example-bar:hover{
    cursor: pointer;
    background-color: rgba(231,231,231, 0.3);
  }
  .evui-codeview-example:hover{
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  }
  .evui-codeview-example-bar-icon{
    width: 100%;
    height: 100%;
    line-height: 25px;
    text-align: center;
  }
  .evui-codeview-example-bar-icon i{
    display: inline-block;
    height: 100%;
    line-height: 18px;
    font-size: 16px;
    color: #0055aa;
    opacity: 0;
    transition: all .2s ease-in-out;
  }
  .evui-codeview-example-bar-icon:hover i{
    opacity: 1;
  }
  .evui-codeview-example-bar-icon.select-down i{
    transform: rotate(180deg);
  }
  .evui-codeview-example-bar-icon span{
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  .evui-codeview-example-jsfiddle, .evui-codeview-example-bar-icon span{
    opacity: 1;
  }
  .evui-codeview-example-jsfiddle{
    position: absolute;
    top: 10px;
    right: 30px;
    font-weight: bold;
    cursor: pointer;
    opacity: 0;
    /*transition: opacity 0.5s ease-in-out;*/
  }
  .evui-codeview-example-jsfiddle:hover{
    color: #0984e3;
  }
</style>
