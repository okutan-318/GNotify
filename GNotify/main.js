import { SFlgClass } from "./libs.js";

var isChrome = (chrome.action != null && chrome.action != undefined);

//最後に表示したウィンドウ
var lastWindowId = 0;

console.log(SFlgClass.initializeData);

//初期化
function initializing() {
  var date = new Date();
  var minutes = date.getMinutes();
  if ((minutes % 10) == 0 && date.getSeconds() > 0) minutes += 10;
  while ((minutes % 10) != 0) {
    minutes++;
  }
  date.setMinutes(minutes);
  date.setSeconds(0);
  chrome.alarms.create('regularly', { when: date.getTime(), 'periodInMinutes': 10 });
  chrome.alarms.getAll((alms) => {
    for (var alm of alms) {
      console.log(alm.name);
    }
  });
}
initializing();

//ブラウザ起動時
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(SFlgClass.initializeData, function (items) {
    if (items.launchedUpNotify) {
      doRegularlyNotify();
    }
  });
});

//アラーム
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('onAlarm');

  switch (alarm.name) {
    case 'regularly':
      checkRegularlyNotify();
      break;

    default:
      break;
  }
});

if (chrome.action) {
  //アイコンクリック
  chrome.action.onClicked.addListener((tab) => {
    doRegularlyNotify();
  });
}
else {
  //アイコンクリック
  chrome.browserAction.onClicked.addListener((tab) => {
    doRegularlyNotify();
  });
}

function checkRegularlyNotify() {
  var now = new Date();
  var lastDayTime = new Date();
  var standardTimezoneOffset = 480; //gmt+8 480 の0時
  var difTimezoneOffset = lastDayTime.getTimezoneOffset() + standardTimezoneOffset; //　-540 + 480 = -60
  console.log(standardTimezoneOffset + ":" + difTimezoneOffset);
  console.log(lastDayTime.getTimezoneOffset() + ":" + lastDayTime.getMinutes());
  //日本時間 gmt+9 540 の1時
  lastDayTime.setMinutes(lastDayTime.getMinutes() + difTimezoneOffset); //本国基準の時間にする
  lastDayTime.setHours(0);                                              //本国のその日の0時
  console.log(lastDayTime);
  lastDayTime.setMinutes(-difTimezoneOffset);                           //日本時間に戻す
  lastDayTime.setSeconds(0);                                            //秒数を揃える

  chrome.storage.local.get(SFlgClass.initializeData, function (items) {
    //定期実行しない場合
    if (!items.regularlyNotify) return;

    //最後に受け取ったと確認した日時
    var lastDate = Date.parse(items.lastLoginBonusCheckedDate);
    console.log(new Date(lastDate) + ":" + lastDayTime.getTimezoneOffset() + ":" + difTimezoneOffset + ":" + lastDayTime)

    //日付更新時間を越えたかつ確認後に実行しない場合
    if (lastDate >= lastDayTime.getTime() && !items.overTimeNotify) {
      return;
    }

    //その分をフラグのインデックスに変換
    var mIdx = 0;
    var minutes = now.getMinutes();
    for (var i = 1; i < 8; i++) {
      if (i > 5) continue;
      if (minutes >= 10 * i) mIdx++;
    }
    //その分に実行しない場合
    if (!SFlgClass.getFlgValue(items.regularlyMinutes, mIdx)) return;

    //その時をフラグのインデックスに変換
    var hIdx = 0;
    var hours = now.getHours();
    for (var i = 1; i < 24; i++) {
      if (hours >= i) hIdx++;
    }
    //その時に実行しない場合
    if (!SFlgClass.getFlgValue(items.regularlyHours, hIdx)) return;

    //通知orポップアップを表示する
    doRegularlyNotify();
  });
}

//通知orポップアップ表示
function doRegularlyNotify() {
  var now = new Date();
  var isFirefox = typeof InstallTrigger !== 'undefined';
  //var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime); *v3 delete

  console.log(isFirefox + ":" + isChrome);
  chrome.storage.local.get(SFlgClass.initializeData, function (items) {
    if (!isFirefox && isChrome && items.showNotification) {
      createRegularlyNotification();
    }
    else {
      showPopup();
    }
  });

  chrome.storage.local.set({
    lastLoginBonusNotifyDate: SFlgClass.formatDate(now, "yyyy-MM-ddTHH:mm:ss")
  }, () => {
    console.log("got saved");
  });
}

//通知作成
function createRegularlyNotification() {
  /* firefox not suppurt */
  chrome.notifications.create('regularlyNotification', {
    "type": "basic",
    "iconUrl": chrome.runtime.getURL("favicon64.ico"),
    "title": "定期通知",
    "message": "ログインボーナスは受け取りましたか？",
    "buttons": [
      { title: "ページを開く" },
      { title: "受け取った" }
    ]
  });
}

//ポップアップ表示
function showPopup() {
  var popupURL = chrome.runtime.getURL("popup.html");

  chrome.windows.create({
    url: popupURL,
    type: "popup",
    height: 300,
    width: 450
  }, (windowInfo) => {
    //既に表示しているウィンドウがあれば消す
    chrome.windows.get(lastWindowId, {windowTypes: ["popup"]}).then((lastWindowInfo) => {
      chrome.windows.remove(lastWindowInfo.id);
    }, (error) => {
      console.log(`Error: ${error}`);
    });
    console.log(`Created window: ${windowInfo.id}`);
    lastWindowId = windowInfo.id;
  });
}
//ログインボーナスページ表示
function openLoginBonusPage() {
  console.log(chrome.runtime.id);
  var now = new Date();

  var popupURL = "https://webstatic-sea.mihoyo.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481&lang=ja-jp";
  chrome.tabs.create({
    active: true,
    url: popupURL
  }, (tab) => {
    console.log(`Created new tab: ${tab.id}`);
    chrome.storage.local.get(SFlgClass.initializeData, function (items) {
      if (items.checkAtOpen) {
        gotLoginBonus();
      }
    });
  });
}

//ログインボーナスチェック保存処理
function gotLoginBonus() {
  var now = new Date();

  console.log("save");
  chrome.storage.local.set({
    lastLoginBonusCheckedDate: SFlgClass.formatDate(now, "yyyy-MM-ddTHH:mm:ss")
  }, () => {
    console.log("got saved");
    var sending = chrome.runtime.sendMessage(
      {
        mode: 'updateOptions'
      });
    sending.then((message) => {
      console.log(`Message from the background script:  ${message.response}`);
    },(error) => {
      console.log(`Error: ${error}`);
    });
  });
}

//タブ更新時
//chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//});

//通知のボタンが押された
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  console.log(notificationId, buttonIndex);

  switch (notificationId) {
    case 'regularlyNotification':
      switch (buttonIndex) {
        case 0:
          openLoginBonusPage();
          break;
        case 1:
          gotLoginBonus();
          break;
      }
      break;
    default:
      break;
  }
});

// メッセージ
// * 下記の処理はbackgroundで行なわなければならない
//   * YouTubeAPIを叩く             : CORS
//   * オプションページを開く       : openOptionsPage
//   * タイムラインノート管理を開く : window.open
//   * 同期                         : chrome.tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  switch (request.mode) {
    case 'openLoginBonusPage':
      openLoginBonusPage();
      break;

    case 'gotLoginBonus':
      gotLoginBonus();
      break;

    default:
      break;
  }
  sendResponse({response: "Message request end"}); //処理が終わったことを知らせる

  return true;
});