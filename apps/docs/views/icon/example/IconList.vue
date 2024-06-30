<template>
  <article class="article-wrapper">
    <h3 class="article-title">Icon List</h3>
    <div class="evui-icon-list">
      <div
        v-for="icon in icons"
        :key="icon.properties.code"
        class="glyph fs1"
      >
        <div class="clearfix bshadow0 pbs">
          <ev-icon :icon="`ev-icon-${icon.properties.name}`" />
          <span class="mls">
            {{ `ev-icon-${icon.properties.name}` }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
<script>
import { icons } from '../../icon/example/selection.json';

export default {
  name: 'IconList',
  setup() {
    return {
      icons,
    };
  },
};
</script>
<style lang="scss">
@import '../../../style/index.scss';

.evui-icon-list {
  display: flex;
  flex-wrap: wrap;

  @include themify() {
    border-top: 1px solid themed('border-color-base');
    border-left: 1px solid themed('border-color-base');
  }
  .glyph {
    width: 10%;
    padding: 15px 7px;
    box-sizing: border-box;

    @include themify() {
      border-right: 1px solid themed('border-color-base');
      border-bottom: 1px solid themed('border-color-base');
    }
    > div {
      text-align: center;
    }
    i {
      font-size: 30px;
    }
    .mls {
      display: block;
      padding-top: 7px;
      font-size: 15px;
      color: #333333;
    }
  }
}

@media all and (max-width: 1400px) {
  .evui-icon-list .glyph {
    width: 12.5%;
  }
}
</style>
