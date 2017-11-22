import Vue from 'vue';
import Router from 'vue-router';
import Main from './vue/Main.vue';
import GuideApp from './guide/GuideApp.vue';
import ComponentApp from './vue/ComponentApp.vue';
import Navi from './vue/Navigation.vue';
import Grid from './vue/grid/GridView.vue';
import Tree from './vue/tree/TreeView.vue';
import Chart from './vue/chartT/ChartView.vue';
import ChartTest from './vue/chartT/ChartTest2.vue';

import PerformanceApp from './test/PerformanceApp.vue';
import PerformanceTest from './test/PerformanceTest.vue';
import GridPerformnace from './test/GridPerformance.vue';
import TreePerformnace from './test/TreePerformance.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Main
        },
        {
            path: '/guide',
            component: GuideApp,
            children: [
                {
                    path: '',
                    component: GuideApp
                },
                {
                    path: ':contentName',
                    component: GuideApp
                }
            ]
        },
        {
            path: '/component',
            component: ComponentApp,
            props: true,
            children: [
                {
                    path: '',
                    component: Navi
                },
                {
                    path: 'grid',
                    component: Grid
                },
                {
                    path: 'tree',
                    component: Tree
                },
                {
                    path: 'chart',
                    component: Chart
                },
                {
                    path: 'chartTest',
                    component: ChartTest
                }
            ]
        },
        {
            path: '/test',
            component: PerformanceApp,
            props: true,
            children: [
                {
                    path: '',
                    component: PerformanceTest
                },
                {
                    path: 'grid',
                    component: GridPerformnace
                },
                {
                    path: 'tree',
                    component: TreePerformnace
                },
                {
                    path: 'chart',
                    component: Chart
                }
            ]
        }
    ],
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            // savedPosition은 오직 popstate 동작으로 가능
            return savedPosition;
        } else {
            let position = {};

            if (to.matched.length < 2) {
                // 만약 children 요소가 감지되지 않는다면 페이지 상단으로 스크롤
                position = { x: 0, y: 0 }
            }
            else if (to.matched.some((r) => r.components.default.options ? r.components.default.options.scrollToTop : true )) {
                // 어떤 자식요소가 scrollToTop 옵션으로 설정되어있다면 ( default: true )
                position = { x: 0, y: 0 }
            }
            if (to.hash) {
                // link가 anchor를 가지고 있을 경우, 반환된 선택자를 이용해 anchor로 이동합니다.
                position = { selector: to.hash }
            }

            return position;
        }
    }
});
