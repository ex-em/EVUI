<template>
  <article class="article-wrapper">
    <h3 class="article-title">
      {{ title }}
    </h3>
    <p class="article-description">
      {{ description }}
    </p>
    <div class="article-example">
      <div class="view">
        <component
          :is="contents"
        />
      </div>
      <div
        v-highlight
        :class="['code', { 'expend': codeExpend }]"
      >
        <div
          ref="codeWrapper"
          class="code-wrapper"
        >
          <pre
            v-for="(code, key) in codeText"
            :key="key"
          >
            {{ code }}
          </pre>
        </div>
        <div
          class="btn-show-more"
          @click="clickExpend"
        >
          {{ codeExpend ? '▲ Fold the code' : '▼ Unfold the code' }}
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { ref } from 'vue';
import hljs from 'highlight.js';

export default {
  name: 'Example',
  directives: {
    highlight: {
      mounted(el) {
        const blocks = el.querySelectorAll('pre');
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    contents: {
      type: Object,
      default: null,
    },
    url: {
      type: String,
      default: '',
    },
    codeText: {
      type: Object,
      default: () => {},
    },
  },
  setup() {
    const codeExpend = ref(false);
    const codeWrapper = ref(null);
    const clickExpend = () => {
      codeExpend.value = !codeExpend.value;
      if (!codeExpend.value) {
        codeWrapper.value.scrollTop = 0;
      }
    };
    return {
      codeExpend,
      codeWrapper,
      clickExpend,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

.content-title {
  padding-bottom: 15px;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: bold;

  @include themify() {
    border-bottom: 1px solid themed('border-color-base');
  }
}
.article-wrapper {
  padding: 20px 0 55px;
  font-size: 15px;
}
.article-title {
  margin-bottom: 20px;
  font-size: 23px;
  font-weight: bold;
}
.article-description {
  margin-bottom: 30px;
  line-height: 1.5em;
}
.article-example {
  display: flex;
  border: 1px solid $color-yellow;
  border-radius: 4px;
  .view {
    flex: 1;
    padding: 15px 20px;
    border-right: 1px solid $color-yellow;
  }
  .case {
    padding: 15px 0;
    &-title {
      margin-bottom: 25px;
      font-size: 15px;
      font-weight: bold;
    }
  }
  .description {
    padding: 9px 12px;
    margin: 15px 0 20px;
    border-radius: 4px;
    font-size: 13px;

    @include themify() {
      background-color: themed('background-color-description');
      border: 1px solid themed('border-color-base');
    }

    .badge {
      display: inline-block;
      padding: 3px 7px;
      margin-right: 10px;
      border-radius: 4px;

      @include themify() {
        background-color: themed('border-color-base');
      }
    }
  }
  .code {
    position: relative;
    width: 50%;
    max-width: 700px;
    .code-wrapper {
      height: 400px;
      overflow-y: hidden;
    }
    .btn-show-more {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 45px;
      line-height: 45px;
      background-color: rgba($color-yellow, 0.7);
      color: $color-black;
      text-align: center;
      cursor: pointer;
    }
    &.expend {
      .code-wrapper {
        height: auto;
        max-height: 600px;
        padding-bottom: 45px;
        overflow-y: auto;
      }
    }
  }
}

@media all and (max-width: 1280px) {
  .article-example {
    display: block;
    .view {
      width: 100%;
      border-right: 0;
      border-bottom: 1px solid $color-yellow;
    }
    .code {
      max-width: none;
      width: 100%;
    }
  }
}
</style>
