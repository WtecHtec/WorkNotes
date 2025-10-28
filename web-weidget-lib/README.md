# 打包前端组件


```
yarn 

```
全部打包

```
yarn build:all
```

单个打包

```
yarn build:filter**
```

# 样式隔离
1. main.module.css 

```
improt styleName form 'main.module.css '

 <div className={styleName.filter_container}></div
```

2. ShadowDom

```
  this._shadow = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    this._shadow.adoptedStyleSheets = [...this._shadow.adoptedStyleSheets, sheet];
```

3. prefix 前缀