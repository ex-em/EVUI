<template>
  <MainHeader />
  <MainContent />
</template>

<script>
import MainHeader from './components/Header';
import MainContent from './components/Content';

export default {
  name: 'Home',
  components: {
    MainHeader,
    MainContent,
  },
};
</script>

<style lang="scss">
@import '~@/stylesheets/default';

* {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
}

#app {
  padding-top: 55px;
}
</style>
