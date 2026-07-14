#!/usr/bin/env node
/* eslint-disable no-console -- CLI 검증 도구 */
/**
 * 대화형 API 문서(JSON) 스키마 검증기
 *
 * 사용법: npm run docs:validate  (= node scripts/validate-api-docs.js)
 * 대상:   docs/views/apiDocs/data/*.json
 *
 * 문서 스키마(SSOT 규약)를 코드로 고정한다. 대량 생산되는 컴포넌트 문서가
 * 이 게이트를 통과해야 머지할 수 있다. 규칙 변경 = 스키마 변경이므로
 * 이 파일 수정은 리뷰를 거칠 것.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(dirname, '..', 'docs', 'views', 'apiDocs', 'data');

const TOP_KEYS_REQUIRED = ['component', 'route', 'since', 'description', 'sections'];
const TOP_KEYS_OPTIONAL = ['examples', 'playground'];
const SECTION_KINDS = ['props', 'events', 'slots'];
const NODE_KEYS_REQUIRED = ['name', 'description'];
const NODE_KEYS_OPTIONAL = ['type', 'default', 'required', 'values', 'tryIt', 'children'];
const TRYIT_KEYS = ['data', 'options'];

const errors = [];
let checkedNodeCount = 0;

const err = (file, jsonPath, message) => {
  errors.push(`  [${file}] ${jsonPath}: ${message}`);
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** tryIt 스니펫은 JS 리터럴 문자열 — 실행하지 않고 파싱만으로 문법 검증 */
const isValidSnippet = (code) => {
  try {
    // eslint-disable-next-line no-new, no-new-func
    new Function('dayjs', `return (\n${code}\n)`);
    return true;
  } catch (e) {
    return false;
  }
};

function validateNode(file, node, jsonPath) {
  checkedNodeCount += 1;

  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    err(file, jsonPath, '노드는 객체여야 합니다.');
    return;
  }

  NODE_KEYS_REQUIRED.forEach((key) => {
    if (!isNonEmptyString(node[key])) {
      err(file, jsonPath, `필수 필드 '${key}'가 없거나 비어 있습니다.`);
    }
  });

  Object.keys(node).forEach((key) => {
    if (key === 'version') {
      err(file, jsonPath, "'version' 필드는 사용하지 않습니다 (스키마에서 제거됨).");
      return;
    }
    if (!NODE_KEYS_REQUIRED.includes(key) && !NODE_KEYS_OPTIONAL.includes(key)) {
      err(file, jsonPath, `알 수 없는 필드 '${key}'`);
    }
  });

  if ('type' in node && !isNonEmptyString(node.type)) {
    err(file, jsonPath, "'type'은 비어 있지 않은 문자열이어야 합니다.");
  }
  if ('default' in node && typeof node.default !== 'string') {
    err(file, jsonPath, "'default'는 문자열이어야 합니다 (예: \"'right'\", \"true\").");
  }
  if ('required' in node && node.required !== true) {
    err(file, jsonPath, "'required'는 필수일 때만 true로 표기하고, 아니면 필드를 생략합니다.");
  }
  if ('values' in node) {
    if (!Array.isArray(node.values) || !node.values.length) {
      err(file, jsonPath, "'values'는 비어 있지 않은 배열이어야 합니다.");
    } else if (!node.values.every(isNonEmptyString)) {
      err(file, jsonPath, "'values'의 모든 항목은 문자열이어야 합니다.");
    }
  }

  if ('tryIt' in node) {
    const tryIt = node.tryIt;
    if (typeof tryIt !== 'object' || tryIt === null || Array.isArray(tryIt)) {
      err(file, jsonPath, "'tryIt'은 { data?, options? } 객체여야 합니다.");
    } else {
      const keys = Object.keys(tryIt);
      if (!keys.length) err(file, jsonPath, "'tryIt'이 비어 있습니다.");
      keys.forEach((key) => {
        if (!TRYIT_KEYS.includes(key)) {
          err(file, jsonPath, `'tryIt.${key}'는 허용되지 않는 키입니다 (data/options만 가능).`);
        } else if (!isNonEmptyString(tryIt[key])) {
          err(file, jsonPath, `'tryIt.${key}'는 JS 리터럴 문자열이어야 합니다.`);
        } else if (!isValidSnippet(tryIt[key])) {
          err(file, jsonPath, `'tryIt.${key}' 스니펫에 JS 문법 오류가 있습니다.`);
        }
      });
    }
  }

  if ('children' in node) {
    if (!Array.isArray(node.children) || !node.children.length) {
      err(file, jsonPath, "'children'은 비어 있지 않은 배열이어야 합니다 (없으면 생략).");
    } else {
      const names = new Set();
      node.children.forEach((child, i) => {
        const childPath = `${jsonPath}.${child?.name ?? `children[${i}]`}`;
        if (child?.name) {
          if (names.has(child.name)) err(file, childPath, '형제 노드 간 name이 중복됩니다.');
          names.add(child.name);
        }
        validateNode(file, child, childPath);
      });
    }
  }
}

