export function dateFromat(date){
  if (date instanceof Date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m > 9 ? m : '0' + m;
    let d = date.getDate();
    return  y + '/' + m + '/' + d;
  } else {
    throw new Error('date 不是 Date 类型')
  }
}