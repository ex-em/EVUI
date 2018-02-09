export default class ContainerFlex {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }
  FlexWidth() {
    const FlexTotalVal = this.FlexTotalVal || 1; // 값이 없으면 1 셋팅
    const parentWidth = this.parentWidth || 0;
    const layout = this.layout || '';
    const flex = this.flex || 1;

    if (layout === 'Hbox') {
    // 컨테이너 비율 넓이 값 계산
      let ContainerRatioWidth = parentWidth / FlexTotalVal;
      ContainerRatioWidth = Math.floor(ContainerRatioWidth);
      // 컨테이너 안에 box flex 넓이 값 계산
      const flexWidth = ContainerRatioWidth * flex;

      return flexWidth;
    }
    return 0;
  }

  FlexHeight() {
    const FlexTotalVal = this.FlexTotalVal || 1; // 값이 없으면 1 셋팅
    const parentHeight = this.parentHeight || 0;
    const layout = this.layout || '';
    const flex = this.flex || 1;

    if (layout === 'Vbox') {
      // 컨테이너 비율 높이 값 계산
      let ContainerRatioHeight = parentHeight / FlexTotalVal;
      ContainerRatioHeight = Math.floor(ContainerRatioHeight);
      // 컨테이너 안에 box flex 높이 값 계산
      const flexHeight = ContainerRatioHeight * flex;

      return flexHeight;
    }
    return 0;
  }
}
