<template>
  <section
    class="ev-tabs"
    :class="{
      closable,
    }"
  >
    <div
      class="ev-tabs-header"
      :class="{
        'has-scroll': true,
      }"
    >
      <span class="ev-tabs-arrow prev">
        <i class="ev-icon-s-arrow-left" />
      </span>
      <span class="ev-tabs-arrow next">
        <i class="ev-icon-s-arrow-right" />
      </span>
      <ul class="ev-tabs-list">
        <li class="ev-tabs-title">
          <span class="text" title="title">
            title
          </span>
          <span class="close-icon">
            <i class="ev-icon-s-close" />
          </span>
        </li>
        <li class="ev-tabs-title">
          <span class="text" title="titletitletitletitletitletitle">
            titletitletitletitletitletitle
          </span>
          <span class="close-icon">
            <i class="ev-icon-s-close" />
          </span>
        </li>
        <li class="ev-tabs-title active">
          <span class="text" title="title">
            title
          </span>
          <span class="close-icon">
            <i class="ev-icon-s-close" />
          </span>
        </li>
      </ul>
    </div>
    <div class="ev-tabs-body">
      <ev-tab-panel>
        <div class="ev-tabs-content">
          tab content tab content tab content tab content
        </div>
      </ev-tab-panel>
    </div>
  </section>
</template>

<script>
import evTabPanel from '../tabPanel/TabPanel';

export default {
  name: 'EvTabs',
  components: {
    evTabPanel,
  },
  props: {
    modelValue: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup() {
    return {
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-tabs {
  ul, li {
    list-style: none;
  }

  @include state('closable') {
    .ev-tabs-title {
      &:hover {
        .text {
          transform: translateX(-10%);
        }
        .close-icon {
          opacity: 1;
        }
      }
    }
  }
}

.ev-tabs-header {
  $tab-header-height: $input-default-height;
  position: relative;

  .ev-tabs-list {
    display: flex;

    @include evThemify() {
      border-bottom: 1px solid evThemed('border-base');
    }
  }
  .ev-tabs-title {
    position: relative;
    width: 90px;
    height: $tab-header-height;
    padding: 0 17px;
    line-height: $tab-header-height;
    cursor: pointer;

    @include evThemify() {
      border-top: 1px solid evThemed('border-base');
      border-right: 1px solid evThemed('border-base');
      background-color: evThemed('background-lighten');
    }
    &:first-child {
      @include evThemify() {
        border-left: 1px solid evThemed('border-base');
      }
    }
    &:hover {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
    &.active {
      background-color: transparent;

      @include evThemify() {
        color: evThemed('primary');
      }
    }
    .text {
      transition: transform $animate-base;

      @include shortening();
    }
    .close-icon {
      position: absolute;
      top: 50%;
      right: 7px;
      transform: translateY(-50%);
      font-size: $font-size-small;
      opacity: 0;
      transition: opacity $animate-base;
    }
  }
  &.has-scroll {
    $arrow-width: 17px;
    .ev-tabs-list {
      padding: 0 $arrow-width;
    }
    .ev-tabs-arrow {
      position: absolute;
      top: 0;
      width: $arrow-width;
      height: $tab-header-height;
      line-height: $tab-header-height;
      font-size: $font-size-base;
      text-align: center;
      cursor: pointer;
      &:hover {
        @include evThemify() {
          color: evThemed('primary');
        }
      }
      &.prev {
        left: 0;
      }
      &.next {
        right: 0;
      }
    }
  }
}
</style>
