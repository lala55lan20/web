//#region 接口队列功能
/* -▼ */

// 实例队列玩法:（适用于队列中的队列）
function CreateAPILoadQueue() {
    let pNew = null;
    let pAPIQueue = new WebAPILoadQueue();
    let pAPIBack = function () {
        pAPIQueue.CheckQueue(function () {
            pAPIBack();
        });
    };
    pNew = {
        pAPIQueue,
        pAPIBack,
    };
    return pNew;
}

/// 接口加载队列。
class WebAPILoadQueue {
    constructor() {
        this.pThis = null;
        this.aQueue = [];
        this.pActionBack = null;
        this.pIng = false;
        this.aEndAllActionQueueA = [];
        this.aEndAllActionQueueB = [];
        this.pEndAllQueueName = "A"; // A库在清空时，添加的东西都在B库，来回使用(为了解决一种情况下的bug，就是在回调中添加队列项时,当前回调因为结束，被删)。
    }

    SwitchEndAllQueueName() {
        if (this.pEndAllQueueName == "A") {
            this.pEndAllQueueName = "B";
        } else if (this.pEndAllQueueName == "B") {
            this.pEndAllQueueName = "A";
        }
    }

    AddEndAllQueue(pItem) {
        if (this.pEndAllQueueName == "A") {
            this.aEndAllActionQueueA.push(pItem);
        } else if (this.pEndAllQueueName == "B") {
            this.aEndAllActionQueueB.push(pItem);
        }
    }

    CheckEndAll() {
        if (this.aQueue.length > 0)
            return;

        this.SwitchEndAllQueueName();

        if (this.pEndAllQueueName == "A") {
            for (let pItem of this.aEndAllActionQueueB) {
                pItem();
            }
            this.aEndAllActionQueueB = [];
        } else if (this.pEndAllQueueName == "B") {
            for (let pItem of this.aEndAllActionQueueA) {
                pItem();
            }
            this.aEndAllActionQueueA = [];
        }
    }

    CheckQueue(pBack) {
        if (this.aQueue.length > 0) {
            this.pIng = true;
            let pItem = this.aQueue.shift();
            // console.error("头疼=>",pItem.pAPI.name,pItem);
            if (pItem.pParam) {
                pItem.pAPI(pItem.pParam, function (pData) {

                    if (pItem.pFunc) {
                        if (pData) {
                            pItem.pFunc(pData);
                        } else {
                            pItem.pFunc(null);
                        }
                    }
                    pBack();
                });
            } else {
                pItem.pAPI(function (pData) {
                    if (pItem.pFunc) {
                        if (pData) {
                            pItem.pFunc(pData);
                        } else {
                            pItem.pFunc(null);
                        }
                    }
                    pBack();
                });
            }
        } else {
            this.pIng = false;
            this.CheckEndAll();
        }
    };

    /// Add(函数,函数参数)
    Add(pAPIAction, pParam) {
        let pItem = {
            pAPI: pAPIAction,
            pFunc: null,
            pParam: pParam,
        };
        this.aQueue.push(pItem);
    }

    /// 上一个队列结束时调用。
    AddFunc(pAction) {
        if (this.aQueue.length <= 0)
            return;
        let pItem = this.aQueue[this.aQueue.length - 1];
        pItem.pFunc = pAction;
    }

    /// 队列开始。
    Start(pBack, pEndAll) {
        if (pEndAll)
            this.AddEndAllQueue(pEndAll);
        this.CheckEndAll();
        if (!this.pIng)
            this.CheckQueue(pBack);
    }
}

var m_pAPIQueue = null;
var m_pAPIBack = null;

function WebAPILoadQueueInit() {
    m_pAPIQueue = new WebAPILoadQueue();
    m_pAPIBack = function () {
        m_pAPIQueue.CheckQueue(function () {
            m_pAPIBack();
        });
    };

}
WebAPILoadQueueInit();

