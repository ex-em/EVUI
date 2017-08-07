import 'babel-polyfill';
//import world from './world';
import Vue from 'vue';

//document.getElementById('output').innerHTML = `Hello ${world}!`;

let a = new Vue({
    el: '#output',
    data: { message: 'hello, world!' }
});
