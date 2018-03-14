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
    throw new Error('[EVUI][ERROR][BoxPanel]-styleData');
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
};

export default Utils;
