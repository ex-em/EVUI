const module = {
  initTitle() {
    const opt = this.options.title;
    Object.keys(opt.style).forEach((key) => {
      this.titleDOM.style[key] = opt.style[key];
    });

    this.titleDOM.textContent = opt.text;
    this.titleDOM.style.height = `${opt.height}px`;
    this.titleDOM.style.lineHeight = `${opt.height}px`;
  },
  showTitle() {
    this.titleDOM.style.display = 'block';
    this.wrapperDOM.style.paddingTop = `${this.options.title.height}px`;
  },
  hideTitle() {
    this.titleDOM.style.display = 'none';
    this.wrapperDOM.style.paddingTop = '0px';
  },
};

export default module;
