//class
class Butler {
  constructor() {
    this.tabIdList = [];
    this.tabLibrary = [];
    this.webLibrary = [];
    this.mapYOrder = [[]];
    this.mapY = [];
    this.webId = 0;
    this.picWaitList = [];
    this.group = [];
    this.tabCombine = [];
    this.inPage = false;
  }
  tabGroup(insertTabId, toGroupTabId) {
    this.group.every((gpArray) => {
      if (gpArray.includes(insertTabId)) {
        gpArray.push(toGroupTabId);
        return false;
      }
      return true;
    });
  }
  tabCombineFilter(ckeckTabId) {
    //tabId to tabId
    let tabId = -1; //error when return -1
    if (this.tabIdList.includes(ckeckTabId)) {
      tabId = ckeckTabId;
    } else {
      this.tabCombine.every((eleArray) => {
        if (eleArray.includes(ckeckTabId)) {
          tabId = eleArray[0];
          return false;
        } else {
          return true;
        }
      });
    }
    return tabId;
  }
  webIdFind(tabIdIndex, url) {
    //using after combineFilter
    if (tabIdIndex === -1) {
      //fail
      return -1;
    }
    let webId = -1;
    this.tabLibrary[tabIdIndex].history.every((ele) => {
      if (this.webLibrary[ele].url === url) {
        webId = ele;
        return false;
      } else {
        return true;
      }
    });
    return webId;
  }
  makeMapY() {
    this.mapY = [];
    if (this.mapYOrder[0].length > 0) {
      this.mapYOrder.forEach((tabs, order) => {
        if (order == 0) {
          //init the first line
          tabs.forEach((tab) => {
            let thisTab = this.tabLibrary[this.tabIdList.indexOf(tab)];
            if (thisTab.history.length > 0) {
              this.mapY.splice(this.mapY.length, 0, ...thisTab.history);
              this.mapY.push(-1);
            }
          });
        } else {
          let toDoListId = []; //bornId
          let toDoList = []; //tab
          tabs.forEach((tab) => {
            //sort
            let nowTab = this.tabLibrary[this.tabIdList.indexOf(tab)];
            if (nowTab.history.length > 0) {
              if (!toDoListId.includes(nowTab.bornId)) {
                toDoListId.push(nowTab.bornId);
                toDoList.push([]);
              }
              toDoList[toDoListId.indexOf(nowTab.bornId)].push(nowTab.tabId);
            }
          });
          toDoList.forEach((tabArray, index) => {
            //per bornId
            let temp = [];
            tabArray.forEach((tab) => {
              if (
                this.tabLibrary[this.tabIdList.indexOf(tab)].history.length > 0
              ) {
                temp.push(this.tabLibrary[this.tabIdList.indexOf(tab)].history);
              }
            });
            let position;
            for (let i = 0; i < this.mapY.length; i++) {
              if (Array.isArray(this.mapY[i])) {
                if (this.mapY[i].includes(toDoListId[index])) {
                  position = i;
                }
              } else {
                if (this.mapY[i] == toDoListId[index]) {
                  position = i;
                }
              }
            }
            let temp2 = temp.flat();
            let temp3 = [];
            temp3.push(this.mapY[position]);
            temp3.push(temp2[0]);
            if (temp2.length > 1) {
              this.mapY.splice(position, 1, ...temp2);
            }
            this.mapY.splice(position, 1, temp3.flat());
          });
        }
      });
    }
  }
  WebUpdate(tabIndex, tab) {
    if (tabIndex === -1) {
      //error
      return;
    }
    let thisWebId = this.webIdFind(tabIndex, tab.url);
    if (thisWebId !== -1) {
      //repeat page like forward backward or reCreated-click
      this.tabLibrary[tabIndex].history.forEach((ele) => {
        if (ele !== thisWebId) {
          this.webLibrary[ele].here = false;
        } else {
          this.webLibrary[ele].here = true;
        }
      });
      this.UploadData();
    } else {
      //none repeat new only once
      let presentWebId = this.webId;
      this.webLibrary.push(
        new OneWeb(
          tab.url,
          tab.title,
          tab.favIconUrl,
          this.tabLibrary[tabIndex].x,
          presentWebId,
          tab.id
        )
      );
      this.tabLibrary[tabIndex].history.push(presentWebId);
      Gallery.push("");
      this.webId++;
      TrustfulButler.picWaitList.push(presentWebId);
      this.makeMapY();
      this.UploadData();
    }
  }
  Remove(tabId) {
    this.tabLibrary[this.tabIdList.indexOf(tabId)].closed = true;
    if (this.tabLibrary[this.tabIdList.indexOf(tabId)].history.length > 0) {
      this.tabLibrary[this.tabIdList.indexOf(tabId)].history.forEach((ele) => {
        this.webLibrary[ele].here = false;
      });
      this.UploadData;
    }
  }
  GroupTab(winID) {
    let groupMap = [];
    let existedGroup = [];
    chrome.tabs.query({ windowId: winID }, (tabArray) => {
      tabArray.forEach((singleTab) => {
        if (singleTab.groupId !== -1) {
          existedGroup.push(singleTab.id);
        }
        this.group.forEach((eleArray, index) => {
          if (groupMap.length - 1 < index) {
            groupMap.push([]);
          }
          if (eleArray.includes(singleTab.id)) {
            //combine bug
            groupMap[index].push(singleTab.id);
          }
        });
      });

      if (existedGroup.length > 0) {
        chrome.tabs.ungroup(existedGroup);
      }
      groupMap.forEach((eleArray) => {
        if (eleArray.length > 0) {
          chrome.tabs.group({ tabIds: eleArray });
        }
      });
    });
  }
  ClickEvent(triggerWebId) {
    let tabIndex = this.tabIdList.indexOf(this.webLibrary[triggerWebId].tabID);
    if (this.tabLibrary[tabIndex].closed) {
      //already closed
      chrome.tabs.create(
        {
          active: true,
          url: this.webLibrary[triggerWebId].url,
        },
        (changeTab) => {
          this.tabLibrary[tabIndex].closed = false;
          //continue combine
          if (
            this.combine.every((array) => {
              if (array.includes(this.tabIdList[tabIndex])) {
                array.push(changeTab.id);
                return false;
              }
              return true;
            })
          ) {
            this.combine.push([this.tabIdList[tabIndex], changeTab.id]);
          }
          //group
          this.tabGroup(this.tabIdList[tabIndex], changeTab.id);
        }
      );
    } else {
      let posibleTab;
      if (
        this.tabCombine.every((array) => {
          if (array.includes(this.tabIdList[tabIndex])) {
            posibleTab = array[array.length - 1];
            return false;
          }
          return true;
        })
      ) {
        posibleTab = this.tabIdList[tabIndex];
      }

      chrome.tabs.get(posibleTab, (thisTab) => {
        if (thisTab.url !== this.webLibrary[triggerWebId].url) {
          chrome.tabs.update(posibleTab, {
            active: true,
            url: this.webLibrary[triggerWebId].url,
          });
        } else {
          chrome.tabs.update(posibleTab, {
            active: true,
          });
        }
      });
    }
  }
  UploadData() {
    let xRate = 100;
    let yRate = 100;
    let uploadNode = [];
    let uploadEdge = [];
    let counter = 0;
    if (this.mapY.length > 1) {
      this.mapY.forEach((ele, index) => {
        if (typeof ele !== "undefined" && ele !== null) {
          if (Array.isArray(ele)) {
            ele.forEach((eles) => {
              if (typeof eles !== "undefined" && eles != null && eles !== -1) {
                this.webLibrary[eles].y = (index + 1) * yRate;
              }
            });
          } else {
            if (ele !== undefined && ele !== null && ele > -1) {
              this.webLibrary[ele].y = (index + 1) * yRate;
            }
          }
        }
      });
      this.webLibrary.forEach((ele) => {
        uploadNode.push(
          new PopupNode(
            ele.id,
            { x: (ele.x + 1) * xRate, y: ele.y },
            ele.title,
            ele.url,
            ele.favIconUrl,
            ele.tabID,
            ele.here,
            ele.id
          )
        );
      });

      this.tabLibrary.forEach((singleTab) => {
        if (singleTab.history.length > 1 && !singleTab.history.includes(null)) {
          singleTab.history.forEach((ele, index) => {
            if (index > 0) {
              uploadEdge.push(
                new PopupConnection(counter, singleTab.history[index - 1], ele)
              );
              counter++;
            }
          });
        }
        if (
          singleTab.history.length > 0 &&
          singleTab.history[0] !== null &&
          singleTab.bornId !== -1
        ) {
          uploadEdge.push(
            new PopupConnection(counter, singleTab.bornId, singleTab.history[0])
          );
          counter++;
        }
      });
    }
    chrome.storage.local.set({
      node: uploadNode,
      obj: TrustfulButler,
      pic: Gallery,
      edge: uploadEdge,
    });
  }
}
class OneTab {
  constructor(tabId, openerTabId, openerId, openerUrl = "") {
    this.tabId = tabId;
    this.bornId = openerId; //webID
    this.openerTabId = openerTabId;
    this.bornUrl = openerUrl;
    this.x = 0;
    this.history = [];
    this.closed = false;
  }
}
class OneWeb {
  constructor(url, title, favIconUrl, x, code, tabID) {
    this.id = code;
    this.url = url;
    this.title = title;
    this.favIconUrl = favIconUrl;
    this.here = true;
    this.tabID = tabID;
    this.x = x;
    this.y = 0;
    this.openTab = []; //tabId put here
  }
}
class PopupNode {
  constructor(id, position, title, url, favIconUrl, tabID, exist, trackId) {
    this.id = id + "";
    this.position = position;
    this.type = "special";
    this.data = {
      title: title,
      url: url,
      favIconUrl: favIconUrl,
      tabId: tabID,
      exist: exist,
      trackId: trackId,
      focus: false,
    };
  }
}
class PopupConnection {
  constructor(id, source, target) {
    this.id = id + "e";
    this.source = source + "";
    this.target = target + "";
    this.type = "smoothstep";
  }
}