function validateDoc(file, doc) {
  TOP_KEYS_REQUIRED.forEach((key) => {
    if (!(key in doc)) err(file, '(root)', `필수 필드 '${key}'가 없습니다.`);
  });
  Object.keys(doc).forEach((key) => {
    if (!TOP_KEYS_REQUIRED.includes(key) && !TOP_KEYS_OPTIONAL.includes(key)) {
      err(file, '(root)', `알 수 없는 필드 '${key}'`);
    }
  });

  if ('route' in doc && !/^\//.test(doc.route)) {
    err(file, 'route', "'/'로 시작하는 경로여야 합니다.");
  }

  if ('examples' in doc) {
    if (!Array.isArray(doc.examples)) {
      err(file, 'examples', '배열이어야 합니다.');
    } else {
      doc.examples.forEach((ex, i) => {
        if (!isNonEmptyString(ex?.label) || !isNonEmptyString(ex?.route)) {
          err(file, `examples[${i}]`, '{ label, route } 형태여야 합니다.');
        }
      });
    }
  }

  if ('playground' in doc) {
    const pg = doc.playground;
    if (!isNonEmptyString(pg?.route) || !isNonEmptyString(pg?.example)) {
      err(file, 'playground', '{ route, example } 형태여야 합니다.');
    }
  }

  if (Array.isArray(doc.sections)) {
    if (!doc.sections.length) err(file, 'sections', '섹션이 하나 이상 필요합니다.');
    const kinds = new Set();
    doc.sections.forEach((section, i) => {
      const sPath = `sections[${i}]`;
      if (!SECTION_KINDS.includes(section?.kind)) {
        err(file, sPath, `kind는 ${SECTION_KINDS.join('/')} 중 하나여야 합니다.`);
      } else {
        if (kinds.has(section.kind)) err(file, sPath, `kind '${section.kind}' 중복`);
        kinds.add(section.kind);
      }
      if (!isNonEmptyString(section?.label)) err(file, sPath, 'label이 필요합니다.');
      if (!Array.isArray(section?.items) || !section.items.length) {
        err(file, sPath, 'items는 비어 있지 않은 배열이어야 합니다.');
        return;
      }
      const names = new Set();
      section.items.forEach((item, j) => {
        const iPath = `${section.kind}.${item?.name ?? `items[${j}]`}`;
        if (item?.name) {
          if (names.has(item.name)) err(file, iPath, '섹션 내 최상위 name이 중복됩니다.');
          names.add(item.name);
        }
        validateNode(file, item, iPath);
      });
    });
  } else if ('sections' in doc) {
    err(file, 'sections', '배열이어야 합니다.');
  }
}

// --- main --------------------------------------------------------------------
const files = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (!files.length) {
  console.error(`검증할 JSON이 없습니다: ${DATA_DIR}`);
  process.exit(1);
}

files.forEach((file) => {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    err(file, '(root)', `JSON 파싱 실패: ${e.message}`);
    return;
  }
  validateDoc(file, doc);
});

if (errors.length) {
  console.error(`✖ API 문서 스키마 검증 실패 — ${errors.length}건\n`);
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `✔ API 문서 스키마 검증 통과 — 파일 ${files.length}개, 노드 ${checkedNodeCount}개`,
);
