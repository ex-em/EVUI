<template>
  <div class="container">
    <nav>
      <ul>
        <li>
          <router-link to="/">Index</router-link>
        </li>
        <li>
          <router-link to="/container">Container</router-link>
          <router-link to="/dock/dockframeSample">dockframeSample</router-link>
        </li>
        <li>
          <router-link to="/chart">Chart</router-link>
        </li>
        <li>
          <router-link to="/checkbox">Checkbox</router-link>
        </li>
        <li>
          <router-link to="/selectbox">Selectbox</router-link>
        </li>
        <li>
          <router-link to="/table">Table(page)</router-link>
        </li>
        <li>
          <router-link to="/table2">Table(virtualScroll)</router-link>
        </li>
        <li>
          <router-link to="/table3">Table(normal)</router-link>
        </li>
        <li>
          <router-link to="/loadingmask">Loadingmask</router-link>
        </li>
        <li>
          <router-link to="/timepicker">Timepicker</router-link>
        </li>
        <li>
          <router-link to="/toggle">Toggle</router-link>
        </li>
      </ul>
    </nav>
    <router-view/>
  </div>
</template>
<script>
  export default {
    name: 'App',
  };
</script>

<style scoped>
  nav { margin-bottom: 40px; }
  ul { display: flex; flex-wrap: wrap; }
  li { display: inline-block; }
  li + li { border-left: solid 1px #bbb; padding-left: 10px; margin-left: 10px; }
  .container{ padding: 10px 40px 0; }
  .v-link-active { color: #bbb; }
</style>
