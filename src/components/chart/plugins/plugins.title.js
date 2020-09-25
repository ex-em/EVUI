const modules = {
  /**
   * Create title DOM
   *
   * @returns {undefined}
   */
  createTitle() {
    this.titleDOM = document.createElement('div');
    this.titleDOM.className = 'ev-chart-title';
    this.wrapperDOM.appendChild(this.titleDOM);
  },

  /**
   * Initialize title DOM
   *
   * @returns {undefined}
   */
  initTitle() {
    if (!this.isInitTitle) {
      this.createTitle();
    }

    const opt = this.options.title;
    Object.keys(opt.style).forEach((key) => {
      this.titleDOM.style[key] = opt.style[key];
    });

    this.titleDOM.textContent = opt.text;
    this.titleDOM.style.height = `${opt.height}px`;
    this.titleDOM.style.lineHeight = `${opt.height}px`;

    this.isInitTitle = true;
  },

  /**
   * show title DOM with manipulating css
   *
   * @returns {undefined}
   */
  showTitle() {
    this.titleDOM.style.display = 'block';
    this.wrapperDOM.style.paddingTop = `${this.options.title.height}px`;
  },

  /**
   * hide title DOM with manipulating css
   *
   * @returns {undefined}
   */
  hideTitle() {
    this.titleDOM.style.display = 'none';
    this.wrapperDOM.style.paddingTop = '0px';
  },
};

export default modules;