/* -▲ */
//#endregion 接口队列功能 end



//#region config3d.txt配置
/* -▼ */

var g_pConfig3d;

function InitConfig3d(pPath, pBack) {
    g_pConfig3d = new Config3d();
    g_pConfig3d.LoadConfig3d(pPath, function () {
        pBack();
    });
}

 


class Config3d {
    constructor() {
        // -project包的相关配置-
        this.m_pProjectBaoInfo = {
            baoLocalPath: "",
            firstBaoNameAndExtList: [],
            projectBaoNameAndExt: "",
        };
        // -定制模型相关信息- 
        this.m_pCustomModelInfo = {
            customBaoLocalPath: "",
            customModelList: [],
        };
        // -miaokit相关信息- 
        this.m_pMiaokitInfo = {
            projectIdent: null,
            host: null,
            testPOIMode: null,
            // 屏幕尺寸相关 
            canvasWidthScale: null,
            canvasHeightScale: null,
            canvasLeftWidth: [],
            canvasTopHeight: [],
        };
    }

    //#region -成员函数
    /* -▼ */

    LoadConfig3d(pPath, pBack) {
        let pThis = g_pConfig3d;
        pThis.AJAXText(pPath, 'get', function (pData) {
            if (!pData) {
                console.error("-config3d文件加载失败-");
                pBack();
                return;
            }

            let lRowList = pData.split('\n');
            for (let pRow of lRowList) {
                if (!pRow)
                    continue;
                if (pRow.indexOf("=") == -1)
                    continue;
                if (pRow.indexOf("////") != -1) {
                    pRow = pRow.split('////')[0];
                }
                if (!pRow)
                    continue;

                pThis.CheckFillData(pRow);
            }

            pBack();
        });
    }

    /// 检测每行数据并填充。
    CheckFillData(pRow) {
        let pThis = g_pConfig3d;
        let aRowCur = pRow.split('=');
        let pName = aRowCur[0].trim();
        let pInfo = aRowCur[1];

        if (pInfo == '""')
            return;

        switch (pName) {
            // -project包的相关配置- 
            case "baoLocalPath":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pProjectBaoInfo.baoLocalPath = pInfo;
                break;
            case "firstBaoNameAndExtItem":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pProjectBaoInfo.firstBaoNameAndExtList.push(pInfo);
                break;
            case "projectBaoNameAndExt":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pProjectBaoInfo.projectBaoNameAndExt = pInfo;
                break;
            // -定制模型相关信息- 
            case "customBaoLocalPath":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pCustomModelInfo.customBaoLocalPath = pInfo;
                break;
            case "customModelItem":
                var aInfos = pInfo.split(',');
                var pItem = {
                    pFileNameAndExt: pThis.GetCutValue(aInfos[0], '"', '"'),
                    pWorkId: pThis.GetCutValue(aInfos[1], '"', '"'),
                };
                pThis.m_pCustomModelInfo.customModelList[pItem.pWorkId] = pItem;
                break;
            // -miaokit相关信息- 
            case "projectIdent":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pMiaokitInfo.projectIdent = pInfo;
                break;
            case "host":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pMiaokitInfo.host = pInfo;
                break;
            case "testPOIMode":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pThis.m_pMiaokitInfo.testPOIMode = JSON.parse(pInfo);
                break;
            // 屏幕尺寸相关 
            case "canvasWidthScale":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pInfo = JSON.parse(pInfo);
                pThis.m_pMiaokitInfo.canvasWidthScale = pInfo;
                break;
            case "canvasHeightScale":
                pInfo = pThis.GetCutValue(pInfo, '"', '"');
                pInfo = JSON.parse(pInfo);
                pThis.m_pMiaokitInfo.canvasHeightScale = pInfo;
                break;
            case "canvasLeftWidth":
                var aInfos = pInfo.split(',');
                var pInfo0 = pThis.GetCutValue(aInfos[0], '"', '"');
                pInfo0 = JSON.parse(pInfo0);
                var pInfo1 = pThis.GetCutValue(aInfos[1], '"', '"')
                pInfo1 = JSON.parse(pInfo1);
                pThis.m_pMiaokitInfo.canvasLeftWidth.push(pInfo0);
                pThis.m_pMiaokitInfo.canvasLeftWidth.push(pInfo1);
                break;
            case "canvasTopHeight":
                var aInfos = pInfo.split(',');
                var pInfo0 = pThis.GetCutValue(aInfos[0], '"', '"');
                pInfo0 = JSON.parse(pInfo0);
                var pInfo1 = pThis.GetCutValue(aInfos[1], '"', '"')
                pInfo1 = JSON.parse(pInfo1);
                pThis.m_pMiaokitInfo.canvasTopHeight.push(pInfo0);
                pThis.m_pMiaokitInfo.canvasTopHeight.push(pInfo1);
                break;
            // xxxx相关 

        }
    }

