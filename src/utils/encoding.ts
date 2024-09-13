/*
 * @description 处理字符编码
 */
function utf16ToEntities(str: string) {
  if (typeof str !== 'string') return '';
  const patt = /[\ud800-\udbff][\udc00-\udfff]/g;
  // 检测utf16字符正则
  str = str.replace(patt, function (char) {
    let H, L, code;
    if (char.length === 2) {
      H = char.charCodeAt(0);
      // 取出高位
      L = char.charCodeAt(1);
      // 取出低位
      code = (H - 0xd800) * 0x400 + 0x10000 + L - 0xdc00;
      // 转换算法
      return '&#' + code + ';';
    } else {
      return char;
    }
  });
  return str;
}

/**
 * @description 表情转h5符号，ut-16
 */
function entities2Utf16(str: string) {
  if (typeof str !== 'string') return '';
  // 检测出形如&#12345;形式的字符串
  const strObj = utf16ToEntities(str);
  const patt = /&#\d+;/g;
  let H, L, code;
  const arr = strObj.match(patt) || [];
  for (let i = 0; i < arr.length; i++) {
    code = arr[i];
    code = code.replace('&#', '').replace(';', '');
    // 高位
    H = Math.floor((code - 0x10000) / 0x400) + 0xd800;
    // 低位
    L = ((code - 0x10000) % 0x400) + 0xdc00;
    code = '&#' + code + ';';
    const s = String.fromCharCode(H, L);
    strObj.replace(code, s);
  }
  return strObj;
}

export { entities2Utf16 };
