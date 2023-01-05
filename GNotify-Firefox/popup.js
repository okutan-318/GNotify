
function sendSuccess(message) {
    console.log(`Message from the background script:  ${message.response}`);
    closePopup();
}
function sendError(error) {
    console.log(`Error: ${error}`);
    closePopup();
}

function gotLoginBonus() {
    chrome.windows.getCurrent((windowInfo) => {
        console.log(chrome.runtime.id);
        var sending = chrome.runtime.sendMessage(
            {
                mode: 'gotLoginBonus'
            });
        sending.then(sendSuccess, sendError);
        //chrome.windows.remove(windowInfo.id, () => {
        //    console.log("window removed " + chrome.runtime.id);
        //});
    });
}

function openLoginBonusPage() {
    chrome.windows.getCurrent((windowInfo) => {
        console.log(chrome.runtime.id);
        var sending = chrome.runtime.sendMessage(
            {
                mode: 'openLoginBonusPage'
            });
        sending.then(sendSuccess, sendError);
        //chrome.windows.remove(windowInfo.id, () => {
        //    console.log("window removed " + chrome.runtime.id);
        //});
    });
}

function closePopup() {
    chrome.windows.getCurrent((windowInfo) => {
        console.log(chrome.runtime.id);
        chrome.windows.remove(windowInfo.id);
    });
}

document.getElementById('got').addEventListener('click', gotLoginBonus);
document.getElementById('open').addEventListener('click', openLoginBonusPage);
document.getElementById('close').addEventListener('click', closePopup);