    GetCutValue(pStr, pL, pR) {
        pStr = pStr.match(new RegExp(pL + "(" + "\\" + "S*)" + pR));
        if (!pStr) {
            pStr = "";
        } else {
            pStr = pStr[1];
        }
        return pStr;
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 加载文本。
    AJAXText(pUrl, pType = "get", pCallback) {
        $.ajax({
            type: pType,
            url: pUrl,
            async: true,
            dataType: 'text',
            beforeSend: function () { },
            success: function (data) {
                pCallback(data);
            },
            error: function (err) {
                console.info('AJAX Error: ', err);
                pCallback(null);
            }
        });
    }

    /* -▲ */
    //#endregion -数据加载 end
}

/* -▲ */
//#endregion config3d.txt配置 end



//#region 定制模型功能(调用完InitCustomModel,记得把 UpdateCustomModel() 放Update里调用调用了)
/* -▼ */

var g_pCustomModel;

/// 初始化(可以多次调用)
function InitCustomModel(pCustomModelInfo, pBack) {
    if (!g_pCustomModel)
        g_pCustomModel = new CustomModel();
    g_pCustomModel.LoadCustomModel(pCustomModelInfo, function () {
        if (pBack)
            pBack();
    });
}

/// 帧里组装模型。
function UpdateCustomModel() {
    if (!g_pCustomModel)
        return;
    g_pCustomModel.Update();
}

/// 显示模型。
function OpenModelByWorkId(pWorkId) {
    if (!g_pCustomModel)
        return;
    g_pCustomModel.OpenModelByWorkId(pWorkId);
}

/// 定制模型功能。
class CustomModel {
    constructor() {
        /// 模块总闸。
        this.bModeSwitch = true;

        /// -定制模型相关信息- 
        this.m_pCustomModelInfo = {
            customBaoLocalPath: "",
            customModelList: new Array(),
        };

        /// 加载项列表。
        this.m_lLoadItemList = new Array();

        /// 实体列表。
        this.m_lEntityList = new Array();

        /// MyModel列表。
        this.m_lMyModelList = new Array();

        /// 模型根物体。
        this.m_pModelObjectRoot = null;

        /// 所有项加载结束。
        this.m_pEndAllAction = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = g_pCustomModel;

        return !pThis.bModeSwitch;
    }

    LoadCustomModel(pCustomModelInfo, pBack) {
        let pThis = g_pCustomModel;
        pThis.m_pCustomModelInfo.customBaoLocalPath = pCustomModelInfo.customBaoLocalPath;
        for (let pItemName in pCustomModelInfo.customModelList) {
            let pItem = pCustomModelInfo.customModelList[pItemName];
            pThis.m_pCustomModelInfo.customModelList[pItemName] = pItem;
        }
        pThis.m_pEndAllAction = pBack;
        pThis.CheckModelObjectRoot();
        pThis.FillData();
        pThis.StartLoad();
    }

