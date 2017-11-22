<template>
    <div class="ContentA">
        <h1>A</h1>

        <div>
            <button @click="btnClick()">A Count++</button> {{ name +' / count: '+ cnt }}
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            contentName: {
                type: String,
                default: 'ContentA'
            },
            count: {
                type: Number,
                default: 1
            }
        },
        data() {
            return {
                name: this.contentName,
                cnt: this.count
            }
        },
        methods: {
            btnClick() {
                this.cnt += 1;
            }
        },
        mounted() {
        }
    }
</script>

<style scoped>
</style>