//init
var TrustfulButler = new Butler();
var Gallery = [];
var downloadData = true;
setTimeout(() => {
  if (downloadData) {
    chrome.storage.local.get(["obj", "pic"], function (result) {
      if (result.obj && result.obj === "{}") {
        //init install extension
        TrustfulButler.UploadData;
        chrome.storage.local.set({ pic: Gallery });
        chrome.storage.local.set({ obj: TrustfulButler });
      } else {
        // TrustfulButler = result.obj;
        // console.log(JSON.stringify(result.obj, undefined, 2));
        if (result.obj) {
          TrustfulButler.tabIdList = result.obj.tabIdList;
          TrustfulButler.tabLibrary = result.obj.tabLibrary;
          TrustfulButler.webLibrary = result.obj.webLibrary;
          TrustfulButler.mapYOrder = result.obj.mapYOrder;
          TrustfulButler.picWaitList = result.obj.picWaitList;
          TrustfulButler.group = result.obj.group;
          TrustfulButler.tabCombine = result.obj.tabCombine;
          TrustfulButler.webId = result.obj.webId;
          Gallery = result.pic;
          TrustfulButler.makeMapY();
          TrustfulButler.UploadData();
        }
      }
    });
  } else {
    TrustfulButler.makeMapY();
    TrustfulButler.UploadData();
  }
}, 50);
checkPic(); //repeat checking if screen shootting needed for every 0.6s because chrome limitted to do that twice a second

