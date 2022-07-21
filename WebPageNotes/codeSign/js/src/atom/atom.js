/**
 * 获取原子类
 * @param {*} prop
 * @param {*} value
 * @returns
 */
 function getAtomCss(atomMap, prop, value) {
  if (!atomMap[prop]) return null;
  return atomMap[prop][value] || null;
}

/**
 * 获取集合原子类(会修改css 属性 nodes 数据，返回集合原子类名数组)
 * @param {*} nodes
 * @param {*} isPseudo 是否开启伪元素替换
 * @returns
 */
 function getGatherAtomCss(gatherConfig, nodes, isPseudo, pseudoType) {
  const atomCss = [];
  let newNodes = [];
  gatherConfig.forEach(({ name, props, pseudo }) => {
    // 当不执行伪元素类名时，排除伪元素原子配置
    if (!isPseudo && pseudo) {
      return;
    }
    // 当执行伪元素类名时，排除不是伪元素原子配置
    if (isPseudo && !pseudo) {
      return;
    }
    // 当执行伪元素类名时，排除伪元素类型不一致的原子配置
    if (isPseudo && pseudoType !== pseudo) {
      return;
    }

    let num = 0;
    newNodes = [];
    // 遍历样式ast属性
    nodes.forEach((node) => {
      const { prop, value, important } = node;
      if (important) {
        newNodes.push(node);
      } else {
        // 查找属性值匹配
        const fItem = props.find(
          item => prop === item.prop && (PropFormat[prop] ? PropFormat[prop](value) : value) === item.value,
        );
        if (fItem) {
          num += 1;
        } else {
          newNodes.push(node);
        }
      }
    });
    if (num === props.length) {
      atomCss.push(name);
      nodes = newNodes;
    }
  });
  return [atomCss, nodes];
}

const simplifyAttr = {
  margin: ['unset', 'auto', '0 auto', '0'],
  padding: ['unset', '0'],
};
/**
 * 拆解简写的 margin/padding 边距值为四个方向的边距值
 * @param {*} prop 属性名: margin/padding
 * @param {*} value 属性值
 * @returns
 */
function dealMarginPaddingValue(prop, value) {
  let returnVal = '';
  // 判断属性名是否为 margin/padding,排除特定属性值(存在原子属性): padding为 unset 或 0; margin为 unset 或 auto 或 0 auto 或 0
  if (simplifyAttr[prop] && !simplifyAttr[prop].includes(value)) {
    const reg = /0|-\d+rpx|\d+rpx|\d+.\d+rpx/g; // 匹配简写的边距值
    if (new RegExp(reg).test(value)) { // 校验通过
      const valueArr = value.split(' ');
      if (!valueArr.length) return;
      let ruleVal;
      if (valueArr.length == 1) {
        ruleVal = [0, 0, 0, 0];
      } else if (valueArr.length == 2) {
        ruleVal = [0, 1, 0, 1];
      } else if (valueArr.length == 3) {
        ruleVal = [0, 1, 2, 1];
      } else {
        ruleVal = [0, 1, 2, 3];
      }
      returnVal = [
        { prop: `${prop}-top`, value: valueArr[ruleVal[0]] },
        { prop: `${prop}-right`, value: valueArr[ruleVal[1]] },
        { prop: `${prop}-bottom`, value: valueArr[ruleVal[2]] },
        { prop: `${prop}-left`, value: valueArr[ruleVal[3]] },
      ];
    }
  }
  return returnVal;
}

/**
 * display: none;
 * flex: 1;
 * @param {*} styleContent 
 * @returns 
 */
function getCssNodesByStyle(styleContent) {
  const result = [];
  if (styleContent && styleContent[0] === '{' && styleContent[styleContent.length - 1] === '}') {
    const datas = styleContent.substring(1, styleContent.length - 2).split(';')
    datas.forEach(item => {
      if (item) {
        const nodes = item.split(':');
        if (nodes.length === 2 && nodes[0] && nodes[1]) {
          // 处理mixin的情况
          if (STYLE_MIXIN[nodes[0]] && typeof STYLE_MIXIN[nodes[0]] === 'function') {
            const cssStr =  STYLE_MIXIN[nodes[0]](...nodes[1].split(','));
            if (cssStr) {
              const mixinDatas = cssStr.split(';')
              mixinDatas.forEach(mItem => {
                const minxinNodes = mItem.split(':');
                if (minxinNodes.length === 2 && minxinNodes[0] && minxinNodes[1]) { 
                  result.push({
                    prop: minxinNodes[0].trim(),
                    value: htmlDecodeByRegExp(minxinNodes[1].trim()),
                  })
                }
              })
            }
          } else {
            result.push({
              prop: nodes[0].trim(),
              value: htmlDecodeByRegExp(nodes[1].trim()) ,
            })
          }
        }
      }
    })
  }
  return result;
}



function formatStyles(datas) {
  const nodeMap = {};
  datas.forEach(item => {
    nodeMap[item.prop] = item;
  })
  const nodes = Object.values(nodeMap);
  let result = [];
  nodes.forEach(item => {
    const { prop , value } = item;
    if (['margin', 'padding'].indexOf(prop) !== -1) {
      const dealMPs = dealMarginPaddingValue(prop, value);
      result = result.concat(dealMPs);
    } else {
      result.push(item);
    }
  })
  return result;
}