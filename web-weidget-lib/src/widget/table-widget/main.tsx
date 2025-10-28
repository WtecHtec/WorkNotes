import { render } from 'preact';
import TableWidget from './TableWidget';
import './TableWidget.css';
import { ITableProp } from './types';

class TableWidgetElement extends HTMLElement {
  private _root: HTMLDivElement | null = null;
  private _mounted = false;
  private props: ITableProp | any = {};

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  // 对外提供的方法
  // --------------------------
  initRender(props?: Partial<ITableProp>) {
    if (this._mounted) return; // 避免重复挂载
    this._mounted = true;

    // 合并属性
    this.props = {
      ...this.props,
      ...props,
    };

    this._root = document.createElement('div');
    this.appendChild(this._root);
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
    if (!this._root) return;
    render(<TableWidget {...this.props} />, this._root);
  }

  /** ✅ 对外暴露更新入参的函数 */
  updateProps(newProps: Partial<ITableProp>) {
    this.props = { ...this.props, ...newProps };
    this._render();
  }

  unmount() {
    if (this._root) {
      render(null, this._root);
    }
    this._mounted = false;
  }
}

customElements.define('table-widget', TableWidgetElement);

// 自动挂载
// window.addEventListener('DOMContentLoaded', () => {
//   if (!document.querySelector('filter-widget')) {
//     document.body.prepend(document.createElement('filter-widget'));
//   }
// });
