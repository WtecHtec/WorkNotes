import { h, render } from 'preact';
import FilterCalendarWidget from './FilterCalendarWidget';
// import '@/widget/styles/tailwind.css';
import cssText from '@/widget/styles/tailwind.css?inline';
import { IFilterCalendarProps } from './types';
class FilterCalendarWidgetElement extends HTMLElement {
  private _root: HTMLDivElement | null = null;
  private _mounted = false;
  private props: IFilterCalendarProps = {
    showLable: '',
  };
  private _shadow: ShadowRoot;

  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    this._shadow.adoptedStyleSheets = [
      ...this._shadow.adoptedStyleSheets,
      sheet,
    ];
  }

  getTypes() {
    const types = this.getAttribute('types');
    try {
      const data = JSON.parse(types ?? '');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }
  // 对外提供的方法
  // --------------------------
  initRender(props?: Partial<IFilterCalendarProps>) {
    if (this._mounted) return; // 避免重复挂载
    this._mounted = true;

    // 合并属性
    this.props = {
      ...this.props,
      showLable: this.getAttribute('showLable') || '',
      type: this.getAttribute('type') || 'day',
      types: this.getTypes(),
      value: this.getAttribute('value') || new Date(),
      ...props,
    };
    // this._root = document.createElement('div');
    // this.appendChild(this._root);

    this._render();
  }
  connectedCallback() {
    const autoMountAttr = this.getAttribute('automount');
    if (autoMountAttr !== 'false') {
      this.initRender();
    }
  }

  disconnectedCallback() {
    this.unmount();
  }

  private _render() {
    if (!this._shadow) return;
    render(<FilterCalendarWidget {...this.props} />, this._shadow);
  }

  /** ✅ 对外暴露更新入参的函数 */
  updateProps(newProps: Partial<IFilterCalendarProps>) {
    this.props = { ...this.props, ...newProps };
    this._render();
  }

  unmount() {
    if (this._shadow) {
      render(null, this._shadow);
    }
    this._mounted = false;
  }
}

customElements.define('filter-calendar-widget', FilterCalendarWidgetElement);

// 自动挂载
// window.addEventListener('DOMContentLoaded', () => {
//   if (!document.querySelector('filter-widget')) {
//     document.body.prepend(document.createElement('filter-widget'));
//   }
// });
