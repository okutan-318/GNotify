import { SFlgClass } from "./libs.js";

// Saves options to chrome.storage
function save_options() {
    var regularlyFlg = document.getElementById('regularlyNotify_c').checked;
    var lastLoginBonusCheckedDateValue = document.getElementById('lastLoginBonusCheckedDate_d').value;
    var overTimeFlg = document.getElementById('overTimeNotify_c').checked;
    var checkAtOpenFlg = document.getElementById('checkAtOpen_c').checked;
    var showNotificationFlg = document.getElementById('showNotification_c').checked;
    var launchedUpFlg = document.getElementById('launchedUpNotify_c').checked;

    var rmFlgArr = new Array(8);
    for (var i = 0; i < 8; i++) {
        if (i > 5) continue;
        rmFlgArr[i] = document.getElementById('regularlyMinutes_' + i + '_c').checked;
    }
    var rhFlgArr = new Array(24);
    for (var i = 0; i < 24; i++) {
        rhFlgArr[i] = document.getElementById('regularlyHours_' + i + '_c').checked;
    }

    chrome.storage.local.set({
        regularlyNotify: regularlyFlg,
        regularlyMinutes: SFlgClass.convertFlgValue(rmFlgArr),
        regularlyHours: SFlgClass.convertFlgValue(rhFlgArr),
        lastLoginBonusCheckedDate: lastLoginBonusCheckedDateValue,
        overTimeNotify: overTimeFlg,
        checkAtOpen: checkAtOpenFlg,
        showNotification: showNotificationFlg,
        launchedUpNotify: launchedUpFlg
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = '保存されました';
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    var isFirefox = typeof InstallTrigger !== 'undefined';

    if (isFirefox) {
        document.getElementById('showNotification_c').disabled = true;
    }
    //formatDate(new Date(), "yyyy-MM-ddTHH:mm:ss")

    //regularlyNotify = 定期チェック
    //regularlyMinutes = チェック(分) 
    //  8bit =  , 7bit =  , 6bit = 50m , 5bit = 40m
    //  4bit = 30m , 3bit = 20m , 2bit = 10m , 1bit = 0m
    //regularlyMinutes = チェック(時) 
    //  24bit = 23h , 23bit = 22h , 22bit = 21h , 21bit = 20h
    //  20bit = 19h , 19bit = 18h , 18bit = 17h , 17bit = 16h
    //  16bit = 15h , 15bit = 14h , 14bit = 13h , 13bit = 12h
    //  12bit = 11h , 11bit = 10h , 10bit = 9h , 9bit = 8h
    //  8bit = 7h , 7bit = 6h , 6bit = 5h , 5bit = 4h
    //  4bit = 3h , 3bit = 2h , 2bit = 1h , 1bit = 0h
    //lastLoginBonusNotifyDate = 最後に通知した日付
    //lastLoginBonusCheckedDate = 最後にログインボーナスを確認した日付
    //overTimeNotify = 確認後も定期チェックする
    //checkAtOpen = 「ページを開く」を選択した時に確認状態にする
    //showNotification = デスクトップ通知（Chromeのみ）※ポップアップなし
    //launchedUpNotify = 起動時に通知する

    //sync = ブラウザ同期
    //local = デバイス保存
    chrome.storage.local.get(SFlgClass.initializeData, function (items) {
        document.getElementById('regularlyNotify_c').checked = items.regularlyNotify;
        document.getElementById('lastLoginBonusCheckedDate_d').value = items.lastLoginBonusCheckedDate;
        document.getElementById('overTimeNotify_c').checked = items.overTimeNotify;
        document.getElementById('checkAtOpen_c').checked = items.checkAtOpen;
        document.getElementById('showNotification_c').checked = items.showNotification;
        document.getElementById('launchedUpNotify_c').checked = items.launchedUpNotify;

        for (var i = 0; i < 8; i++) {
            if (i > 5) continue;
            document.getElementById('regularlyMinutes_' + i + '_c').checked = SFlgClass.getFlgValue(items.regularlyMinutes, i);
        }

        for (var i = 0; i < 24; i++) {
            document.getElementById('regularlyHours_' + i + '_c').checked = SFlgClass.getFlgValue(items.regularlyHours, i);
        }

        var status = document.getElementById('status');
        status.textContent = '同期されました';
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.mode) {
      case 'updateOptions':
        restore_options();
        break;
  
      default:
        break;
    }
    sendResponse({response: "Message request end"}); //処理が終わったことを知らせる
  
    return true;
  });
