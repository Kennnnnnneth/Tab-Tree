//定位 mouse
document.onmouseenter = () => {
  chrome.runtime.sendMessage("enter");
};
document.onmouseleave = () => {
  chrome.runtime.sendMessage("leave");
};
