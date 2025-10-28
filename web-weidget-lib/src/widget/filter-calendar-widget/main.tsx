import { h, render } from 'preact';
import FilterCalendarWidget from './FilterCalendarWidget';
import { IFilterItem, IFilterProp } from './types';
import '@/widget/styles/tailwind.css';
class FilterCalendarWidgetElement extends HTMLElement {
  private _shadow: ShadowRoot;
  private _mounted = false;
  private props: IFilterProp = {
    title: '选择',
  };

  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' }); // 创建 shadow root
    // const style = document.createElement('style');
    // style.textContent = cssText;
    // this._shadow.appendChild(style);
  }

  // 对外提供的方法
  // --------------------------
  initRender(props?: Partial<IFilterProp>) {
    if (this._mounted) return; // 避免重复挂载
    this._mounted = true;

    // 合并属性
    this.props = {
      ...this.props,
      title: this.getAttribute('title') || '',
      onChange: (val: IFilterItem) => {
        this.dispatchEvent(
          new CustomEvent('filter-change', {
            detail: { category: val },
            bubbles: true,
            composed: true,
          })
        );
      },
      ...props,
    };


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
  updateProps(newProps: Partial<IFilterProp>) {
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
