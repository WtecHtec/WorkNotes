const g_atom_gather = [
  {
    "prefix": "at-ellipsis-lines",
    "name": "at-ellipsis-lines",
    "props": [
      {
        "prop": "overflow",
        "value": "hidden"
      },
      {
        "prop": "white-space",
        "value": "nowrap"
      },
      {
        "prop": "text-overflow",
        "value": "ellipsis"
      },
      {
        "prop": "word-break",
        "value": "break-all"
      },
      {
        "prop": "word-wrap",
        "value": "normal"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-ellipsis-lines",
      "单行文本省略",
      "属性详情如下:",
      ".at-ellipsis-lines: {",
      "  overflow: hidden;",
      "  white-space: nowrap;",
      "  text-overflow: ellipsis;",
      "  word-break: break-all;",
      "  word-wrap: normal;",
      "}"
    ]
  },
  {
    "prefix": "at-ellipsis-multi-lines",
    "name": "at-ellipsis-multi-lines",
    "props": [
      {
        "prop": "overflow",
        "value": "hidden"
      },
      {
        "prop": "text-overflow",
        "value": "ellipsis"
      },
      {
        "prop": "display",
        "value": "-webkit-box"
      },
      {
        "prop": "-webkit-box-orient",
        "value": "vertical"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-ellipsis-multi-lines",
      "多行文本省略,还需要额外添加属性",
      "webkit-line-clamp-*",
      "用来控制超出多少行省略",
      "属性详情如下:",
      ".at-ellipsis-multi-lines: {",
      "  overflow: hidden;",
      "  text-overflow: ellipsis;",
      "  display: -webkit-box;",
      "  -webkit-box-orient: vertical;",
      "}"
    ]
  },
  {
    "prefix": "at-line-full-after",
    "name": "at-line-full-after",
    "pseudo": "after",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "box-sizing",
        "value": "border-box"
      },
      {
        "prop": "width",
        "value": "200%"
      },
      {
        "prop": "height",
        "value": "200%"
      },
      {
        "prop": "transform-origin",
        "value": "left top"
      },
      {
        "prop": "transform",
        "value": "scale(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-full-after",
      "设置包裹的边框线条在 after 上",
      "(包裹的边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-full-after::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  box-sizing: border-box;",
      "  width: 200%;",
      "  height: 200%;",
      "  transform-origin: left top;",
      "  transform: scale(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-full-before",
    "name": "at-line-full-before",
    "pseudo": "before",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "box-sizing",
        "value": "border-box"
      },
      {
        "prop": "width",
        "value": "200%"
      },
      {
        "prop": "height",
        "value": "200%"
      },
      {
        "prop": "transform-origin",
        "value": "left top"
      },
      {
        "prop": "transform",
        "value": "scale(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-full-before",
      "设置包裹的边框线条在 before 上",
      "(包裹的边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-full-before::before {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  box-sizing: border-box;",
      "  width: 200%;",
      "  height: 200%;",
      "  transform-origin: left top;",
      "  transform: scale(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-top-after",
    "name": "at-line-top-after",
    "pseudo": "after",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "height",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 0"
      },
      {
        "prop": "transform",
        "value": "scaleY(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-top-after",
      "设置上边框线条在 after 上",
      "(上边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-top-after::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  right: 0;",
      "  height: 2rpx",
      "  transform-origin: 0 0;",
      "  transform: scaleY(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-top-before",
    "name": "at-line-top-before",
    "pseudo": "before",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "height",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 0"
      },
      {
        "prop": "transform",
        "value": "scaleY(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-top-before",
      "设置上边框线条在 before 上",
      "(上边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-top-before::before {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  right: 0;",
      "  height: 2rpx",
      "  transform-origin: 0 0;",
      "  transform: scaleY(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-bottom-after",
    "name": "at-line-bottom-after",
    "pseudo": "after",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "height",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 100%"
      },
      {
        "prop": "transform",
        "value": "scaleY(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-bottom-after",
      "设置下边框线条在 after 上",
      "(下边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-bottom-after::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  bottom: 0;",
      "  right: 0;",
      "  height: 2rpx;",
      "  transform-origin: 0 100%;",
      "  transform: scaleY(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-bottom-before",
    "name": "at-line-bottom-before",
    "pseudo": "before",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "height",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 100%"
      },
      {
        "prop": "transform",
        "value": "scaleY(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-bottom-before",
      "设置下边框线条在 before 上",
      "(下边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-bottom-before::before {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  bottom: 0;",
      "  right: 0;",
      "  height: 2rpx;",
      "  transform-origin: 0 100%;",
      "  transform: scaleY(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-left-after",
    "name": "at-line-left-after",
    "pseudo": "after",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "width",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 0"
      },
      {
        "prop": "transform",
        "value": "scaleX(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-left-after",
      "设置左边框线条在 after 上",
      "(左边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-left-after::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  bottom: 0;",
      "  width: 2rpx;",
      "  transform-origin: 0 0;",
      "  transform: scaleX(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-left-before",
    "name": "at-line-left-before",
    "pseudo": "before",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "left",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "width",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "0 0"
      },
      {
        "prop": "transform",
        "value": "scaleX(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-left-before",
      "设置左边框线条在 before 上",
      "(左边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-left-before::before {",
      "  content: \"\";",
      "  position: absolute;",
      "  left: 0;",
      "  top: 0;",
      "  bottom: 0;",
      "  width: 2rpx;",
      "  transform-origin: 0 0;",
      "  transform: scaleX(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-right-after",
    "name": "at-line-right-after",
    "pseudo": "after",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "width",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "100% 0"
      },
      {
        "prop": "transform",
        "value": "scaleX(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-right-after",
      "设置右边框线条在 after 上",
      "(右边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-right-after::after {",
      "  content: \"\";",
      "  position: absolute;",
      "  right: 0;",
      "  top: 0;",
      "  bottom: 0;",
      "  width: 2rpx;",
      "  transform-origin: 100% 0;",
      "  transform: scaleX(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-line-right-before",
    "name": "at-line-right-before",
    "pseudo": "before",
    "props": [
      {
        "prop": "content",
        "value": "\"\""
      },
      {
        "prop": "position",
        "value": "absolute"
      },
      {
        "prop": "right",
        "value": "0"
      },
      {
        "prop": "top",
        "value": "0"
      },
      {
        "prop": "bottom",
        "value": "0"
      },
      {
        "prop": "width",
        "value": "2rpx"
      },
      {
        "prop": "transform-origin",
        "value": "100% 0"
      },
      {
        "prop": "transform",
        "value": "scaleX(0.5)"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-line-right-before",
      "设置右边框线条在 before 上",
      "(右边框颜色需自己额外设置)",
      "属性详情如下:",
      ".at-line-right-before::before {",
      "  content: \"\";",
      "  position: absolute;",
      "  right: 0;",
      "  top: 0;",
      "  bottom: 0;",
      "  width: 2rpx;",
      "  transform-origin: 100% 0;",
      "  transform: scaleX(0.5);",
      "}"
    ]
  },
  {
    "prefix": "at-word-break",
    "name": "at-word-break",
    "props": [
      {
        "prop": "word-break",
        "value": "break-all"
      },
      {
        "prop": "word-wrap",
        "value": "break-word"
      },
      {
        "prop": "white-space",
        "value": "normal"
      }
    ],
    "type": "gather",
    "description": [
      "【集合属性】at-word-break",
      "设置文本强制换行",
      "属性详情如下:",
      ".at-word-break {",
      "  word-break: break-all;",
      "  word-wrap: break-word;",
      "  white-space: normal;",
      "}"
    ]
  }
]