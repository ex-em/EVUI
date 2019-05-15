<template>
  <section>
    <h2>{{ title }}</h2>
    <p class="example-desc">{{ description }}</p>
    <div :class="{ 'example': true, 'vertical': vertical }">
      <div class="edit-code">
        <span>JSFIDDLE</span>
        <ev-icon
          :cls="'ei-s ei-edit-code'"
          style="margin: 3px 0 0 2px; font-size: 12px;"
        />
      </div>
      <div class="contents">
        <component :is="contents"/>
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
  };
</script>
<style scoped>
  .example {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #ffdd57;
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
    width: 50%;
  }
  .example:before {
    position: absolute;
    background: #ffdd57;
    border-radius: 4px 4px 0 0;
    bottom: 100%;
    content: "EXAMPLE";
    font-size: 8px;
    font-weight: bold;
    left: -1px;
    padding: 4px 8px;
  }
  .edit-code {
    position: absolute;
    display: flex;
    align-items: center;
    background: #ffdd57;
    border-radius: 4px 4px 0 0;
    font-size: 8px;
    font-weight: bold;
    bottom: 100%;
    right: -1px;
    padding: 4px 8px;
  }
  .contents {
    padding: 15px;
  }
  hr.example-splitter {
    background-color: #f5f5f5;
    border-top: rgba(0, 0, 0, 0.7);
    margin: 30px 0;
  }
  p.example-desc {
    color: grey;
    line-height: 50px;
    vertical-align: center;
  }
</style>
