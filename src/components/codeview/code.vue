<template>
  <div class="outer">
    <div
      :style="{height: boxHeight + 'px'}"
      :class="isActive"
      class="guide-content-example"
    >
      <div
        class="guide-content-example-layer"
      >
        <slot/>
      </div>
      <div class="guide-content-split-layer"/>
      <div
        ref="codeBox"
        class="guide-content-code-layer"
      >
        <codemirror
          :value="rawCode"
          :options="codeOption"
        />
      </div>
      <div
        class="guide-content-example-bar"
        @click.stop="onBottomClick"
      >
        <div
          :class="selectIconClasses"
          class="guide-content-example-bar-icon"
        >
          <icon class="fa-sort-down"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  /* eslint-disable no-useless-escape */
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
        default: 100,
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
          this.resource = this.codeParser(this.rawCode);
        }, () => {});
    },
    methods: {
      onBottomClick: function onBottomClick() {
        if (this.txtBottomBar === 'Expand') {
          this.txtBottomBar = 'Hide';
          this.boxHeight = this.$refs.codeBox.getBoundingClientRect().height + 300;
        } else {
          this.txtBottomBar = 'Expand';
          this.boxHeight = this.height;
        }

        this.isExpand = !this.isExpand;
      },
      codeParser(data = '') {
        let startTag;
        let endTag;
        let startIndex;
        let endIndex;

        const obj = {
          template: '',
          style: '',
          script: '',
        };

        const keyList = Object.keys(obj);

        for (let ix = 0, ixLen = keyList.length; ix < ixLen; ix++) {
          startTag = `<${keyList[ix]}>`;
          endTag = `</${keyList[ix]}>`;
          startIndex =
            keyList[ix] === 'style' ? data.lastIndexOf(startTag) : data.indexOf(startTag);
          if (startIndex > -1) {
            endIndex = data.lastIndexOf(endTag);
            obj[keyList[ix]] = data.substring(startIndex + startTag.length, endIndex).trim();
          }
        }

        return obj;
      },
    },
  };
</script>
<style scoped>
  .outer{
    padding: 5px;
  }
  .guide-content-example{
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 200px;
    border: 2px solid #dfe6e9;
    padding: 10px 10px 40px 10px;
    border-radius: 6px;
    overflow: hidden;
    transition: all 1s ease;
  }
  .guide-content-example.expand{
    transition: all 1s ease;
  }
  .guide-content-example-layer{
    margin-top: 5px;
    padding-bottom: 10px;
  }
  .guide-content-split-layer{
    border-bottom: 1px solid #dfe6e9;
  }
  .guide-content-code-layer{
    width: 100%;
    height: 100%;
    font-size: 8px;
  }
  .guide-content-example-bar{
    position: absolute;
    left: 0px;
    bottom: 0px;
    width: 100%;
    height: 40px;
    padding: 6px;
    z-index: 10;
  }
  .guide-content-example-bar:hover{
    cursor: pointer;
  }

  .guide-content-example:hover{
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  }

  .guide-content-example-bar-icon{
    width: 100%;
    height: 100%;
    line-height: 28px;
    text-align: center;
  }
  .guide-content-example-bar-icon i{
    display: inline-block;
    height: 100%;
    line-height: 18px;
    font-size: 15px;
    transition: all .2s ease-in-out;
  }
  .guide-content-example-bar-icon.select-down i{
    transform: rotate(180deg);
  }
  .guide-content-example-bar-icon span{
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  .guide-content-example-bar:hover .guide-content-example-jsfiddle,
  .guide-content-example-bar:hover .guide-content-example-bar-icon span{
    opacity: 1;
  }
  .guide-content-example-jsfiddle{
    position: absolute;
    top: 10px;
    right: 30px;
    font-weight: bold;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  .guide-content-example-jsfiddle:hover{
    color: #0984e3;
  }
</style>
