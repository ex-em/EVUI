/**
 * EvChart 어노테이션/뱃지 모듈 공개 API.
 *
 * 사용 흐름:
 *   1) 옵션 변경 시 1회: const { annotations, warnings } = normalizeAnnotations(options.annotations)
 *   2) 매 렌더 프레임: drawAnnotations(ctx, annotations, viewportCtx)
 *
 * viewportCtx 계약:
 *   { chartRect: {x1,x2,y1,y2,chartWidth,chartHeight},
 *     labelOffset: {left,right,top,bottom},
 *     axes|axesSteps: { x:[AxisDescriptor], y:[AxisDescriptor] },
 *     seriesList: { [seriesId]: { name, data:[{x,y,xp,yp}] } } }
 */
export { normalizeAnnotations, normalizePadding } from './annotation.normalize';
export { drawAnnotations } from './annotation.draw';
export {
  resolveAnchor,
  resolveContent,
  buildContentContext,
  resolveLocationIndex,
} from './annotation.resolver';
export { computeLayout, computeBoxSize, measureContent } from './annotation.layout';
export { axisValueToPixel, normalizeAxisValue } from './annotation.axis';
export {
  ANNOTATION_TYPES,
  POSITION_TYPES,
  ANNOTATION_DEFAULT,
} from './annotation.constant';