    CheckModelObjectRoot() {
        let pThis = g_pCustomModel;
        if (pThis.m_pModelObjectRoot)
            return;
        pThis.m_pModelObjectRoot = new GameObject("-ExclusiveModelRoot", GameObjectType.Empty);
        pThis.m_pModelObjectRoot.parent = MiaokitDC.DC.m_pProjectRoot;
    }

    FillData() {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            return;
        }

        for (let pWork of MiaokitDC.DC.m_aWork) {
            if (pWork == null)
                continue;
            for (let pItemName in pThis.m_pCustomModelInfo.customModelList) {
                let pItem = pThis.m_pCustomModelInfo.customModelList[pItemName];
                if (pItem.pWorkId == pWork.m_pID) {
                    // 有效数据。
                    let pFileNameAndExt = pItem.pFileNameAndExt;
                    if (!pThis.m_lLoadItemList[pFileNameAndExt]) {
                        // 新加载项。
                        let pNewLoadItem = pItem;
                        pThis.m_lLoadItemList[pFileNameAndExt] = {
                            pFileNameAndExt: pNewLoadItem.pFileNameAndExt,
                            pWorkId: pNewLoadItem.pWorkId,
                            nLoadActive: 0,
                        };
                        // 新实体。
                        let pNewEntity = {
                            pObject: null,
                            bEnabled: false,
                        };
                        pThis.m_lEntityList[pFileNameAndExt] = pNewEntity;
                        pThis.m_lEntityList[pFileNameAndExt].pObject = new GameObject("--ExclusiveModel_" + pFileNameAndExt, GameObjectType.Empty);
                        pThis.m_lEntityList[pFileNameAndExt].pObject.parent = pThis.m_pModelObjectRoot;
                        pThis.m_lEntityList[pFileNameAndExt].pObject.SetActive(false);
                    }
                }
            }
        }
    }

    /// 开始加载。
    StartLoad() {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            return;
        }

