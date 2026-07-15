import { createRouter, createWebHistory } from 'vue-router';
import { kebabCase } from 'lodash-es';
import Intro from 'docs/views/Intro.vue';
import { PAGES } from 'docs/views/apiDocs/pages';

/**
 * 기존 컴포넌트 페이지(/lineChart 등) → 대화형 문서(/api-docs/<key>) 리다이렉트.
 * 구 페이지의 예제 앵커 링크(/lineChart#fill 등)는 예제 딥링크
 * (?example=Fill&exampleFrom=/lineChart)로 변환해 링크 호환성을 유지한다.
 */
const legacyRedirects = PAGES.map((entry) => ({
  path: entry.route,
  redirect: (to) => {
    const target = { path: `/api-docs/${entry.key}`, query: {}, hash: '' };
    const anchor = to.hash ? to.hash.slice(1) : '';
    if (anchor) {
      const exampleName = Object.keys(entry.page.components || {}).find(
        (name) => kebabCase(name) === anchor,
      );
      if (exampleName) {
        target.query = { example: exampleName, exampleFrom: entry.route };
      }
    }
    return target;
  },
}));

const routes = [
  {
    path: '/',
    redirect: '/api-docs',
  },
  {
    path: '/intro',
    name: 'Intro',
    component: Intro,
  },
  ...legacyRedirects,
  {
    path: '/api-docs/:component?',
    name: 'API Docs',
    component: () => import('../views/apiDocs/ApiDocsPage.vue'),
  },
  {
    path: '/:catchAll(.*)',
    name: 'PageNotFound',
    component: () => import('../views/PageNotFound'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // api-docs는 패널 내부 스크롤을 사용하므로 window 스크롤만 초기화한다.
    return { top: 0 };
  },
});

export default router;
