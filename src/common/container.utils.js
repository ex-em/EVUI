const Utils = {
  /**
   *  숫자 인지 %값인지 체크
   * @param gData
   * @returns {*}
   */
 styleSizeValue(gData) {
    if (typeof gData === 'number') {
      return gData;
    } else if (gData.match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/)) {
      // .match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
      return gData;
    }
    throw new Error('[EVUI][ERROR] - styleData');
  },
/**
 * width/ height px 값넣으면 숫자 , 단위 분리해여 리턴
 */
  quantity(input) {
    let output;
    if (typeof input === 'string' || typeof input === 'number') {
      const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
      output = match ? { value: +match[2], unit: match[3] || undefined } : null;
    } else {
      output = null;
    }
    return output;
  },

/** *
 *  예외처리 함수
 */
_throw(type, content, component) {
  const upperCaseType = type.toUpperCase();
  switch (upperCaseType) {
    case 'ERROR':
      console.error(`[EVUI][${type}][${component}] - ${content}`); // eslint-disable-line
      break;
    // throw new Error(`[EVUI][${type}][${component}] - ${content}`);
    case 'WARN':
      console.warn(`[EVUI][${type}][${component}] - ${content}`); // eslint-disable-line
      break;
    // throw new Error(`[EVUI][${type}][${component}] - ${content}`);
    case 'INFO':
      console.info(`[EVUI][${type}][${component}] - ${content}`); // eslint-disable-line
      break;
    // throw new Error(`[EVUI][${type}][${component}] - ${content}`);
    // log
    default :
      console.log(`[EVUI][${type}][${component}] - ${content}`); // eslint-disable-line
      // throw new Error(`[EVUI][${type}][${component}] - ${content}`);
  }
},
matchesSelectorToParentElements(el, selector, baseNode) {
    let node = el;
    // 타겟 대상자 존제 유무 체크
    do {
      if (node.matches(selector)) return true;
      if (node === baseNode) return false;
      node = node.parentNode;
    } while (node);

    return false;
  },

};
export default Utils;
