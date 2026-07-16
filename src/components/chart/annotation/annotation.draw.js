/* eslint-disable import/prefer-default-export */
import { Console } from '@/common/utils';
import Util from '../helpers/helpers.util';
import { resolveAnchor, buildContentContext, resolveContent } from './annotation.resolver';
import { computeLayout } from './annotation.layout';
import { renderAnnotation } from './annotation.renderer';

/**
 * 정규화된 어노테이션 배열을 캔버스에 그린다(resolve → layout → render 파이프라인).
 * 매 프레임 호출되므로 normalize 는 호출하지 않는다(옵션 변경 시 1회 정규화한 결과를 받는다).
 *
 * @param {object} ctx canvas 2d context (보통 series overlay/ buffer ctx)
 * @param {object[]} annotations normalizeAnnotations 로 정규화된 배열
 * @param {object} viewportCtx resolveAnchor 의 ctx — { chartRect, labelOffset, axes|axesSteps, seriesList }
 * @param {Function} [measureFn] 텍스트 측정 함수(테스트 주입용, 기본 Util.calcTextSizeCanvas)
 */
export function drawAnnotations(ctx, annotations, viewportCtx, measureFn = Util.calcTextSizeCanvas) {
  if (!ctx || !Array.isArray(annotations) || !annotations.length) {
    return;
  }

  // 입력 순서 = z-order(나중 항목이 위). 충돌 회피는 v1 범위 밖.
  annotations.forEach((ann) => {
    // 항목별 격리: 어노테이션 하나가 throw 해도 나머지·차트 렌더는 정상 진행한다.
    try {
      const anchor = resolveAnchor(ann, viewportCtx);
      if (!anchor.isVisible) {
        return; // 기준점이 viewport 밖 → 숨김(hide 정책)
      }
      const evalCtx = buildContentContext(ann, viewportCtx);
      const contentStr = ann.type === 'circle' ? '' : resolveContent(ann.content, evalCtx);
      const layout = computeLayout(ann, anchor, contentStr, measureFn);
      renderAnnotation(ctx, ann, layout, anchor);
    } catch (e) {
      Console.warn(`[EvChart] annotation render failed (id: ${ann && ann.id}):`, e);
    }
  });
}