//chrome listener
chrome.tabs.onCreated.addListener((tab) => {
  // console.log("Create" + JSON.stringify(TrustfulButler, undefined, 2));
  if (TrustfulButler && TrustfulButler.tabCombine.flat().includes(tab.id)) {
    return;
  }
  CreateTab(tab);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo &&
    tab.favIconUrl &&
    tab.title &&
    !tab.title.startsWith("http") &&
    !tab.url.startsWith("chrome://") &&
    tab.status === "complete"
  ) {
    let x = TrustfulButler.tabCombineFilter(tabId);
    if (x && x !== -1) {
      TrustfulButler.WebUpdate(TrustfulButler.tabIdList.indexOf(x), tab);
    }
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  let x = TrustfulButler.tabCombineFilter(tabId);
  if (x && x !== -1) {
    TrustfulButler.Remove(TrustfulButler.tabCombineFilter(tabId));
  }
});
//contextMenu && Group
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: `Tab Tree`,
    title: "Tab Tree",
    contexts: ["page"],
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== `Tab Tree`) {
    return;
  }
  TrustfulButler.GroupTab(tab.windowId);
});
chrome.tabGroups.onCreated.addListener((tabGroup) => {
  chrome.tabGroups.update(tabGroup.id, { collapsed: true });
});
//message & group & action
chrome.runtime.onMessage.addListener((message, sender) => {
  if (typeof message === "string") {
    if (message === "enter") {
      TrustfulButler.inPage = true; //
      let position = TrustfulButler.webIdFind(
        TrustfulButler.tabIdList.indexOf(
          TrustfulButler.tabCombineFilter(sender.tab.id)
        ),
        sender.tab.url
      );
      if (position === -1) {
        position = 0;
      }
      chrome.storage.local.set({ position: position });
    }
    if (message === "leave") {
      TrustfulButler.inPage = false;
    }
    if (message === "dark") {
      chrome.action.setIcon({
        path: {
          32: "./assest/dark.png",
          24: "./assest/dark.png",
          16: "./assest/dark.png",
        },
      });
      console.log("dark");
    }
    if (message === "light") {
      chrome.action.setIcon({
        path: {
          32: "./assest/light.png",
          24: "./assest/light.png",
          16: "./assest/light.png",
        },
      });
      console.log("light");
    }
  } else {
    TrustfulButler.ClickEvent(message);
  }
});

