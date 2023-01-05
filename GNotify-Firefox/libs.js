//export class SFlgClass {
//
//  static initializeData = {
//    regularlyNotify: true,
//    regularlyMinutes: 0x01,
//    regularlyHours: 0x000001,
//    lastLoginBonusNotifyDate: "2020-01-01T00:00:00",
//    lastLoginBonusCheckedDate: "2020-01-01T00:00:00",
//    overTimeNotify: false,
//    checkAtOpen: true,
//    showNotification: false,
//    launchedUpNotify: true
//  };
//
//  static convertFlgValue(flgArray) {
//    var res = 0x0;
//    var nFlg = 0x1;
//    for (var i = 0; i < flgArray.length; i++) {
//      if (flgArray[i]) {
//        res |= nFlg;
//      }
//      nFlg = nFlg << 1;
//    }
//    return res;
//  }
//
//  static getFlgValue(flg, index) {
//    var nFlg = 0x1;
//    for (var i = 0; i < index; i++) {
//      nFlg = nFlg << 1;
//    }
//    return (flg & nFlg) == nFlg;
//  }
//
//  static formatDate(date, format) {
//    format = format.replace(/yyyy/g, date.getFullYear());
//    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
//    format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
//    format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
//    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
//    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
//    format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
//    return format;
//  };
//
//}