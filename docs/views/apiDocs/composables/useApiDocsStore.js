import { ref, computed, provide, inject, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import docRegistry from '../data';

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
  const componentKeys = Object.keys(docRegistry);
  const router = useRouter();

  /**
   * 컴포넌트 선택 트리. 기존 네비게이션 메뉴와 동일하게
   * 라우트의 meta.category 기준으로 그룹핑한다. (라우터가 SSOT)
   * 문서 JSON이 아직 없는 컴포넌트는 hasDoc: false 로 비활성 표시된다.
   */
  const componentTree = router
    .getRoutes()
    .filter((route) => route.meta?.category && route.meta.category !== 'Docs')
    .reduce((acc, route) => {
      const key = route.path.replace(/^\//, '');
      const item = { key, label: route.name, hasDoc: !!docRegistry[key] };
      const group = acc.find((g) => g.category === route.meta.category);
      if (group) {
        group.items.push(item);
      } else {
        acc.push({ category: route.meta.category, items: [item] });
      }
      return acc;
    }, []);

  // --- state ---------------------------------------------------------------
  const currentKey = ref(componentKeys[0]);
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
  const doc = computed(() => docRegistry[currentKey.value]);

  const flatNodes = computed(() => flattenDoc(doc.value));
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
   * 자식을 가진 노드(객체형)와 최상위 leaf가 각각 블록의 head가 되고,
   * head의 leaf 자식들은 블록 내부의 rows(컴팩트 행)로 묶인다.
   * 자식이 있는 자식(중첩 객체)은 DFS 순서상 뒤이어 자기 블록으로 렌더된다.
   */
  const visibleSections = computed(() =>
    doc.value.sections
      .map((section) => {
        const sectionNodes = flatNodes.value.filter(
          (n) => n.kind === section.kind && isVisible(n.id),
        );
        const blocks = sectionNodes
          .filter((n) => n.childIds.length || n.depth === 0)
          .map((head) => ({
            head,
            rows: head.childIds
              .map((id) => nodeMap.value.get(id))
              .filter((child) => !child.childIds.length && isVisible(child.id)),
          }));
        return { kind: section.kind, label: section.label, blocks };
      })
      .filter((section) => section.blocks.length));

  /** 사이드바 트리용: 섹션별 루트 노드 id 목록 */
  const sectionRoots = computed(() =>
    doc.value.sections
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
   * Examples 탭: JSON의 examples(관련 페이지)별로 해당 페이지에 실제로 있는
   * 예제 목록을 펼쳐서 보여준다. 목록의 SSOT는 각 페이지 라우트의
   * props(components) — docs/views/<component>/props.js 이다.
   */
  const exampleGroups = computed(() =>
    (doc.value.examples || []).map(({ label, route: path }) => {
      const record = router.getRoutes().find((r) => r.path === path);
      const components = record?.props?.default?.components || {};
      return {
        label,
        path,
        items: Object.entries(components).map(([name, def]) => ({
          name,
          description: def.description || '',
        })),
      };
    }));

  /**
   * Try It 패널용 플레이그라운드 예제.
   * JSON의 playground({ route, example })가 가리키는, chartData/chartOptions/
   * onApply를 노출하는 예제 컴포넌트를 라우트 props에서 해석한다.
   */
  const playgroundExample = computed(() => {
    const pg = doc.value.playground;
    if (!pg) return null;
    const record = router.getRoutes().find((r) => r.path === pg.route);
    const def = record?.props?.default?.components?.[pg.example];
    if (!def) return null;
    return { name: pg.example, component: markRaw(def.component) };
  });

  /** 선택된 예제의 렌더링 정보 (라우트 props에서 실시간 해석) */
  const selectedExample = computed(() => {
    if (!selectedExampleKey.value) return null;
    const { path, name, label } = selectedExampleKey.value;
    const record = router.getRoutes().find((r) => r.path === path);
    const def = record?.props?.default?.components?.[name];
    if (!def) return null;
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
    if (!docRegistry[key] || key === currentKey.value) return;
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
