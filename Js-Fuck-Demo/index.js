/*! JSFuck 0.5.0 - http://jsfuck.com */

/**
 * String.constructor(" alert(1)") =>  ƒ anonymous() { alert(1) }
 * 
 */
(function(self){
  const MIN = 32, MAX = 126;

  const SIMPLE = {
    'false':      '![]',
    'true':       '!![]',
    'undefined':  '[][[]]',
    'NaN':        '+[![]]',
    'Infinity':   '+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])' // +"1e1000"
  };

  const CONSTRUCTORS = {
    'Array':    '[]',
    'Number':   '(+[])',
    'String':   '([]+[])',
    'Boolean':  '(![])',
    'Function': '[]["flat"]',
    'RegExp':   'Function("return/"+false+"/")()',
    'Object':	'[]["entries"]()'
  };

  const MAPPING = {
    'a':   '(false+"")[1]',
    'b':   '([]["entries"]()+"")[2]',
    'c':   '([]["flat"]+"")[3]',
    'd':   '(undefined+"")[2]',
    'e':   '(true+"")[3]',
    'f':   '(false+"")[0]',
    'g':   '(false+[0]+String)[20]',
    'h':   '(+(101))["to"+String["name"]](21)[1]',
    'i':   '([false]+undefined)[10]',
    'j':   '([]["entries"]()+"")[3]',
    'k':   '(+(20))["to"+String["name"]](21)',
    'l':   '(false+"")[2]',
    'm':   '(Number+"")[11]',
    'n':   '(undefined+"")[1]',
    'o':   '(true+[]["flat"])[10]',
    'p':   '(+(211))["to"+String["name"]](31)[1]',
    'q':   '("")["fontcolor"]([0]+false+")[20]',
    'r':   '(true+"")[1]',
    's':   '(false+"")[3]',
    't':   '(true+"")[0]',
    'u':   '(undefined+"")[0]',
    'v':   '(+(31))["to"+String["name"]](32)',
    'w':   '(+(32))["to"+String["name"]](33)',
    'x':   '(+(101))["to"+String["name"]](34)[1]',
    'y':   '(NaN+[Infinity])[10]',
    'z':   '(+(35))["to"+String["name"]](36)',

    'A':   '(NaN+[]["entries"]())[11]',
    'B':   '(+[]+Boolean)[10]',
    'C':   'Function("return escape")()(("")["italics"]())[2]',
    'D':   'Function("return escape")()([]["flat"])["slice"]("-1")',
    'E':   '(RegExp+"")[12]',
    'F':   '(+[]+Function)[10]',
    'G':   '(false+Function("return Date")()())[30]',
    'H':   null,
    'I':   '(Infinity+"")[0]',
    'J':   null,
    'K':   null,
    'L':   null,
    'M':   '(true+Function("return Date")()())[30]',
    'N':   '(NaN+"")[0]',
    'O':   '(+[]+Object)[10]',
    'P':   null,
    'Q':   null,
    'R':   '(+[]+RegExp)[10]',
    'S':   '(+[]+String)[10]',
    'T':   '(NaN+Function("return Date")()())[30]',
    'U':   '(NaN+Object()["to"+String["name"]]["call"]())[11]',
    'V':   null,
    'W':   null,
    'X':   null,
    'Y':   null,
    'Z':   null,

    ' ':   '(NaN+[]["flat"])[11]',
    '!':   null,
    '"':   '("")["fontcolor"]()[12]',
    '#':   null,
    '$':   null,
    '%':   'Function("return escape")()([]["flat"])[21]',
    '&':   '("")["fontcolor"](")[13]',
    '\'':  null,
    '(':   '([]["flat"]+"")[13]',
    ')':   '([0]+false+[]["flat"])[20]',
    '*':   null,
    '+':   '(+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]])+[])[2]',
    ',':   '[[]]["concat"]([[]])+""',
    '-':   '(+(.+[0000001])+"")[2]',
    '.':   '(+(+!+[]+[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]]+[+[]])+[])[+!+[]]',
    '/':   '(false+[0])["italics"]()[10]',
    ':':   '(RegExp()+"")[3]',
    ';':   '("")["fontcolor"](NaN+")[21]',
    '<':   '("")["italics"]()[0]',
    '=':   '("")["fontcolor"]()[11]',
    '>':   '("")["italics"]()[2]',
    '?':   '(RegExp()+"")[2]',
    '@':   null,
    '[':   '([]["entries"]()+"")[0]',
    '\\':  '(RegExp("/")+"")[1]',
    ']':   '([]["entries"]()+"")[22]',
    '^':   null,
    '_':   null,
    '`':   null,
    '{':   '(true+[]["flat"])[20]',
    '|':   null,
    '}':   '([]["flat"]+"")["slice"]("-1")',
    '~':   null
  };

  const GLOBAL = 'Function("return this")()';

  /**
   * 0 - 9 的数字转换
   * 0 = +[] => 0
   * 1 = +!+[] => +!0 => +true => 1
   * 2 = +!+[] + !+[] => +!0 + !0 => +true + true => 1 + true => 1 + 1 => 2
   */
  function fillMissingDigits(){
    var output, number, i;

    for (number = 0; number < 10; number++){

      output = "+[]";

      if (number > 0){ output = "+!" + output; }
      for (i = 1; i < number; i++){ output = "+!+[]" + output; }
      if (number > 1){ output = output.substring(1); }

      MAPPING[number] = "[" + output + "]";
    }
  }

  /**
   * 转换 字典
   */
  function replaceMap(){
    var character = "", value, i, key;

    /**
     * 字符串 replace 函数 
     * @param {*} pattern 
     * @param {*} replacement 
     */
    function replace(pattern, replacement){
      value = value.replace(
        new RegExp(pattern, "gi"),
        replacement
      );
    }

    /**
     * 单个数字（0 - 9），取字典表的值
     *  'a':   '(false+"")[1]' => a: "(false+"")[+!+[]]"
     * @param {*} _ 
     * @param {*} x 
     * @returns 
     */
    function digitReplacer(_,x) { 
      return MAPPING[x]; }

    /**
     * 表达式中出现多个数字转换 ：  ' ':   '(NaN+[]["flat"])[11]' =>' ':   '(NaN+[]["flat"])[[+!+[]+[+!+[]]]]'
     * 例如： 
     * 11
     *  => ['1', '1']
     *  => +!+[]+1
     *  => +!+[]+[+!+[]]
     *  
     * 123
     * => ['1','2','3']
     * => +!+[] + 2 + 3
     * => +!+[] + [!+[]+!+[]] + [!+[]+!+[]+!+[]]
     * @param {*} _
     * @param {*} y
     * @returns
     */
    function numberReplacer(_,y) {
      var values = y.split("");
      var head = +(values.shift());
      var output = "+[]";

      if (head > 0){ output = "+!" + output; }
      for (i = 1; i < head; i++){ output = "+!+[]" + output; }
      if (head > 1){ output = output.substring(1); }

      return [output].concat(values).join("+").replace(/(\d)/g, digitReplacer);
    }

    for (i = MIN; i <= MAX; i++){
      character = String.fromCharCode(i);
      value = MAPPING[character];
      if(!value) {continue;}
      // 转换关键类型： Array、Number
      for (key in CONSTRUCTORS){
        replace("\\b" + key, CONSTRUCTORS[key] + '["constructor"]');
      }
      // 转换 预设一些 关键字： false、true
      for (key in SIMPLE){
        replace(key, SIMPLE[key]);
      }
      // 数字并存转换： 例如： [21], [20]
      replace('(\\d\\d+)', numberReplacer);
      // 括号单个数字转换： 例如 (1), 
      replace('\\((\\d)\\)', digitReplacer);
       // 中括号单个数字转换： 例如 [1],  [0]
      replace('\\[(\\d)\\]', digitReplacer);
      replace("GLOBAL", GLOBAL);
      // 将包含 +"" 转换成 +[]
      replace('\\+""', "+[]");
      // 将包含 "" 转换成 []+[]
      replace('""', "[]+[]");

      MAPPING[character] = value;
    }
  }

  function replaceStrings(){
    // 将字典中存在的字母正则出来，相当于 除[!+()]之外的字符都列举出来
    var regEx = /[^\[\]\(\)\!\+]{1}/g,
      all, value, missing,
      count = MAX - MIN;
    
    /**
     * 判断是否还有其他字母存在
     *  */ 
    function findMissing(){
      var all, value, done = false;

      missing = {};

      for (all in MAPPING){

        value = MAPPING[all];

        if (value && value.match(regEx)){
          missing[all] = value;
          done = true;
        }
      }

      return done;
    }

    /**
     * 字符串转换成数组拼接字符串：
     * flat => f + l + a + t
     * @param {*} a 
     * @param {*} b 
     * @returns 
     */
    function mappingReplacer(a, b) {
      return b.split("").join("+");
    }

    /**
     *  从字典中查找 字符串 映射关系,并赋值
     * */
    function valueReplacer(c) {
      return missing[c] ? c : MAPPING[c];
    }

    // 铺平字符串：   'c':   '([]["flat"]+"")[3]', =>   'c':   '([][f+l+a+t]+"")[3]',
    for (all in MAPPING){
      if (MAPPING[all]){
       
        MAPPING[all] = MAPPING[all].replace(/\"([^\"]+)\"/gi, mappingReplacer);
      }
    }

    while (findMissing()){
      for (all in missing){
        value = MAPPING[all];
        value = value.replace(regEx, valueReplacer);

        MAPPING[all] = value;
        missing[all] = value;
      }

      if (count-- === 0){
        console.error("Could not compile the following chars:", missing);
      }
    }
  }

  // unicode 转码，中文、字母、
  function escapeSequence(c) {
    var cc = c.charCodeAt(0);
    if (cc < 256) {
      return '\\' + cc.toString(8);
    } else {
      // 中文情况下
      var cc16 = cc.toString(16);
      return '\\u' + ('0000' + cc16).substring(cc16.length);  
    }
  }

  /**
   * 将 转换的unicode 中 的 \ 转换成 t
   * @param {*} c 
   * @returns 
   */
  function escapeSequenceForReplace(c) {
    return escapeSequence(c).replace('\\', 't');
  }

  /**
   * 转换字符
   * @param {*} input 
   * @param {*} wrapWithEval 
   * @param {*} runInParentScope 
   * @returns 
   */
  function encode(input, wrapWithEval, runInParentScope){
    var output = [];

    if (!input){
      return "";
    }

    var unmappped = ''
    for(var k in MAPPING) {
      if (MAPPING[k]){
        unmappped += k;
      }
    }

    // 判断当前字符是否有除字典key集合字符其他字符存在,进行unicode 转码
    unmappped = unmappped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    unmappped = new RegExp('[^' + unmappped + ']','g');
    var unmappedCharactersCount = (input.match(unmappped) || []).length;
    if (unmappedCharactersCount > 1) {
      input = input.replace(/[^0123456789.adefilnrsuN]/g, escapeSequenceForReplace);
    } else if (unmappedCharactersCount > 0) {
      input = input.replace(/["\\]/g, escapeSequence);
      input = input.replace(unmappped, escapeSequence);
    }
    console.log('unmappedCharactersCount===', input, unmappedCharactersCount, unmappped)

    var r = "";
    for (var i in SIMPLE) {
      r += i + "|";
    }
    r+= ".";
    // r = false|true|undefined|NaN|Infinity|. 正则列举
    input.replace(new RegExp(r, 'g'), function(c) {
      var replacement = SIMPLE[c];
      if (replacement) {
        output.push("(" + replacement + "+[])");
      } else {
        replacement = MAPPING[c];
        if (replacement){
          output.push(replacement);
        } else {
          throw new Error('Found unmapped character: ' + c);
        }
      }
    });
    
    output = output.join("+");
    console.log('output===', output)
    console.log('input===', input)
    // 纯数字 
    if (/^\d$/.test(input)){
      output += "+[]";
    }

    if (unmappedCharactersCount > 1) {
      /**
       *  将 多个unicode 中 t 替换成 \\
       *  ("t110t54tu5728")["split"]("t")["join"]("\\")
       */
      output = "(" + output + ")[" + encode("split") + "](" + encode ("t") + ")[" + encode("join") +"](" + encode("\\") + ")";
    }

    /***
     * 将  unicode 转码 封装成一个函数并且 返回这个 unicode 转码
     * [].flat.constructor( 'return "\110" ' )()
     * []["flat"]["constructor"]("return '\110' ")()
     * '\110' => unicode 
     */
    if (unmappedCharactersCount > 0) {
      output = "[][" + encode("flat") + "]"+
      "[" + encode("constructor") + "]" +
      "(" + encode("return\"") + "+" + output + "+" + encode("\"") + ")()";
    }

    if (wrapWithEval){
      if (runInParentScope){
        /**
         *  
         *  []["flat"]["constructor"]("return eval")()("alert(1)") =>  (ƒ anonymous() { return eval  })()("alert(1)")
         */
        output = "[][" + encode("flat") + "]" +
          "[" + encode("constructor") + "]" +
          "(" + encode("return eval") + ")()" +
          "(" + output + ")";
      } else {
        /**
         * []["flat"]["constructor"]("alert")() => ƒ anonymous() {alert(1)  }
         */
        output = "[][" + encode("flat") + "]" +
          "[" + encode("constructor") + "]" +
          "(" + output + ")()";
      }
    }

    return output;
  }

  console.log('初始化字典===start')
  // 添加 0 - 9 数字，字典
  fillMissingDigits();
  // 转换字典
  replaceMap();
  // 转换字典中还存在的字符串
  replaceStrings();
  console.log('初始化字典===end')

  self.JSFuck = {
    encode: encode
  };
})(typeof(exports) === "undefined" ? window : exports);