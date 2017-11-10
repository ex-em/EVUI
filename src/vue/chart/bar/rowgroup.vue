<template>
    <g>
        <rect v-for="col in row"></rect>
    </g>
    
</template>

<script>
    export default {
        props: {
            scale: Number,
            row: Array
        },
        data: function() {
            return {

            };
        }
    }
</script>

<style>
</style>
