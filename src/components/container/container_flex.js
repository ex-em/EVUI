export default class ContainerFlex {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }
  FlexWidth() {
    const flexTotalVal = this.flexTotalVal || 1; // 값이 없으면 1 셋팅
    const parentWidth = this.parentWidth || 0;
    const layout = this.layout || '';
    const flex = this.flex || 1;

    if (layout === 'hBox') {
    // 컨테이너 비율 넓이 값 계산
      let containerRatioWidth = parentWidth / flexTotalVal;
      containerRatioWidth = Math.floor(containerRatioWidth);
      // 컨테이너 안에 box flex 넓이 값 계산
      const flexWidth = containerRatioWidth * flex;

      return flexWidth;
    }
    return 0;
  }

  FlexHeight() {
    const flexTotalVal = this.flexTotalVal || 1; // 값이 없으면 1 셋팅
    const parentHeight = this.parentHeight || 0;
    const layout = this.layout || '';
    const flex = this.flex || 1;

    if (layout === 'vBox') {
      // 컨테이너 비율 높이 값 계산
      let containerRatioHeight = parentHeight / flexTotalVal;
      containerRatioHeight = Math.floor(containerRatioHeight);
      // 컨테이너 안에 box flex 높이 값 계산
      const flexHeight = containerRatioHeight * flex;

      return flexHeight;
    }
    return 0;
  }
}
