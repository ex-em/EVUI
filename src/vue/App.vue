<template>
    <div id="app">
        <div id="top-fixed-nav">
            <div class="navbar-title navbar-navi-box">
                <a class="navbar-brand" href="/">EXEM Visualization UI</a>
            </div>
            <div class="navbar-nav-menu navbar-navi-box">
                <ul class="navbar-navi-outer">
                    <li>
                        <router-link to="/guide">Guide Page</router-link>
                    </li>
                    <li>
                        <a href="#">Component</a>
                        <ul>
                            <li><router-link to="/component/grid">Grid</router-link></li>
                            <li><router-link to="/component/tree">Tree</router-link></li>
                            <li><router-link to="/component/chart">Chart</router-link></li>
                        </ul>
                    </li>
                    <li>
                        <a href="#">Performance Test</a>
                        <ul>
                            <li><router-link to="/test/grid">Grid</router-link></li>
                            <li><router-link to="/test/tree">Tree</router-link></li>
                            <li><router-link to="/test/chart">Chart</router-link></li>
                        </ul>
                    </li>
                </ul>
            </div><!--/.nav-collapse -->

        </div>
        <div id="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
</script>

<style>
    /* Reset */
    body {
        margin: 0;
    }

    /* Top Navigation Div */
    #top-fixed-nav {
        width: 100%;
        height : 70px;
        background-color: #1e1e1e;
        position: fixed;
        top : 0;
        z-index : 99999;
    }

    /* Title and Menu in Top Navigation */
    .navbar-navi-box {
        display: inline-block;
    }


    /* Title */
    .navbar-title {
        float : left;
        margin : 20px 0 10px 30px;
    }

    .navbar-brand {
        font-size: 20px;
        font-weight: 500;
        color : #feffff;
    }

    /* Menu */
    .navbar-nav-menu {
        float : right;
        margin : 8px 50px 8px 0;
    }

    .navbar-nav-menu a{
        color : #feffff;
    }

    .navbar-navi-outer {
        margin : 0;
    }

    .navbar-navi-box ul {
        list-style:none;
        float:left;
    }

    .navbar-navi-box ul li {
        position:relative;
        display : inline-block;
        padding:15px 15px 0 15px;
        height : 47px;
    }

    .navbar-navi-box ul li:hover {
        background:#3fa338
    }

    .navbar-navi-box ul ul {
        display:none;
        position:absolute;
        top:100%;
        left:0;
        background:#fff;
        padding:0
    }

    .navbar-navi-box ul ul li {
        float:none;
        width:150px;
        height:40px;
    }

    .navbar-navi-box ul ul a {
        line-height:80%;
        padding:10px 15px
    }

    .navbar-navi-box ul ul ul {
        top:0;
        left:100%
    }

    .navbar-navi-box ul li:hover > ul {
        display:block;
        background-color: #1e1e1e;
    }

    /* Contents */
    #main-content {
        width : 100%;
        margin-top : 70px;
        background-color : #def2f1;
        color : #000;
    }

    /* Links */
    a {
        word-wrap: break-word;
        text-decoration: none;
        -webkit-transition: color 0.1s ease-in, background 0.1s ease-in;
        -moz-transition: color 0.1s ease-in, background 0.1s ease-in;
        -ms-transition: color 0.1s ease-in, background 0.1s ease-in;
        -o-transition: color 0.1s ease-in, background 0.1s ease-in;
        transition: color 0.1s ease-in, background 0.1s ease-in;
    }

    a:hover,
    a:focus {
        text-decoration: none;
        outline: 0;
    }

    a:before,
    a:after {
        -webkit-transition: color 0.1s ease-in, background 0.1s ease-in;
        -moz-transition: color 0.1s ease-in, background 0.1s ease-in;
        -ms-transition: color 0.1s ease-in, background 0.1s ease-in;
        -o-transition: color 0.1s ease-in, background 0.1s ease-in;
        transition: color 0.1s ease-in, background 0.1s ease-in;
    }
</style>