//additional function
function CreateTab(tab) {
  if (tab.id <= 2 && downloadData) {
    //init data
    downloadData = false;
  }
  //new tab
  let thisTabIndex = TrustfulButler.tabIdList.length;
  TrustfulButler.tabIdList.push(tab.id);
  // console.log("Create" + JSON.stringify(tab, undefined, 2));
  if (
    tab.pendingUrl &&
    !tab.pendingUrl.startsWith("chrome://") &&
    tab.openerTabId
  ) {
    //same window open
    TrustfulButler.tabLibrary.push(new OneTab(tab.id, 0, 0));
    TrustfulButler.tabGroup(tab.openerTabId, tab.id);
    chrome.tabs.get(tab.openerTabId, (openerPage) => {
      //check openerId
      let oldTabIndex = TrustfulButler.tabIdList.indexOf(
        TrustfulButler.tabCombineFilter(openerPage.id)
      );
      {
        let oldWebId = TrustfulButler.webIdFind(oldTabIndex, openerPage.url);
        TrustfulButler.tabLibrary[thisTabIndex].openerTabId =
          TrustfulButler.tabIdList[oldTabIndex].tabId;
        TrustfulButler.tabLibrary[thisTabIndex].x =
          TrustfulButler.webLibrary[oldWebId].x + 1;
        TrustfulButler.tabLibrary[thisTabIndex].bornUrl = openerPage.url;
        TrustfulButler.tabLibrary[thisTabIndex].bornId = oldWebId;
        TrustfulButler.webLibrary[oldWebId].openTab.push(tab.id);
      }
      if (
        TrustfulButler.mapYOrder.length >
        TrustfulButler.tabLibrary[thisTabIndex].x
      ) {
        TrustfulButler.mapYOrder[
          TrustfulButler.tabLibrary[thisTabIndex].x
        ].push(tab.id);
      } else {
        TrustfulButler.mapYOrder.push([tab.id]);
      }
    });
  } else {
    //different window open
    TrustfulButler.tabLibrary.push(new OneTab(tab.id, 0, -1, "nope"));
    TrustfulButler.mapYOrder[0].push(tab.id);
    TrustfulButler.group.push([tab.id]);
  }
}

function checkPic() {
  if (TrustfulButler.inPage && TrustfulButler.picWaitList.length > 0) {
    chrome.tabs.query({ active: true }, (tabs) => {
      iterActive(tabs);
      setTimeout(checkPic, 600);
    });
  } else {
    setTimeout(checkPic, 600);
  }
}

function iterActive(tabs) {
  let targetWebId = -1;
  let targetWinId;
  let removePicIndex;
  tabs.every((tab) => {
    let posibleWeb = TrustfulButler.webIdFind(
      TrustfulButler.tabIdList.indexOf(TrustfulButler.tabCombineFilter(tab.id)),
      tab.url
    );
    removePicIndex = TrustfulButler.picWaitList.indexOf(posibleWeb);
    if (removePicIndex !== -1) {
      targetWebId = posibleWeb;
      targetWinId = tab.windowId;
      return false;
    } else {
      return true;
    }
  });
  if (targetWebId !== -1) {
    chrome.tabs.captureVisibleTab(targetWinId, { quality: 30 }, (dataUrl) => {
      Gallery[targetWebId] = dataUrl;
      TrustfulButler.picWaitList.splice(removePicIndex, 1);
      chrome.storage.local.set({ pic: Gallery });
    });
  } else {
    return;
  }
}