        // 队列加载
        let pLQ = CreateAPILoadQueue();
        for (let pItemName in pThis.m_lLoadItemList) {
            let pItem = pThis.m_lLoadItemList[pItemName];
            if (pItem.nLoadActive === 1)
                continue;
            pItem.nLoadActive = 1;
            pLQ.pAPIQueue.Add(pThis.LoadModel, pItem);
        }
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            if (pThis.m_pEndAllAction)
                pThis.m_pEndAllAction();
        });
    }

    /// 帧组装模型。
    Update() {
        let pThis = g_pCustomModel;

        if (pThis.IfModeClose()) {
            return;
        }

        if (!pThis.m_lMyModelList)
            return;

        for (let pItemName in pThis.m_lMyModelList) {
            let pItem = pThis.m_lMyModelList[pItemName];
            pItem.Update();
        }
    }

    /// 根据场景Id打开定制模型。
    OpenModelByWorkId(pWorkId) {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            return;
        }

        if (!pThis.m_pCustomModelInfo)
            return;

        let pFileNameAndExt = "";
        if (pThis.m_pCustomModelInfo.customModelList[pWorkId])
            pFileNameAndExt = pThis.m_pCustomModelInfo.customModelList[pWorkId].pFileNameAndExt;
        //
        for (let pItemName in pThis.m_lEntityList) {
            let pItem = pThis.m_lEntityList[pItemName];
            if (pItemName == pFileNameAndExt) {
                if (!pItem.bEnabled) {
                    pItem.pObject.SetActive(true);
                    pItem.bEnabled = true;
                }
            } else {
                if (pItem.bEnabled) {
                    pItem.pObject.SetActive(false);
                    pItem.bEnabled = false;
                }
            }
        }
    }

    /// 加载单个定制模型。
    LoadModel(pItem, pBack) {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            return;
        }

        let pFileNameAndExt = pItem.pFileNameAndExt;
        let pLocalPath = "./" + pThis.m_pCustomModelInfo.customBaoLocalPath + "/" + pFileNameAndExt;
        pThis.LoadZip(pLocalPath, function (pZip) {
            // 
            let aGroupList = null;
            aGroupList = pThis.GetGroupList(pZip);
            // 
            let aItemQueue = new Array();
            //
            pThis.LoadGroupList(pZip, aGroupList, aItemQueue, function () {
                //
                let pMyModel = new MyModel(pThis.m_lEntityList[pFileNameAndExt].pObject);
                pThis.m_lMyModelList[pFileNameAndExt] = pMyModel;
                //
                pThis.m_lMyModelList[pFileNameAndExt].StartLoadData(aItemQueue.length, aItemQueue, function () {
                    //
                    pBack();
                });
            });
        });
    }

    GetGroupList(pZip) {
        let pThis = g_pCustomModel;
        if (!pZip)
            return null;
        let aGroupList = new Array();
        for (let pNameAntExt in pZip.files) {
            let aIndexAndExt = pThis.GetIndexAndExt(pNameAntExt);
            if (!aIndexAndExt)
                continue;
            let nIndex = aIndexAndExt[0];
            let pExt = aIndexAndExt[1];
            if (!aGroupList[nIndex])
                aGroupList[nIndex] = {
                    nIndex: null,
                    pMeshNameAndExt: null,
                    pImgNameAndExt: null
                };
            if (!nIndex)
                continue;
            if (!pExt)
                continue;
            aGroupList[nIndex].nIndex = nIndex;
            pExt = pExt.toLowerCase();
            switch (pExt) {
                case "bin":
                    aGroupList[nIndex].pMeshNameAndExt = pNameAntExt;
                    break;
                case "jpg":
                    aGroupList[nIndex].pImgNameAndExt = pNameAntExt;
                    break;
                case "png":
                    aGroupList[nIndex].pImgNameAndExt = pNameAntExt;
                    break;
            }
        }
        return aGroupList;
    }

    GetIndexAndExt(pStr) {
        if (pStr.indexOf(".") == -1)
            return null;
        let aPart = pStr.split('.');
        let pName = aPart[0];
        let pExt = aPart[aPart.length - 1];
        let nIndex = pName.replace(/[^0-9]/ig, "");
        return [nIndex, pExt];
    }

    LoadGroupList(pZip, aGroupList, aItemQueue, pBack) {
        let pThis = g_pCustomModel;
        let pLQ = CreateAPILoadQueue();
        for (let pGroup of aGroupList) {
            let pItem = new Item();
            pItem.m_nIndex = pGroup.nIndex;
            pItem.m_aData = null;
            pItem.m_pTexture = null;
            aItemQueue.push(pItem);
            // mesh
            if (pGroup.pMeshNameAndExt) {
                let pMeshInfo = {
                    pZip: pZip,
                    pUrl: pGroup.pMeshNameAndExt,
                };
                pLQ.pAPIQueue.Add(pThis.LoadZipTheMesh, pMeshInfo);
                pLQ.pAPIQueue.AddFunc(function (pData) {
                    pItem.m_aData = pData;
                });
            }
            // img
            if (pGroup.pImgNameAndExt) {
                let pImgInfo = {
                    pZip: pZip,
                    pUrl: pGroup.pImgNameAndExt,
                };
                pLQ.pAPIQueue.Add(pThis.LoadZipTexture, pImgInfo);
                pLQ.pAPIQueue.AddFunc(function (pTexture) {
                    pItem.m_pTexture = pTexture;
                });
            }
        }
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            pBack();
        });
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 加载zip。
    LoadZip(pLocalPath, pBack) {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            pBack();
            return;
        }
        fetch(pLocalPath).then(function (response) {
            if (response.status === 200 || response.status === 0) {
                return Promise.resolve(response.blob());
            } else {
                console.error("找不到zip->" + pLocalPath);
                return Promise.reject(new Error(response.statusText));
            }
        }).then(JSZip.loadAsync).then(function (zip) {
            pBack(zip);
        });
    }

    /// 加载Zip中的单张图片。
    LoadZipTexture(pInfo, pBack) {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            return;
        }
        let pUrl = pInfo.pUrl;
        let pZip = pInfo.pZip;
        let pFile = pZip.file(pUrl);
        if (pFile != undefined && pFile != null) {
            pFile.async("base64").then(function success(bytes) {
                let pTexture = new THREE.Texture();
                let pImage = new Image();
                let pType = pUrl.substr(pUrl.lastIndexOf(".") + 1);
                pImage.src = "data:image/" + pType + ";base64," + bytes;
                pTexture.image = pImage;
                pTexture.format = (pType === "jpg" || pType === "jpeg") ? THREE.RGBFormat : THREE.RGBAFormat;
                pTexture.needsUpdate = true;
                pBack(pTexture);
            }, function error(err) {
                console.error("-配置文件可能错误-");
                pBack(null);
            });
        }
    }

    /// 加载Zip中的单个mesh。
    LoadZipTheMesh(pInfo, pBack) {
        let pThis = g_pCustomModel;
        if (pThis.IfModeClose()) {
            pBack();
            return;
        }
        let pUrl = pInfo.pUrl;
        let pZip = pInfo.pZip;
        pZip.file(pUrl).async("arraybuffer").then(function success(data) {
            pBack(data);
        }, function error(err) {
            console.error("-配置文件可能错误-");
            pBack(null);
        });
    }


    /* -▲ */
    //#endregion -数据加载 end
}

