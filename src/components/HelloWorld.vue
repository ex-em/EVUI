<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      hello world!
    </p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
