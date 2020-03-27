<template>
  <div
    :class="{ 'code-view': true, 'vertical': vertical, 'expanded': isExpanded }"
  >
    <div class="contents">
      <ev-button
        v-show="isExpanded"
        :key="'copy-btn'"
        :type="'text'"
        class="copy-btn"
      >
        <ev-icon
          :cls="'ei-s ei-document-copy'"
          style="font-size: 12px;"
        />
      </ev-button>
      <ev-markdown
        :source="codeData"
      />
      <ev-button
        v-show="!isExpanded"
        :key="'show-code'"
        :type="'text'"
        class="show-code"
        @click="isExpanded = true"
      >
        <ev-icon
          :cls="'ei-s ei-square-arrow-down'"
        />
        <span>Show Code</span>
      </ev-button>
      <ev-button
        v-show="isExpanded"
        :key="'hide-code'"
        :type="'text'"
        class="hide-code"
        @click="isExpanded = false"
      >
        <ev-icon
          :cls="'ei-s ei-square-arrow-up'"
        />
        <span>Hide Code</span>
      </ev-button>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';

  export default {
    name: 'CodeView',
    props: {
      codeUrl: {
        type: String,
        default: '',
      },
      vertical: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        codeData: '',
        isExpanded: false,
      };
    },
    async created() {
      await axios.get(this.codeUrl)
        .then((result) => {
          this.codeData = `\`\`\`html\n${result.data}\n\`\`\``;
        }, (error) => {
          throw new Error(error);
        });
    },
  };
</script>
<style>
  .code-view {
    position: relative;
    overflow: hidden;
  }
  .code-view.vertical {
    width: 50%;
    display: flex;
    flex-direction: column;
    border-top: 0;
    border-left: 1px solid rgba(251,220,74, 0.8);
  }
  .code-view.expanded {
    overflow: inherit;
  }
  .code-view .contents {
    height: 50px;
  }
  .code-view.expanded .contents {
    height: auto;
  }
  .code-view .copy-btn {
    position: absolute;
    background: transparent;
    top: 16px;
    right: 16px;
  }
  .code-view .copy-btn:hover,
  .code-view .copy-btn:focus {
     color: #7957d5;
     background: transparent;
  }
  .code-view .show-code,
  .code-view .hide-code {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    color: grey;
    cursor: pointer;
    font-size: 0.75rem;
    margin: auto;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    font-weight: 500;
  }
  .code-view .show-code:hover,
  .code-view .hide-code:hover {
     background-color: rgba(251,220,74, 0.8);
  }
  .code-view .hide-code {
    position: static;
    height: 50px;
  }
  .code-view .contents pre {
    margin-bottom: 0 !important;
  }
  .show-code .ei-square-arrow-down,
  .hide-code .ei-square-arrow-up {
    margin-right: 2px;
  }
</style>
