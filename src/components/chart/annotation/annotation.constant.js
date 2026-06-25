/**
 * EvChart 어노테이션/뱃지 모듈 기본값(Default Config).
 *
 * 최상위 type(text/badge/callout/circle)별로 "그럴듯한" 외형을 미리 정의해 둔다.
 * 개발자가 type/content/position 만 넘겨도 deepMerge 후 완성도 있는 결과가 나오도록 하는 것이 목표다.
 *
 * padding 은 정규화 단계에서 항상 [top, right, bottom, left] 4-튜플로 변환된다.
 * 여기 정의된 [v, h] 2-튜플은 normalize 가 [v, h, v, h] 로 펼친다.
 */

export const ANNOTATION_TYPES = ['text', 'badge', 'callout', 'circle'];
export const POSITION_TYPES = ['axis', 'pixel', 'series'];
export const CONNECTOR_TYPES = ['straight', 'elbow'];
export const CALLOUT_ANCHORS = ['top', 'bottom', 'left', 'right', 'auto'];

/** position.type === 'series' 일 때 location 의 허용 키워드(number 는 별도 허용). */
export const SERIES_LOCATIONS = ['start', 'end'];

/** 모든 type 이 공유하는 position 기본값. */
export const POSITION_DEFAULT = {
  type: 'pixel',
  // axis
  xAxisIndex: 0,
  yAxisIndex: 0,
  xValue: null,
  yValue: null,
  // pixel (canvas 좌상단 0,0 기준 절대 좌표)
  x: 0,
  y: 0,
  // series
  seriesId: null,
  location: 'end',
  // 공통 오프셋
  offsetX: 0,
  offsetY: 0,
};

/** connector(연결선) 기본값. 기본 비활성. */
export const CONNECTOR_DEFAULT = {
  enabled: false,
  type: 'straight',
  style: {
    stroke: '#9E9E9E',
    strokeWidth: 1,
    dashStyle: 'solid',
  },
};

/** type 별 외형/스타일 기본값. style 하위로 모든 외형 속성을 대통합한다. */
export const ANNOTATION_DEFAULT = {
  text: {
    style: {
      color: '#212121',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      padding: [0, 0],
      fontSize: '11px',
      fontWeight: 'normal',
      textAlign: 'center',
    },
  },
  badge: {
    style: {
      color: '#8B2323',
      backgroundColor: '#FDF0F0',
      borderColor: '#B24C4C',
      borderWidth: 1,
      borderRadius: 6,
      padding: [6, 10],
      fontSize: '11px',
      fontWeight: 'normal',
      textAlign: 'center',
    },
  },
  callout: {
    // maxTip 말풍선과 동일한 외형: 작은 라운딩(4) + 짧고 통통한 꼬리(4) + 컴팩트 패딩.
    style: {
      anchor: 'auto',
      arrowSize: 4,
      color: '#212121',
      backgroundColor: '#FFFFFF',
      borderColor: '#B0B0B0',
      borderWidth: 1,
      borderRadius: 4,
      padding: [4, 8],
      fontSize: '11px',
      fontWeight: 'normal',
      textAlign: 'center',
    },
  },
  circle: {
    style: {
      radius: 10,
      backgroundColor: 'rgba(178, 76, 76, 0.15)',
      borderColor: '#B24C4C',
      borderWidth: 1,
    },
  },
};
