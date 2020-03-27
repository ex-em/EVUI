<template>
  <section>
    <h2>{{ title }}</h2>
    <p class="example-desc">
      {{ description }}
    </p>
    <div :class="{ 'example': true, 'vertical': vertical }">
      <div
        class="edit-code"
        @click="openCodeSandBox"
      >
        <span>JSFIDDLE</span>
        <ev-icon
          :cls="'ei-s ei-edit-code'"
          style="margin: 3px 0 0 2px; font-size: 12px;"
        />
      </div>
      <div class="contents">
        <component :is="contents" />
      </div>
      <CodeView
        :code-url="url"
        :vertical="vertical"
      />
    </div>
    <hr class="example-splitter">
  </section>
</template>
<script>
  import axios from 'axios';
  import { getParameters } from 'codesandbox/lib/api/define';
  import CodeView from './code-view';

  export default {
    name: 'Example',
    components: {
      CodeView,
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
        type: [Object, Function],
        default: null,
      },
      url: {
        type: String,
        default: '',
      },
      vertical: {
        type: Boolean,
        default: true,
      },
    },
    methods: {
      async getCode(url) {
        let codeData;
        await axios.get(url)
          .then((result) => {
            codeData = `${result.data}`;
          }, (error) => {
            throw new Error(error);
          });

        return codeData;
      },
      async openCodeSandBox() {
        const parameters = getParameters({
          files: {
            'package.json': {
              content: {
                name: 'evui examples',
                private: true,
                main: 'main.js',
                scripts: {
                  serve: 'vue-cli-service serve',
                  build: 'vue-cli-service build',
                  lint: 'vue-cli-service lint',
                },
                dependencies: {
                  evui: '2.1.0',
                  moment: '2.24.0',
                  vue: '^2.5.2',
                },
                devDependencies: {
                  '@vue/cli-plugin-babel': '3.6.0',
                  '@vue/cli-plugin-eslint': '3.6.0',
                  '@vue/cli-service': '3.6.0',
                  'babel-eslint': '^10.0.1',
                  eslint: '^5.8.0',
                  'eslint-plugin-vue': '^5.0.0',
                  'vue-template-compiler': '^2.5.21',
                },
              },
            },
            'main.js': {
              content: await this.getCode('./docs/components/template/main.js'),
            },
            'App.vue': {
              content: await this.getCode('./docs/components/template/App.vue'),
            },
            'public/index.html': {
              content: await this.getCode('./docs/components/template/index.html'),
            },
            'Examples.vue': {
              content: await this.getCode(this.url),
            },
          },
        });

        const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;

        window.open(url);
      },
    },
  };
</script>
<style scoped>
  .example {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #FFDD57;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
    color: rgba(0, 0, 0, 0.7);
    margin-top: 30px;
  }
  .example.vertical {
    flex-direction: row;
  }
  .example.vertical .contents {
    overflow: auto;
    width: 50%;
  }
  .example:before {
    position: absolute;
    background: #FFDD57;
    border-radius: 4px 4px 0 0;
    bottom: 100%;
    content: 'EXAMPLE';
    font-size: 8px;
    font-weight: bold;
    left: -1px;
    padding: 4px 8px;
  }
  .edit-code {
    position: absolute;
    display: flex;
    align-items: center;
    background: #FFDD57;
    border-radius: 4px 4px 0 0;
    font-size: 8px;
    font-weight: bold;
    bottom: 100%;
    right: -1px;
    padding: 4px 8px;
  }
  .edit-code:hover {
    cursor: pointer;
  }
  .contents {
    padding: 15px;
  }
  hr.example-splitter {
    background-color: #F5F5F5;
    border-top: rgba(0, 0, 0, 0.7);
    margin: 30px 0;
  }
  p.example-desc {
    color: grey;
    line-height: 50px;
    vertical-align: center;
  }
</style>
