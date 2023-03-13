import { defaultsDeep } from 'lodash-es';
import { AXIS_OPTION } from '../helpers/helpers.constant';

const module = {
  /**
   * scroll bar 관련 정보 초기 세팅
   * @param axesX x축 옵션
   * @param axesY y축 옵션
   */
  initScrollbar(axesX, axesY) {
    if (axesX?.[0]?.scrollbar.use) {
      this.initScrollbarInfo(axesX, 'x');
    }

    if (axesY?.[0]?.scrollbar.use) {
      this.initScrollbarInfo(axesY, 'y');
    }
  },

  initScrollbarInfo(axisOpt, dir) {
    const scrollbarObj = dir === 'x' ? this.scrollbarX : this.scrollbarY;

    if (!scrollbarObj.init) {
      scrollbarObj.opt = defaultsDeep(axisOpt?.[0]?.scrollbar, AXIS_OPTION.scrollbar);
      scrollbarObj.range = axisOpt?.[0]?.range || null;
      this.createScrollbarLayout(dir);
      scrollbarObj.init = true;
    }
  },

  /**
   * scrollbar layout 생성
   * @param dir 축 방향 ('x' | 'y')
   */
  createScrollbarLayout(dir) {
    const scrollbarObj = dir === 'x' ? this.scrollbarX : this.scrollbarY;
    scrollbarObj.dom = document.createElement('div');
    scrollbarObj.dom.className = `ev-chart-scrollbar ev-chart-scrollbar-${dir}`;
    this.wrapperDOM.appendChild(scrollbarObj.dom);
  },

  /**
   * scroll bar 위치 설정
   */
  createScrollbar() {
    if (this.scrollbarX.use && this.scrollbarX.range) {
      const scrollbarDOM = this.scrollbarX.dom;
      const trackDOM = this.createScrollbarTrack(scrollbarDOM);
      if (this.scrollbarX.opt?.showButton) {
        this.createScrollbarButton(trackDOM);
      }
      this.createScrollbarThumb(trackDOM);
      this.setScrollbarPosition(scrollbarDOM, 'x');
    }

    if (this.scrollbarY.use && this.scrollbarY.range) {
      const scrollbarDOM = this.scrollbarY.dom;
      const trackDOM = this.createScrollbarTrack(scrollbarDOM);
      if (this.scrollbarX.opt?.showButton) {
        this.createScrollbarButton(trackDOM);
      }
      this.createScrollbarThumb(trackDOM);
      this.setScrollbarPosition(scrollbarDOM, 'y');
    }
  },

  createScrollbarTrack(scrollbarDOM) {
    const trackDOM = document.createElement('div');
    trackDOM.className = 'ev-chart-scrollbar-track';
    scrollbarDOM.appendChild(trackDOM);
    return trackDOM;
  },

  createScrollbarButton(trackDOM) {
    const upBtnDOM = document.createElement('div');
    upBtnDOM.className = 'ev-chart-scrollbar-button';
    const iconUpBtn = document.createElement('i');
    iconUpBtn.className = 'ev-icon ev-icon-triangle-up ev-chart-scrollbar-button-icon';
    upBtnDOM.appendChild(iconUpBtn);

    const downBtnDOM = document.createElement('div');
    downBtnDOM.className = 'ev-chart-scrollbar-button';
    const iconDownBtn = document.createElement('i');
    iconDownBtn.className = 'ev-icon ev-icon-triangle-down ev-chart-scrollbar-button-icon';
    downBtnDOM.appendChild(iconDownBtn);

    trackDOM.appendChild(iconDownBtn);
    trackDOM.appendChild(downBtnDOM);
  },

  createScrollbarThumb(containerDOM) {
    const thumbDOM = document.createElement('div');
    thumbDOM.className = 'ev-chart-scrollbar-thumb';
    containerDOM.appendChild(thumbDOM);
  },

  setScrollbarPosition() {

  },
};

export default module;