/* -▲ */
//#endregion 定制模型功能 end



//#region project加载相关
/* -▼ */

var g_pProjectLoad;

function InitProjectLoad(pProjectInfo, pBack) {
    g_pProjectLoad = new ProjectLoad();
    g_pProjectLoad.LoadProjectLoad(pProjectInfo, function () {
        if (pBack)
            pBack();
    });
}

class ProjectLoad {
    constructor() {
        // -project包的相关配置-
        this.m_pProjectBaoInfo = {
            baoLocalPath: "",
            firstBaoNameAndExtList: [],
            projectBaoNameAndExt: "",
        };

        this.m_lProjectDic = new Array();
    }

    LoadProjectLoad(pProjectInfo, pBack) {
        let pThis = g_pProjectLoad;
        pThis.m_pProjectBaoInfo = pProjectInfo;
        let lFirstBaoNameAndExtList = pThis.m_pProjectBaoInfo.firstBaoNameAndExtList;
        let pLQ = CreateAPILoadQueue();
        for (let pItem of lFirstBaoNameAndExtList) {
            pLQ.pAPIQueue.Add(pThis.LoadZip, pItem);
        }
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            pBack();
        });
    }

    /// 加载资源包。
    LoadZip(pBaoNameAndExt, pCallback) {
        let pThis = g_pProjectLoad;
        if (pThis.m_lProjectDic[pBaoNameAndExt] === undefined) {
            pThis.m_lProjectDic[pBaoNameAndExt] = null;
        }
        if (pThis.m_lProjectDic[pBaoNameAndExt]) {
            pCallback(pThis.m_lProjectDic[pBaoNameAndExt]);
            return;
        }

        pThis.LoadZipPuzzle(pBaoNameAndExt, function (pZip) {
            pThis.m_lProjectDic[pBaoNameAndExt] = pZip;
            pCallback(pZip);
        });
    }

    LoadZipPuzzle(pBaoNameAndExt, pCallback) {
        let pThis = g_pProjectLoad;
        let pFulllocalPath = "./" + pThis.m_pProjectBaoInfo.baoLocalPath + "/" + pBaoNameAndExt;
        fetch(pFulllocalPath).then(function (response) {
            if (response.status === 200 || response.status === 0) {
                return Promise.resolve(response.blob());
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        }).then(JSZip.loadAsync).then(function (zip) {
            pCallback(zip);
        });
    }
}

/* -▲ */
//#endregion project加载相关