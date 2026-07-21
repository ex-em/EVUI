import { ref, computed, provide, inject, markRaw, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import docRegistry from '../data';
import { PAGES, pageByKey, pageByRoute, isExampleVisible } from '../pages';

const STORE_KEY = Symbol('api-docs-store');

/**
 * JSON 문서를 평탄화(flatten)한다.
 * 모든 노드는 `kind:path` 형태의 고유 id를 갖고, DFS 순서로 배열에 담긴다.
 * 이 순서가 곧 센터 패널의 렌더링/스크롤 스파이 순서가 된다.
 */
function flattenDoc(doc) {
  const nodes = [];
  const walk = (item, kind, parentId, depth, parentPath) => {
    const path = parentPath ? `${parentPath}.${item.name}` : item.name;
    const id = `${kind}:${path}`;
    const node = {
      id,
      kind,
      name: item.name,
      path,
      depth,
      parentId,
      type: item.type,
      default: item.default,
      required: item.required || false,
      version: item.version,
      description: item.description,
      values: item.values || [],
      // Try It 설정: { data?, options? } 스니펫(행에 버튼 노출) | false(버튼 숨김) | null(기본)
      tryIt: item.tryIt === undefined ? null : item.tryIt,
      childIds: [],
    };
    nodes.push(node);
    (item.children || []).forEach((child) => {
      node.childIds.push(walk(child, kind, id, depth + 1, path));
    });
    return id;
  };
  doc.sections.forEach((section) => {
    section.items.forEach((item) => walk(item, section.kind, null, 0, ''));
  });
  return nodes;
}

export function createApiDocsStore() {
  const router = useRouter();

  /**
   * 컴포넌트 선택 트리. 페이지 레지스트리(PAGES) 기준으로 카테고리 그룹핑한다.
   * 문서 JSON이 있는 컴포넌트는 대화형 문서를, 없는 컴포넌트는 기존 md를
   * 센터 패널에 표시한다(hasDoc으로 구분, 전 항목 선택 가능).
   */
  const componentTree = PAGES.reduce((acc, entry) => {
    const item = { key: entry.key, label: entry.label, hasDoc: !!docRegistry[entry.key] };
    const group = acc.find((g) => g.category === entry.category);
    if (group) {
      group.items.push(item);
    } else {
      acc.push({ category: entry.category, items: [item] });
    }
    return acc;
  }, []);

  // --- state ---------------------------------------------------------------
  const currentKey = ref('lineChart');
  const activeTab = ref('docs'); // 'docs' | 'examples'
  const query = ref('');
  const activeId = ref(null);
  const expandedIds = ref(new Set());
  const tryItId = ref(null);
  // 트리 클릭 → 센터 패널 스크롤 요청 (ts로 동일 id 재요청 구분)
  const scrollRequest = ref(null);
  // 트리 클릭 직후 센터 패널에서 잠깐(3초) 하이라이트할 노드
  const flashId = ref(null);
  let flashTimer = null;
  const FLASH_MS = 3000;
  // Examples 탭에서 선택한 예제 { path, name, label } — 선택 시 센터 패널이 예제 뷰로 전환
  const selectedExampleKey = ref(null);

  // --- derived -------------------------------------------------------------
  /** JSON 문서 (없으면 null → 센터 패널이 기존 md 폴백을 렌더링) */
  const doc = computed(() => docRegistry[currentKey.value] || null);
  /** 페이지 레지스트리 항목 (md/예제/라벨의 소스) */
  const currentPage = computed(() => pageByKey[currentKey.value]);

  const flatNodes = computed(() => (doc.value ? flattenDoc(doc.value) : []));
  const nodeMap = computed(() => new Map(flatNodes.value.map((n) => [n.id, n])));

  /**
   * 검색 필터. 매칭 노드의 [자기 자신 + 하위 전체 + 조상 경로]를 노출한다.
   * null 이면 전체 노출.
   */
  const visibleIdSet = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return null;

    const map = nodeMap.value;
    const visible = new Set();
    const addSubtree = (id) => {
      if (visible.has(id)) return;
      visible.add(id);
      map.get(id).childIds.forEach(addSubtree);
    };

    flatNodes.value.forEach((node) => {
      const matched =
        node.name.toLowerCase().includes(q) ||
        node.path.toLowerCase().includes(q) ||
        (node.description || '').toLowerCase().includes(q);
      if (!matched) return;
      addSubtree(node.id);
      let pid = node.parentId;
      while (pid && !visible.has(pid)) {
        visible.add(pid);
        pid = map.get(pid).parentId;
      }
    });
    return visible;
  });

  const isVisible = (id) => !visibleIdSet.value || visibleIdSet.value.has(id);
  const isSearching = computed(() => !!query.value.trim());

  /**
   * 센터 패널용: 섹션별 그룹(블록) 목록.
   * 카드(블록)는 최상위 노드와 depth-1 객체 그룹까지만 만들고,
   * 그보다 깊은 중첩 객체(예: options.title.style)는 별도 카드로 분리하지 않고
   * depth-1 카드 내부의 rows에 들여쓰기된 행으로 합쳐서 렌더링한다.
   */
  const visibleSections = computed(() =>
    (doc.value?.sections || [])
      .map((section) => {
        const sectionNodes = flatNodes.value.filter(
          (n) => n.kind === section.kind && isVisible(n.id),
        );

        /** head 하위의 모든 보이는 자손을 DFS 순서로 수집 (중첩 객체 포함) */
        const collectDescendants = (head) => {
          const rows = [];
          const walk = (id) => {
            const child = nodeMap.value.get(id);
            if (!isVisible(child.id)) return;
            rows.push(child);
            child.childIds.forEach(walk);
          };
          head.childIds.forEach(walk);
          return rows;
        };

        const blocks = sectionNodes
          .filter((n) => n.depth === 0 || (n.depth === 1 && n.childIds.length))
          .map((head) => ({
            head,
            rows:
              head.depth === 0
                ? // 최상위 카드: leaf 자식만 (객체 자식은 자기 카드를 가진다)
                  head.childIds
                    .map((id) => nodeMap.value.get(id))
                    .filter((child) => !child.childIds.length && isVisible(child.id))
                : // depth-1 카드: 중첩 객체를 포함한 전체 자손
                  collectDescendants(head),
          }));
        return { kind: section.kind, label: section.label, blocks };
      })
      .filter((section) => section.blocks.length));

  /** 사이드바 트리용: 섹션별 루트 노드 id 목록 */
  const sectionRoots = computed(() =>
    (doc.value?.sections || [])
      .map((section) => ({
        kind: section.kind,
        label: section.label,
        rootIds: flatNodes.value
          .filter((n) => n.kind === section.kind && n.depth === 0 && isVisible(n.id))
          .map((n) => n.id),
      }))
      .filter((section) => section.rootIds.length));

  /** 스크롤 스파이 순서(= 센터 패널 렌더 순서: 블록 head → 블록 rows) */
  const orderedVisibleIds = computed(() =>
    visibleSections.value.flatMap((section) =>
      section.blocks.flatMap((block) => [block.head.id, ...block.rows.map((row) => row.id)])));

  const tryItNode = computed(() => (tryItId.value ? nodeMap.value.get(tryItId.value) : null));

  /**
   * Examples 탭: 관련 페이지별로 해당 페이지에 실제로 있는 예제 목록을 보여준다.
   * 관련 페이지는 JSON의 examples가 정의하고, JSON이 없는(md 폴백) 컴포넌트는
   * 자기 페이지 하나가 그룹이 된다. 예제 데이터의 SSOT는 페이지 레지스트리
   * (docs/views/<component>/props.js의 components)이다.
   */
  const exampleGroups = computed(() => {
    const page = currentPage.value;
    const groups =
      doc.value?.examples || (page ? [{ label: page.label, route: page.route }] : []);
    return groups.map(({ label, route: path }) => {
      const components = pageByRoute[path]?.page?.components || {};
      return {
        label,
        path,
        items: Object.entries(components)
          // 대외용 모드에서는 devOnly 예제 숨김 (dev_docs 모드에서만 노출)
          .filter(([, def]) => isExampleVisible(def))
          .map(([name, def]) => ({
            name,
            description: def.description || '',
            devOnly: !!def.devOnly,
          })),
      };
    });
  });

  /**
   * Try It 패널용 플레이그라운드 예제.
   * JSON의 playground({ route, example, tag? })가 가리키는, chartData/chartOptions/
   * onApply를 노출하는 예제 컴포넌트를 페이지 레지스트리에서 해석한다.
   * tag는 패널이 직접 렌더링할 컴포넌트 태그(기본 'ev-chart')이다.
   */
  const playgroundExample = computed(() => {
    const pg = doc.value?.playground;
    if (!pg) return null;
    const def = pageByRoute[pg.route]?.page?.components?.[pg.example];
    if (!def) return null;
    return { name: pg.example, component: markRaw(def.component), tag: pg.tag || 'ev-chart' };
  });

  /** 선택된 예제의 렌더링 정보 (페이지 레지스트리에서 실시간 해석) */
  const selectedExample = computed(() => {
    if (!selectedExampleKey.value) return null;
    const { path, name, label } = selectedExampleKey.value;
    const def = pageByRoute[path]?.page?.components?.[name];
    // 대외용 모드에서 devOnly 예제는 딥링크로도 열리지 않게 차단
    if (!def || !isExampleVisible(def)) return null;
    return {
      name,
      label,
      description: def.description || '',
      component: markRaw(def.component),
      parsedData: def.parsedData,
    };
  });

  // --- actions ---------------------------------------------------------------
  const getNode = (id) => nodeMap.value.get(id);

  // 검색 중에는 매칭 구조를 그대로 보여주기 위해 강제로 전체 펼침 처리
  const isExpanded = (id) => isSearching.value || expandedIds.value.has(id);

  const toggleExpand = (id) => {
    const next = new Set(expandedIds.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedIds.value = next;
  };

  const expandAncestors = (id) => {
    const next = new Set(expandedIds.value);
    let pid = getNode(id)?.parentId;
    while (pid) {
      next.add(pid);
      pid = getNode(pid).parentId;
    }
    expandedIds.value = next;
  };

  /** Examples 탭에서 예제 선택: 센터 패널이 예제 뷰로 전환된다 */
  const selectExample = (path, name, label) => {
    selectedExampleKey.value = { path, name, label };
  };
  const clearExample = () => {
    selectedExampleKey.value = null;
    // 예제 뷰를 닫으면 센터는 API 문서로 돌아가므로 사이드바 탭도 함께 맞춘다
    activeTab.value = 'docs';
  };

  /** 트리에서 클릭: active 지정 + 센터 패널 스크롤 요청 (예제 뷰는 닫는다) */
  const selectNode = (id) => {
    selectedExampleKey.value = null;
    activeId.value = id;
    expandAncestors(id);
    if (getNode(id)?.childIds.length && !expandedIds.value.has(id)) {
      toggleExpand(id);
    }
    scrollRequest.value = { id, ts: Date.now() };
    // 도착 위치 인지용 하이라이트 — 잠깐 보여주고 지운다
    flashId.value = id;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashId.value = null;
    }, FLASH_MS);
  };

  /** 센터 패널 스크롤 스파이에서 호출: 트리 하이라이트만 갱신 */
  const setActiveFromScroll = (id) => {
    if (!id || activeId.value === id) return;
    activeId.value = id;
    expandAncestors(id);
  };

  const setComponent = (key) => {
    if (!pageByKey[key] || key === currentKey.value) return;
    currentKey.value = key;
    query.value = '';
    activeId.value = null;
    expandedIds.value = new Set();
    tryItId.value = null;
    scrollRequest.value = null;
    selectedExampleKey.value = null;
    flashId.value = null;
    clearTimeout(flashTimer);
  };

  const openTryIt = (id) => {
    tryItId.value = id;
  };
  const closeTryIt = () => {
    tryItId.value = null;
  };

  // --- URL ↔ 상태 동기화 ------------------------------------------------------
  // /api-docs/:component?example=<예제명>&exampleFrom=<예제 페이지 경로>
  // 새로고침·딥링크·뒤로가기에서 현재 컴포넌트/예제 뷰를 복원한다.
  const route = useRoute();

  const sameExampleKey = (a, b) =>
    (!a && !b) || (!!a && !!b && a.path === b.path && a.name === b.name);

  /** URL → 상태 (초기 진입, 뒤로/앞으로 가기) */
  const applyRoute = (to) => {
    const key = to.params.component;
    if (key && pageByKey[key]) {
      setComponent(key);
    }
    const { example, exampleFrom } = to.query;
    if (example && exampleFrom) {
      const next = {
        path: exampleFrom,
        name: example,
        label:
          (doc.value?.examples || []).find((e) => e.route === exampleFrom)?.label ||
          pageByRoute[exampleFrom]?.label ||
          '',
      };
      if (!sameExampleKey(selectedExampleKey.value, next)) {
        selectedExampleKey.value = next;
      }
      activeTab.value = 'examples';
    } else if (selectedExampleKey.value) {
      // URL에서 예제가 사라짐(뒤로가기 등) → 예제 뷰 닫힘과 함께 탭도 문서로
      selectedExampleKey.value = null;
      activeTab.value = 'docs';
    }
  };

  /** 상태 → URL */
  watch([currentKey, selectedExampleKey], ([key, exampleKey]) => {
    const current = router.currentRoute.value;
    if (current.name !== 'API Docs') return;
    const sameComponent = current.params.component === key;
    const sameExample =
      (current.query.example || null) === (exampleKey?.name || null) &&
      (current.query.exampleFrom || null) === (exampleKey?.path || null);
    if (sameComponent && sameExample) return;
    // 개발자용 모드 토글(?dev)은 네비게이션 간에도 URL에 보존해 공유 가능하게 한다
    const preserved = current.query.dev !== undefined
      ? { dev: current.query.dev }
      : {};
    router.push({
      name: 'API Docs',
      params: { component: key },
      query: exampleKey
        ? { ...preserved, example: exampleKey.name, exampleFrom: exampleKey.path }
        : preserved,
    });
  });

  /** URL → 상태 (popstate 등 외부 내비게이션) */
  watch(
    () => route.fullPath,
    () => {
      if (route.name !== 'API Docs') return;
      applyRoute(route);
    },
  );

  // 초기 진입: URL 복원 후, 파라미터 없는 진입은 정식 URL로 정규화
  applyRoute(route);
  if (route.name === 'API Docs' && route.params.component !== currentKey.value) {
    router.replace({
      name: 'API Docs',
      params: { component: currentKey.value },
      query: route.query,
    });
  }

  const store = {
    // state
    currentKey,
    activeTab,
    query,
    activeId,
    flashId,
    tryItId,
    scrollRequest,
    // derived
    doc,
    currentPage,
    componentTree,
    flatNodes,
    visibleSections,
    sectionRoots,
    orderedVisibleIds,
    tryItNode,
    playgroundExample,
    exampleGroups,
    selectedExampleKey,
    selectedExample,
    isSearching,
    // helpers & actions
    getNode,
    isVisible,
    isExpanded,
    toggleExpand,
    selectNode,
    selectExample,
    clearExample,
    setActiveFromScroll,
    setComponent,
    openTryIt,
    closeTryIt,
  };

  provide(STORE_KEY, store);
  return store;
}

export function useApiDocsStore() {
  const store = inject(STORE_KEY);
  if (!store) {
    throw new Error('useApiDocsStore()는 ApiDocsPage 하위에서만 사용할 수 있습니다.');
  }
  return store;
}
