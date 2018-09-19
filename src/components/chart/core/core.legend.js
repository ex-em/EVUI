export default class ChartLegend {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
    // false일 경우 생성 안됨.
    this.isShow = true;

    this.legendDOM = document.createElement('div');
    this.legendDOM.className = 'ev-chart-legend';
    this.resizeDOM = document.createElement('div');
    this.resizeDOM.className = 'ev-chart-resize-bar';
    this.resizeDOM.onmousedown = this.onMouseDown.bind(this);

    this.ghostDOM = document.createElement('div');
    this.ghostDOM.className = 'ev-chart-resize-ghost';

    this.mouseUp = this.onMouseUp.bind(this); // resizing function
    this.mouseMove = this.onMouseMove.bind(this); // resizing function

    this.resizeDOMSize = 4;
    this.resizePad = 2; // resize bar와 legend의 padding px

    this.legendWidth = 0;
    this.legendHeight = 20;

    this.legendCount = 0;
  }

  init() {
    this.createLegend();
    if (!this.isShow) {
      this.resizeDOM.style.display = 'none';
      this.legendDOM.style.display = 'none';
    }

    this.wrapperDOM.appendChild(this.resizeDOM);
    this.wrapperDOM.appendChild(this.legendDOM);

    this.setLegendPosition(this.chartOptions.legend.position);
  }

  createLegend() {
    const groups = this.groups;
    const seriesList = this.seriesList;
    const skey = Object.keys(seriesList);

    const calcSeriesWidthDOM = document.createElement('span');

    calcSeriesWidthDOM.setAttribute('style', 'visibility:hidden; position:absolute; top:-10000;');
    this.wrapperDOM.appendChild(calcSeriesWidthDOM);

    let series;

    if (groups.length) {
      for (let ix = 0, ixLen = groups.length; ix < ixLen; ix++) {
        const group = groups[ix];
        for (let jx = group.length - 1; jx >= 0; jx--) {
          series = seriesList[group[jx]];

          if (series.show) {
            this.createLegendDOM(series, group[jx], calcSeriesWidthDOM);
          }
        }
      }
    }

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = seriesList[skey[ix]];

      if (!series.isExistGrp && series.show) {
        this.createLegendDOM(series, skey[ix], calcSeriesWidthDOM);
      }
    }

    calcSeriesWidthDOM.remove();
  }

  createLegendDOM(seriesObj, sId, widthDOM) {
    const chartOpt = this.chartOptions;

    const legendOpt = chartOpt.legend;
    const position = legendOpt.position;
    const series = seriesObj;
    const calcSeriesWidthDOM = widthDOM;

    calcSeriesWidthDOM.textContent = series.name;
    const width = calcSeriesWidthDOM.clientWidth + 26; // 26 = color margin value.

    const legend = {
      containerDOM: document.createElement('div'),
      colorDOM: document.createElement('span'),
      nameDOM: document.createElement('div'),
      valueDOM: document.createElement('span'),
    };

    legend.containerDOM.className = 'ev-chart-legend-container';
    legend.colorDOM.className = 'ev-chart-legend-color';
    legend.nameDOM.className = 'ev-chart-legend-name';
    legend.nameDOM.style.color = legendOpt.color;
    legend.valueDOM.className = 'ev-chart-legend-value';
    legend.colorDOM.style.backgroundColor = series.color;

    legend.nameDOM.textContent = series.name;

    legend.nameDOM.setAttribute('title', series.name);

    legend.containerDOM.appendChild(legend.colorDOM);
    legend.containerDOM.appendChild(legend.nameDOM);
    legend.containerDOM.appendChild(legend.valueDOM);

    series.labelObj = legend;

    if (!series.show) {
      legend.containerDOM.style.display = 'none';
    } else {
      this.legendCount += 1;
    }

    this.legendWidth = Math.min(Math.max(width, this.legendWidth), 140);
    legend.containerDOM.style.lineHeight = `${this.legendHeight}px`;
    legend.containerDOM.style.cursor = this.chartOptions.type !== 'sunburst' ? 'pointer' : '';
    legend.containerDOM.addEventListener('click', this.onClickLegend.bind(this));
    legend.containerDOM.addEventListener('mouseover', this.onMouseOverLegend.bind(this));
    legend.containerDOM.addEventListener('mouseout', this.onMouseOutLegend.bind(this));
    legend.containerDOM.seriesId = sId;

    if (position === 'top' || position === 'bottom') {
      legend.containerDOM.style.display = 'inline-block';
    }

    this.legendDOM.appendChild(legend.containerDOM);
  }

  setLegendPosition(position) {
    const wrapperStyle = this.wrapperDOM.style;
    const chartDOMStyle = this.chartDOM.style;
    const legendDOMStyle = this.legendDOM.style;
    const resizeDOMStyle = this.resizeDOM.style;
    const titleHeight = this.chartOptions.title.show ? this.chartOptions.title.height : 0;
    const resizeTick = this.resizeDOMSize + this.resizePad;

    let topPadding;

    switch (position) {
      case 'top':
        topPadding = this.chartOptions.title.show ? `${titleHeight}px` : `${this.legendHeight}px`;
        wrapperStyle.padding = `${topPadding + resizeTick + 8}px 0 0 0`;

        chartDOMStyle.padding = `${this.legendHeight + resizeTick + 8}px 0 0 0`;
        this.overlayCanvas.style.top = `${this.legendHeight + resizeTick + 8}px`;

        legendDOMStyle.top = `${titleHeight}px`;
        legendDOMStyle.left = '0';
        legendDOMStyle.bottom = '';
        legendDOMStyle.right = '';
        legendDOMStyle.height = `${this.legendHeight + 8}px`;
        legendDOMStyle.lineHeight = `${this.legendHeight}px`;
        legendDOMStyle.width = '100%';
        legendDOMStyle.padding = '0 0 0 10px';

        resizeDOMStyle.width = '100%';
        resizeDOMStyle.height = `${this.resizeDOMSize}px`;
        resizeDOMStyle.left = '0';
        resizeDOMStyle.top = `${titleHeight + this.legendHeight + this.resizePad}px`;
        resizeDOMStyle.bottom = '';
        resizeDOMStyle.right = '';
        resizeDOMStyle.cursor = 'row-resize';
        break;
      case 'bottom':
        wrapperStyle.padding = `${titleHeight}px 0 0 0`;

        chartDOMStyle.padding = `0 0 ${this.legendHeight}px 0`;

        legendDOMStyle.top = '';
        legendDOMStyle.bottom = '0';
        legendDOMStyle.right = '';
        legendDOMStyle.left = '0';
        legendDOMStyle.height = `${this.legendHeight}px`;
        legendDOMStyle.lineHeight = `${this.legendHeight}px`;
        legendDOMStyle.width = '100%';
        legendDOMStyle.padding = '0 0 0 10px';

        resizeDOMStyle.width = '100%';
        resizeDOMStyle.height = `${this.resizeDOMSize}px`;
        resizeDOMStyle.left = '0';
        resizeDOMStyle.top = '';
        resizeDOMStyle.right = '';
        resizeDOMStyle.bottom = `${this.legendHeight}px`;
        resizeDOMStyle.cursor = 'row-resize';
        break;
      case 'left':
        chartDOMStyle.padding = `0 0 0 ${this.legendWidth}px`;
        this.overlayCanvas.style.left = `${this.legendWidth}px`;

        legendDOMStyle.top = `${titleHeight}px`;
        legendDOMStyle.bottom = '0';
        legendDOMStyle.right = '';
        legendDOMStyle.left = '0';
        legendDOMStyle.height = '100%';
        legendDOMStyle.width = `${this.legendWidth}px`;
        legendDOMStyle.padding = '0 0 0 10px';

        resizeDOMStyle.width = `${this.resizeDOMSize}px`;
        resizeDOMStyle.height = '100%';
        resizeDOMStyle.left = `${this.legendWidth + this.resizePad}px`;
        resizeDOMStyle.top = `${titleHeight}px`;
        resizeDOMStyle.cursor = 'col-resize';
        break;
      case 'right':
        chartDOMStyle.padding = `0 ${this.legendWidth + resizeTick}px 0 0`;

        legendDOMStyle.top = `${titleHeight}px`;
        legendDOMStyle.bottom = '';
        legendDOMStyle.right = '0';
        legendDOMStyle.left = '';
        legendDOMStyle.height = '100%';
        legendDOMStyle.width = `${this.legendWidth}px`;
        legendDOMStyle.padding = '0 0 0 0';
        legendDOMStyle.marginLeft = '2px';

        resizeDOMStyle.width = `${this.resizeDOMSize}px`;
        resizeDOMStyle.height = '100%';
        resizeDOMStyle.left =
          `${this.wrapperDOM.offsetWidth - this.legendWidth - resizeTick}px`;
        resizeDOMStyle.top = `${titleHeight}px`;
        resizeDOMStyle.cursor = 'col-resize';
        break;
      default:
        break;
    }
  }

  show() {
    this.isShow = true;
    this.legendDOM.style.display = 'block';
    this.setLegendPosition(this.chartOptions.legend.position);
  }

  hide() {
    this.isShow = false;
    this.legendDOM.style.display = 'none';
    this.legendDOM.style.paddingRight = '0';
    this.legendDOM.style.paddingTop = '0';
    this.legendDOM.style.paddingBottom = '0';
  }

  onMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();

    const position = this.chartOptions.legend.position;
    const ghostDOM = this.ghostDOM;

    const titleHeight = this.chartOptions.title.show ? this.chartOptions.title.height : 0;

    this.resizeDOM.style.display = 'none';
    this.wrapperDOM.appendChild(ghostDOM);

    // mouse down 시, resizeDOM의 위치를 기반으로 ghostDOM의 위치를 세팅
    if (position === 'left' || position === 'right') {
      ghostDOM.style.top = `${titleHeight}px`;
      ghostDOM.style.left = this.resizeDOM.style.left;
      ghostDOM.style.height = this.resizeDOM.style.height;
    } else {
      ghostDOM.classList.add('horizontal');

      if (position === 'top') {
        ghostDOM.style.top = this.resizeDOM.style.top;
      } else if (position === 'bottom') {
        ghostDOM.style.bottom = this.resizeDOM.style.bottom;
      }
    }

    this.wrapperDOM.addEventListener('mousemove', this.mouseMove, false);
    this.wrapperDOM.addEventListener('mouseup', this.mouseUp, false);
  }

  onMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();

    const offset = this.wrapperDOM.getBoundingClientRect();
    const offsetWidth = this.wrapperDOM.offsetWidth;
    const offsetHeight = this.wrapperDOM.offsetHeight;

    const titleHeight = this.chartOptions.title.show ? this.chartOptions.title.height : 0;
    const position = this.chartOptions.legend.position;

    const chartMinWidth = 150;
    const chartMinHeight = 70;

    const legendMinWidth = 80;
    const legendMinHeight = 20;

    let move;

    switch (position) {
      case 'left':
        move = e.clientX - offset.left;
        if (move < legendMinWidth) {
          move = legendMinWidth;
        } else if (move > offsetWidth - chartMinWidth) {
          move = offsetWidth - chartMinWidth;
        }
        this.ghostDOM.style.left = `${move}px`;
        break;
      case 'right':
        move = e.clientX - offset.left;
        if (move < chartMinWidth) {
          move = chartMinWidth;
        } else if (move > offsetWidth - legendMinWidth) {
          move = offsetWidth - legendMinWidth;
        }
        this.ghostDOM.style.left = `${move}px`;
        break;
      case 'top':
        move = e.clientY - offset.top;
        if (move < legendMinHeight + titleHeight) {
          move = legendMinHeight + titleHeight;
        } else if (move > offsetHeight - chartMinHeight) {
          move = offsetHeight - chartMinHeight;
        }
        this.ghostDOM.style.top = `${move}px`;
        break;
      case 'bottom':
        move = e.clientY - offset.top;
        if (move < chartMinHeight + titleHeight) {
          move = chartMinHeight + titleHeight;
        } else if (move > offsetHeight - legendMinHeight) {
          move = offsetHeight - legendMinHeight;
        }
        this.ghostDOM.style.bottom = `${this.wrapperDOM.offsetHeight - move}px`;
        break;
      default:
        break;
    }
  }

  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault();

    this.wrapperDOM.removeEventListener('mousemove', this.mouseMove, false);
    this.wrapperDOM.removeEventListener('mouseup', this.mouseUp, false);

    const position = this.chartOptions.legend.position;
    const resizeDOM = this.resizeDOM;
    const resizeDOMStyle = resizeDOM.style;
    const legendDOMStyle = this.legendDOM.style;
    const ghostDOM = this.ghostDOM;
    const chartDOMStyle = this.chartDOM.style;
    const resizeTick = this.resizeDOMSize + this.resizePad;
    const titleHeight = this.chartOptions.title.show ? this.chartOptions.title.height : 0;

    let move;

    switch (position) {
      case 'left':
        resizeDOMStyle.left = ghostDOM.style.left;
        move = +ghostDOM.style.left.replace('px', '');
        legendDOMStyle.width = `${move}px`;
        this.legendWidth = move;
        chartDOMStyle.padding = `0 0 0 ${move - this.resizePad}px`;
        break;
      case 'right':
        resizeDOMStyle.left = ghostDOM.style.left;
        move = +ghostDOM.style.left.replace('px', '');
        legendDOMStyle.width = `${(this.wrapperDOM.offsetWidth - move - resizeTick)}px`;
        this.legendWidth = this.wrapperDOM.offsetWidth - move - resizeTick;
        chartDOMStyle.padding = `0 ${this.wrapperDOM.offsetWidth - move}px 0 0`;
        break;
      case 'top':
        resizeDOMStyle.top = ghostDOM.style.top;
        move = +ghostDOM.style.top.replace('px', '');
        legendDOMStyle.height = `${move - titleHeight}px`;
        this.legendHeight = move - titleHeight - this.resizePad;
        chartDOMStyle.padding = `${(move - titleHeight) + this.resizeDOMSize}px 0 0 0`;
        break;
      case 'bottom':
        resizeDOMStyle.bottom = ghostDOM.style.bottom;
        move = this.wrapperDOM.offsetHeight - (+ghostDOM.style.bottom.replace('px', ''));
        legendDOMStyle.height = `${this.wrapperDOM.offsetHeight - move}px`;
        this.legendHeight = this.wrapperDOM.offsetHeight - move;
        chartDOMStyle.padding = `0 0 ${this.wrapperDOM.offsetHeight - move}px 0`;
        break;
      default:
        break;
    }

    this.resizeDOM.style.display = 'block';
    ghostDOM.remove();
    this.resize();
  }

  onClickLegend(e) {
    if (this.chartOptions.type === 'sunburst') {
      return;
    }
    const options = this.chartOptions.legend;
    const eventTargetDOM = e.currentTarget;
    const sId = eventTargetDOM.seriesId;
    const series = this.seriesList[sId];
    const colorDOM = eventTargetDOM.getElementsByClassName('ev-chart-legend-color')[0];
    const nameDOM = eventTargetDOM.getElementsByClassName('ev-chart-legend-name')[0];

    const isActive = !colorDOM.className.includes('inactive');

    if (isActive && this.legendCount === 1) {
      return;
    }

    if (isActive) {
      this.legendCount -= 1;
      colorDOM.style.backgroundColor = options.inactive;
      nameDOM.style.color = options.inactive;
    } else {
      this.legendCount += 1;
      colorDOM.style.backgroundColor = series.color;
      nameDOM.style.color = options.color;
    }

    colorDOM.classList.toggle('inactive');
    nameDOM.classList.toggle('inactive');
    series.show = !series.show;
    // series.highlight.show = !series.highlight.show;
    // this.overlayClear();
    this.updateChart();
  }

  onMouseOverLegend(e) {
    if (this.chartOptions.type !== 'sunburst') {
      e.target.style.fontWeight = 'bold';
    }

    const eventTargetDOM = e.currentTarget;
    const sId = eventTargetDOM.seriesId;
    const series = this.seriesList[sId];

    if (series.show && this.chartOptions.seriesHighlight) {
      this.overlayClear();
      this.seriesHighlight(sId);
    }
  }

  onMouseOutLegend(e) {
    if (this.chartOptions.type !== 'sunburst') {
      e.target.style.fontWeight = '';
    }

    this.overlayClear();
  }

  updateLegendPosition() {
    this.setLegendPosition(this.chartOptions.legend.position);
  }
}
