<template>
    <div class="ContentB">
        <h1>B</h1>

        <div>
            {{ name +' / count: '+ cnt }}
        </div>

        <div>
            <button @click="btnClick()">B Count++</button>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            contentName: {
                type: String,
                default: 'ContentB'
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
