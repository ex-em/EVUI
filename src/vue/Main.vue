<template>
    <div id="main">
        <h1>{{ msg }}</h1>
        <div>
            <ul>
                <li class="row">
                    <router-link to="/guide">Guide Page</router-link>
                </li>
            </ul>
        </div>
        <div>
            <ul>
                <li class="row">
                    <router-link to="/component">Component</router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
        return {
            msg : 'EVUI - Exem Visualization UI'
        }
    }
    }
</script>

<style>
    #main {
        width : 100%;
        height : 30px;
        display: block;
        vertical-align : middle;
        text-align: center;
    }

    h1 {
        line-height: 120px;
        color: #41B883;
        font-size: 30px;
        font-weight: 900!important;
        text-align: center;
    }

    .row {
        width: 300px;
        min-height: 100px;
        background-color: rgba(209, 209, 209, 0.24);
        box-shadow: none;
        border: 0;
        margin : 0 15px 0 15px;
        display: inline-block;
        text-align: center;
        vertical-align : middle;
        line-height:100px;
        font-size: 30px;
        cursor: pointer;
    }

    .row a {
        text-decoration: none;
        color: #35495E;
    }

</style>
