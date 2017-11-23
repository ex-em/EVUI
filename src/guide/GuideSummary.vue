<template>
    <div class="guide-summary">
        <h1>여기는 Guide Summary View 입니다</h1>
        {{ evuiDesc }}
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                evuiDesc : `EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.
                       EVUI Grid와 Chart는 HTML/CSS/JS 및 SVG로 구현되어 있어 다양한 환경에 적용이 가능하며,
                       Vue.JS를 기반으로 구현되어 대량의 데이터를 고속으로 처리합니다.`
            }
        }
    }
</script>

<style scoped>
</style>