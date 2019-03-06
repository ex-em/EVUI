const module = {
  initLegend() {
    const groups = this.data.groups;
    const seriesList = this.seriesList;
    // event delegation
    this.legendBoxDOM.addEventListener('click', (e) => {
      const opt = this.options.legend;
      const type = e.target.evcType;

      let targetDOM;
      if (type === 'container') {
        targetDOM = e.target;
      } else if (type === 'name' || type === 'color') {
        targetDOM = e.target.parentElement;
      } else {
        return;
      }

      const colorDOM = targetDOM.getElementsByClassName('ev-chart-legend-color')[0];
      const nameDOM = targetDOM.getElementsByClassName('ev-chart-legend-name')[0];
      const isActive = !colorDOM.className.includes('inactive');
      const series = nameDOM.series;

      if (isActive && this.showSeriesInfo.count === 1) {
        return;
      }

      if (isActive) {
        this.showSeriesInfo.count--;
        colorDOM.style.backgroundColor = opt.inactive;
        nameDOM.style.color = opt.inactive;
      } else {
        this.showSeriesInfo.count++;
        colorDOM.style.backgroundColor = series.color;
        nameDOM.style.color = opt.color;
      }

      series.show = !series.show;
      colorDOM.classList.toggle('inactive');
      nameDOM.classList.toggle('inactive');
      this.update();
    });

    this.resizeDOM.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const opt = this.options;
      const pos = opt.legend.position;
      const title = opt.title.show ? opt.title.height : 0;

      const ghostDOM = this.ghostDOM;
      this.resizeDOM.style.display = 'none';
      this.wrapperDOM.appendChild(ghostDOM);

      // mouse down 시, resizeDOM의 위치를 기반으로 ghostDOM의 위치를 세팅
      if (pos === 'left' || pos === 'right') {
        ghostDOM.style.top = `${title}px`;
        ghostDOM.style.left = this.resizeDOM.style.left;
        ghostDOM.style.height = this.resizeDOM.style.height;
      } else {
        ghostDOM.classList.add('horizontal');

        if (pos === 'top') {
          ghostDOM.style.top = this.resizeDOM.style.top;
        } else if (pos === 'bottom') {
          ghostDOM.style.bottom = this.resizeDOM.style.bottom;
        }
      }

      this.wrapperDOM.addEventListener('mousemove', this.mouseMove, false);
      this.wrapperDOM.addEventListener('mouseup', this.mouseUp, false);
    });

    this.mouseMove = this.onMouseMove.bind(this); // resizing function
    this.mouseUp = this.onMouseUp.bind(this); // resizing function

    if (groups.length) {
      groups.forEach((group) => {
        group.slice().reverse().forEach((series) => {
          this.addLegend(seriesList[series]);
        });
      });
    }

    Object.values(seriesList).forEach((series) => {
      if (!series.isExistGrp) {
        this.addLegend(series);
      }
    });
  },
  addLegend(series) {
    const opt = this.options.legend;
    const containerDOM = document.createElement('div');
    const colorDOM = document.createElement('span');
    const nameDOM = document.createElement('div');

    containerDOM.className = 'ev-chart-legend-container';
    colorDOM.className = 'ev-chart-legend-color';
    nameDOM.className = 'ev-chart-legend-name';

    nameDOM.series = series;

    colorDOM.style.backgroundColor = series.color;
    colorDOM.evcType = 'color';
    nameDOM.style.color = opt.color;
    // nameDOM.style.width = `${opt.width - 48}px`; // y-scroll width + left margin
    // nameDOM.style.padding = '0 48px 0 0';
    nameDOM.textContent = series.name;
    nameDOM.setAttribute('title', series.name);
    nameDOM.evcType = 'name';

    this.legendDOM.style.padding = '0 0 0 0';

    containerDOM.appendChild(colorDOM);
    containerDOM.appendChild(nameDOM);
    // containerDOM.style.width = `${opt.width - 32}px`; // 24 y-scroll width

    if (opt.position === 'top' || opt.position === 'bottom') {
      containerDOM.style.width = `${opt.width - 8}px`;
      containerDOM.style.margin = '0 4px';
    } else {
      containerDOM.style.width = '100%';
    }
    containerDOM.style.height = `${opt.height - 4}px`;
    containerDOM.style.display = 'inline-block';
    containerDOM.evcType = 'container';

    this.legendBoxDOM.appendChild(containerDOM);
    this.showSeriesInfo.count++;
  },
  setLegendPosition(position) {
    const opt = this.options;
    const wrapperStyle = this.wrapperDOM.style;
    const legendStyle = this.legendDOM.style;
    const boxStyle = this.legendBoxDOM.style;
    const resizeStyle = this.resizeDOM.style;


    let chartRect;
    const title = opt.title.show ? opt.title.height : 0;
    const top = title + opt.legend.height;

    switch (position) {
      case 'top':
        wrapperStyle.padding = `${top}px 0 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height}px`;

        legendStyle.top = `${title}px`;
        legendStyle.right = '';
        legendStyle.bottom = '';
        legendStyle.left = '';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + 4}px`; // 4 resize bar size

        resizeStyle.top = `${top}px`;
        resizeStyle.right = '';
        resizeStyle.bottom = '';
        resizeStyle.left = '';

        resizeStyle.width = `${chartRect.width}px`;
        resizeStyle.height = '4px';
        resizeStyle.cursor = 'row-resize';
        break;
      case 'right':
        wrapperStyle.padding = `${title}px ${opt.legend.width}px 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = `${opt.legend.width - 10}px`; // legendDOM left padding
        boxStyle.height = `${chartRect.height}px`;

        legendStyle.paddingLeft = '10px';
        legendStyle.top = `${title}px`;
        legendStyle.right = '0px';
        legendStyle.bottom = '';
        legendStyle.left = '';

        legendStyle.width = `${opt.legend.width}px`;
        legendStyle.height = `${chartRect.height}px`;

        resizeStyle.top = `${title}px`;
        resizeStyle.right = `${opt.legend.width}px`;
        resizeStyle.bottom = '';
        resizeStyle.left = '';

        resizeStyle.width = '4px';
        resizeStyle.height = `${chartRect.height}px`;
        resizeStyle.cursor = 'col-resize';
        break;
      case 'bottom':
        wrapperStyle.padding = `${title}px 0 ${opt.legend.height}px 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height}px`;

        legendStyle.top = '';
        legendStyle.right = '';
        legendStyle.bottom = '0px';
        legendStyle.left = '0px';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + 4}px`; // 4 resize bar size

        resizeStyle.top = '';
        resizeStyle.right = '';
        resizeStyle.bottom = `${opt.legend.height}px`;
        resizeStyle.left = '';

        resizeStyle.width = `${chartRect.width}px`;
        resizeStyle.height = '4px';
        resizeStyle.cursor = 'row-resize';
        break;
      case 'left':
        wrapperStyle.padding = `${title}px 0 0 ${opt.legend.width}px`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = `${opt.legend.width}px`;
        boxStyle.height = `${chartRect.height}px`;
        boxStyle.display = 'absolute';
        boxStyle.bottom = '0px';

        legendStyle.top = `${title}px`;
        legendStyle.right = '';
        legendStyle.bottom = '';
        legendStyle.left = '0px';

        legendStyle.width = `${opt.legend.width}px`;
        legendStyle.height = `${chartRect.height}px`;

        resizeStyle.top = `${title}px`;
        resizeStyle.right = '';
        resizeStyle.bottom = '';
        resizeStyle.left = `${opt.legend.width}px`;

        resizeStyle.width = '4px';
        resizeStyle.height = `${chartRect.height}px`;
        resizeStyle.cursor = 'col-resize';
        break;
      default:
        break;
    }
  },
  onMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();

    const offset = this.wrapperDOM.getBoundingClientRect();
    const offsetWidth = this.wrapperDOM.offsetWidth;
    const offsetHeight = this.wrapperDOM.offsetHeight;

    const titleHeight = this.options.title.show ? this.options.title.height : 0;
    const position = this.options.legend.position;

    const chartMinWidth = 150;
    const chartMinHeight = 70;

    const legendMinWidth = 120;
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
  },
  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault();

    this.wrapperDOM.removeEventListener('mousemove', this.mouseMove, false);
    this.wrapperDOM.removeEventListener('mouseup', this.mouseUp, false);

    const opt = this.options;
    const pos = opt.legend.position;
    const resizeDOMStyle = this.resizeDOM.style;
    const legendDOMStyle = this.legendDOM.style;
    const boxDOMStyle = this.legendBoxDOM.style;
    const ghostDOMStyle = this.ghostDOM.style;
    const wrapperDOMStyle = this.wrapperDOM.style;

    const title = opt.title.show ? opt.title.height : 0;
    let move;

    switch (pos) {
      case 'top':
        resizeDOMStyle.top = ghostDOMStyle.top;
        move = +ghostDOMStyle.top.replace('px', '');
        legendDOMStyle.height = `${move - title}px`;
        boxDOMStyle.height = `${move - title - 4}px`;
        opt.legend.height = move - title - 4;
        wrapperDOMStyle.padding = `${move}px 0 0 0`;
        break;
      case 'right':
        resizeDOMStyle.left = ghostDOMStyle.left;
        move = +ghostDOMStyle.left.replace('px', '');
        legendDOMStyle.width = `${(this.wrapperDOM.offsetWidth - move - 4)}px`;
        boxDOMStyle.width = `${(this.wrapperDOM.offsetWidth - move - 4)}px`;
        opt.legend.width = this.wrapperDOM.offsetWidth - move - 4;
        wrapperDOMStyle.padding = `${title}px ${this.wrapperDOM.offsetWidth - move}px 0 0`;
        break;
      case 'bottom':
        resizeDOMStyle.bottom = ghostDOMStyle.bottom;
        move = this.wrapperDOM.offsetHeight - (+ghostDOMStyle.bottom.replace('px', ''));
        legendDOMStyle.height = `${this.wrapperDOM.offsetHeight - move}px`;
        boxDOMStyle.height = `${move - title - 4}px`;
        opt.legend.height = this.wrapperDOM.offsetHeight - move;
        wrapperDOMStyle.padding = `${title}px 0 ${this.wrapperDOM.offsetHeight - move}px 0`;
        break;
      case 'left':
        resizeDOMStyle.left = ghostDOMStyle.left;
        move = +ghostDOMStyle.left.replace('px', '');
        legendDOMStyle.width = `${move}px`;
        boxDOMStyle.width = `${move}px`;
        opt.legend.width = move;
        wrapperDOMStyle.padding = `${title}px 0 0 ${move - 4}px`;
        break;
      default:
        break;
    }

    resizeDOMStyle.display = 'block';
    this.ghostDOM.remove();
    this.render();
  },
};

export default module;
