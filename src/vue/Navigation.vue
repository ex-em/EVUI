<template>
    <div id="navi">
        <h1>{{ msg }}</h1>
        <ul class="navigation">
            <li class="evui-main-comp"><router-link to="/grid">GRID</router-link></li>
            <li class="evui-main-comp"><router-link to="/tgrid">TABLE GRID</router-link></li>
            <li class="evui-main-comp"><router-link to="/tree">TREE</router-link></li>
            <li class="evui-main-comp">CHART</li>
        </ul>
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
    #navi {
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

    .evui-main-comp {
        width: 300px;
        min-height: 300px;
        background-color: rgba(209, 209, 209, 0.24);
        box-shadow: none;
        border: 0;
        margin : 0 15px 0 15px;
        display: inline-block;
        text-align: center;
        vertical-align : middle;
        line-height:300px;
        font-size: 30px;
        cursor: pointer;
    }

    .evui-main-comp a {
        text-decoration: none;
        color: #35495E;
    }
</style>
