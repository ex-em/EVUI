<template>
  <div class="evui-codeview">
    <div
      :style="{ height: boxHeight+'px' }"
      :class="isActive"
      class="evui-codeview-example"
    >
      <div
        v-if="description && !isBottom"
        ref="descriptionLayer"
        class="evui-codeview-description"
      >
        <span>{{ description }}</span>
      </div>
      <div
        ref="exampleLayer"
        class="evui-codeview-example-layer"
      >
        <slot/>
        <div
          v-if="description && isBottom"
          ref="descriptionLayer"
          class="evui-codeview-description"
        >
          <span>{{ description }}</span>
        </div>
      </div>
      <div>
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
            <span
              class="evui-codeview-example-bar-span"
            >{{ txtBottomBar }}</span>
          </div>
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
        default: 0,
      },
      description: {
        type: String,
        default: '',
      },
      isBottom: {
        type: Boolean,
        default: false,
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
    mounted() {
      const descriptionLayerHeight = this.$refs.descriptionLayer ?
        this.$refs.descriptionLayer.getBoundingClientRect().height + 14.5 : 0;
      const exampleLayerHeight = this.$refs.exampleLayer.getBoundingClientRect().height;

      this.boxHeight = exampleLayerHeight + descriptionLayerHeight + 50;
    },
    created() {
      this.$http.get(this.codeUrl)
        .then((result) => {
          setTimeout(() => {
            this.rawCode = result.data;
          }, 600);
        }, (error) => {
          throw new Error(error);
        });
    },
    methods: {
      onBottomClick: function onBottomClick() {
        const codeLayerHeight = this.$refs.codeLayer.getBoundingClientRect().height;
        const exampleLayerHeight = this.$refs.exampleLayer.getBoundingClientRect().height;
        const descriptionLayerHeight = this.$refs.descriptionLayer ?
          this.$refs.descriptionLayer.getBoundingClientRect().height + 14.5 : 0;
        if (this.txtBottomBar === 'Expand') {
          this.txtBottomBar = 'Hide';
          this.boxHeight = codeLayerHeight + exampleLayerHeight + descriptionLayerHeight + 33;
        } else {
          this.txtBottomBar = 'Expand';
          this.boxHeight = exampleLayerHeight + descriptionLayerHeight + 50;
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
    z-index: 1;
    transition: height .3s ease-in-out;
  }
  .evui-codeview-example.expand{
    transition: height .3s ease-in-out;
  }
  .evui-codeview-example-layer{
    position: relative;
    padding: 0px 0px 8px 0px;
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
    z-index: 10;
    background-color: #ffffff;
    transition: background-color .2s ease-in-out;
  }
  .evui-codeview-example-bar:hover{
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.4);
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
    height: 100%;
    line-height: 30px;
    font-size: 16px;
    color: rgba(30, 101, 188, 0.5);
    transition: all .3s ease-in-out;
  }
  .evui-codeview-example-bar-icon span{
    line-height: 30px;
    font-size: 13px;
    font-weight: bold;
    opacity: 0;
    transition: all .3s ease-in-out;
  }

  .evui-codeview-example-bar-icon:hover i, .evui-codeview-example-bar-icon:hover span{
    color: rgb(30, 101, 188);
    opacity: 1;
    transform: translateX(-6px);
    transition: all .3s ease-out;
  }
  .evui-codeview-example-bar-icon.select-down i{
    transform: rotate(180deg);
    transition: transform .4s ease-out;
  }
  .evui-codeview-example-bar-icon, .evui-codeview-example-bar-icon-span {
    user-select: none;
  }
  .evui-codeview-description {
    border: 1px solid #dfe6e9;
    border-radius: 2px;
    padding: 5px 10px 8px 10px;
    margin: 5px 3px 5px 3px;
    background-color: #FAFAFA;
    text-align: left;
    line-height: 1.5;
  }
  .evui-codeview-description span{
    font-size: 13px;
  }
</style>
