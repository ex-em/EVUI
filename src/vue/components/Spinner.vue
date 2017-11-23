<template>
    <input
            type="number"
            v-model="inputValue"
            @input="onInput"
            @blur="onBlur"
    >
</template>

<script>
    export default {
        props: {
            value: {
                type: Number,
                default: 0
            }
        },
        computed: {

        },
        methods: {
            onInput() {

            },
            onBlur() {
                this.$emit('blur', this.inputValue);
            }
        },
        data(){
            return {
                inputValue: this.value
            };
        }
    }
</script>

<style>

</style>
