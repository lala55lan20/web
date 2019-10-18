

/// 全局变量与配置项
let GLOBAL = {
    pConfig: null,
    pEngine: null,

    pWorkListUrl: "api/info/getBuildingListH5.php",
    pLayerListUrl: "api/info/getFloorListH5.php?id=",
    pRoomListUrl: "api/info/getroomlistH5.php",

    pWorkList: [],
    pLayerList: [],
    pRoomList: [],
    pInfrasList: [],

    // 当前所处楼宇，处于外景时该值为空
    pCurBuilding: null,
    // 当前所处楼宇，处于外景时该值为空
    pCurLayer: null,
    // 楼宇图标点击事件
    pBuildingClick: null,
    // 笛卡尔坐标系转GIS经纬度
    pCartesianToGis: null,
    // GIS经纬度转笛卡尔坐标系
    pGisToCartesian: null,

    // SDK开放接口
    Do: {
        // SDK初始化
        Init: Init,
        // SDK启动运行
        Start: Start,
        // SDK暂停运行
        Stop: Stop,
        // 重设画布大小
        Resize: Resize,
        // 切换视图模式，2表示2D模式、3表示3D模式
        SwitchView: SwitchView,
        // 设置摄像机视角。参数分布为观察目标坐标，仰角，偏航角，3D距离观察点距离/2D观察范围大小
        SetCamera: SetCamera,
        // 切换室内外场景
        SwitchScene: SwitchScene,
        // 切换楼层
        SwitchLayer: SwitchLayer,
        // 设置叠加楼层
        StackUp: StackUp,
        // 基于距离和类型过滤POI列表
        FilterPOI: FilterPOI,
        /// 搜索路径：参数分别为起点ID、终点ID、优先楼层通道类型（0：最近、1楼梯、2电梯、3扶梯）
        Navigate: Navigate,
        /// 是否将视角锁定在摄像机上，还是可以自由浏览地图
        LockCameraToPath: LockCameraToPath,
        /// 三维坐标转屏幕坐标
        WorldToScreen: WorldToScreen,
        /// 屏幕坐标转三维坐标
        ScreenToWorld: ScreenToWorld
    },

    // SDK用户根据需要自定义实现以下响应函数
    Action: {
        // 主进度条更新
        pMajorProgress: function (bShow, nRate) { },
        // 副进度条更新
        pMinorProgress: function (bShow, nRate) { },
        // 帧更新函数
        pUpdate: function () { },
        // 帧POI绘制函数
        pDrawPOI: DrawPOI,
        // 楼层列表刷新
        pLayerListFlush: function (nLayerCount, nWorkIndex) { },
        // 室内外切换响应
        pOutsideSwich: function (bOut) { },
        // 2D/3D切换响应
        pViewSwich: function (nView) { },
        // 指南针旋转更新
        pCompassUpdate: function (nDeg) { },
        // 楼层激活响应
        pLayerActive: function (nIndex) { },
        // 楼层显示响应
        pLayerShow: function (nIndex) { },
        // 光标位置信息反馈
        pCursorInfo: function (pID, pName, mPos, pEvent) { },
        // 导航路径信息反馈
        pPathDataFeedback: function (aPoint) { },
        // 导航提示信息反馈
        pHintFeedback: function (pID, pName, mPos, pEvent) { },
        // 鼠标单击画布反馈
        pOnClick: function (pPoint) { },

        // 隐藏拾取光标
        pHideCursor: null, // hideSetPoint
        // 获取基站列表
        pStationListFeedback: null, // getBleList
        // 获取导航动画类型
        pGetAnimateType: null, // getAnimateType
        // 搜索路径失败响应
        pPathNotFound: null // notFoundRoute
    }
};

/// SDK初始化方法
function Init(pConfig, pCallback) {
    GLOBAL.pConfig = pConfig;
    
    if (IsProject("")) {
        pConfig.pCallback = pCallback;
        pConfig.pZipLoader = LoadZip;
        pConfig.pUpdate1 = GLOBAL.Action.pMajorProgress;
        pConfig.pUpdate2 = GLOBAL.Action.pMinorProgress;
        pConfig.pUpdate = function () {
            GLOBAL.pBuildingClick = null;
            GLOBAL.Action.pUpdate();
        };
        pConfig.pDrawPOI = GLOBAL.Action.pDrawPOI;
        pConfig.pLayerUpdate = GLOBAL.Action.pLayerListFlush;
        pConfig.pOutWorkBack = GLOBAL.Action.pOutsideSwich;
        pConfig.pSwichViweModelBack = GLOBAL.Action.pViewSwich;
        pConfig.pCompass = GLOBAL.Action.pCompassUpdate;
        pConfig.pChooseLayer = GLOBAL.Action.pLayerActive;
        pConfig.pShowActiveLayer = GLOBAL.Action.pLayerShow;
        pConfig.pSetNavPoint = GLOBAL.Action.pCursorInfo;
        pConfig.pNavBack = GLOBAL.Action.pPathDataFeedback;
        pConfig.pVoicePost = GLOBAL.Action.pHintFeedback;
        pConfig.pOnClick = GLOBAL.Action.pOnClick;
        pConfig.pChickTouchMove = GLOBAL.Action.pHideCursor;
        pConfig.pPostBlueToothList = GLOBAL.Action.pStationListFeedback;
        pConfig.pMovie = GLOBAL.Action.pGetAnimateType;
        pConfig.pNoFindPath = GLOBAL.Action.pPathNotFound;
    
        {
            // 经线上，100米间隔0.0009度
            // 纬线上，100米间隔0.1 / (111 * cosα)度
            // 确定三维场景中心点经纬度，在根据偏移距离指定位置经纬度
    
            let mScale = new THREE.Matrix4();
            mScale.makeScale(0.000009, 1.0, 0.001 / (111 * Math.cos(GLOBAL.pConfig.mCoord.lat)));
    
            let mRotation = new THREE.Matrix4();
            mRotation.makeRotationY(-GLOBAL.pConfig.nCompassBias / 180 * 3.141592654);
    
            let mTransform = new THREE.Matrix4();
            mTransform.multiplyMatrices(mScale, mRotation);
    
            let mTransformInv = new THREE.Matrix4();
            mTransformInv.getInverse(mTransformInv, true);
    
            GLOBAL.pCartesianToGis = mTransform;
            GLOBAL.pGisToCartesian = mTransformInv;
        }
    
        LoadData(function () {
            pConfig.pSiteData = GLOBAL.pInfrasList.concat(GLOBAL.pRoomList);
            pConfig.pFloorData = GLOBAL.pLayerList;
    
            GLOBAL.pEngine = new Engine();
            GLOBAL.pEngine.Init(pConfig);
    
        });
    }

    if (IsProject("EAM"))
    {
        EAM = new EAMProject();
        EAM.Init(pConfig, pCallback);
    }
}

// 项目判断。
function IsProject(pProjectIdent) {
    if (pProjectIdent == GLOBAL.pConfig.pProjectIdent) {
        return true;
    } else {
        return false;
    }
}

/// SDK启动函数
function Start() {
    Engine.g_pInstance.Start();
}

/// SDK暂停函数
function Stop() {
    Engine.g_pInstance.Stop();
}

// 重设画布大小
function Resize(nWidth, nHeight) {
    Engine.g_pInstance.Resize(window.innerWidth, window.innerHeight);
}

/// 切换视图模式，2表示2D模式、3表示3D模式
function SwitchView(nMode) {
    if (2 === nMode) {
        MiaokitDC.DC.viewMode = ViewMode.View2D;
    }
    else {
        MiaokitDC.DC.viewMode = ViewMode.View3D;
    }
}

/// 设置摄像机视角。参数分布为观察目标坐标，仰角，偏航角，3D距离观察点距离/2D观察范围大小。某项参数赋值为undefined则维持其状态由鼠标控制
function SetCamera(mTarget, nPitch, nYaw, nDistance) {
    Engine.g_pInstance.m_pCameraCtrl.ResetCamera(mTarget, nPitch, nYaw, nDistance);
}

/// 切换室内外场景
function SwitchScene(pName) {
    if (!pName) {
        GLOBAL.pCurBuilding = null;
        Engine.g_pInstance.m_pProject.GoOutWork();
    }
    else {
        for (pWork of GLOBAL.pWorkList) {
            if (pWork.building_name === pName) {
                GLOBAL.pCurBuilding = pWork;
                Engine.g_pInstance.m_pProject.SwitchWork(pWork.building_id);
                break;
            }
        }
    }
}

/// 切换楼层
function SwitchLayer(pName) {
    GLOBAL.pCurLayer = null;

    if (GLOBAL.pCurBuilding) {
        let pLayerList = GLOBAL.pCurBuilding.layerList;

        for (let i = 0; i < pLayerList.length; i++) {
            if (pLayerList[i].floor_name === pName) {
                GLOBAL.pCurLayer = pLayerList[i];
                Engine.g_pInstance.m_pProject.ActiveFloor(i);
                break;
            }
        }
    }
}

/// 设置叠加楼层。
function StackUp(bActive) {
    Engine.g_pInstance.m_pProject.StackUp(bActive);
}

/// 点击楼宇图标
function ClickBuilding(pPoint) {
    GLOBAL.pBuildingClick = pPoint;
}

/// 基于距离和类型过滤POI列表
function FilterPOI(bEnable, mCenter, nRadius, aType) {
    Engine.g_pInstance.FilterPOI(bEnable, mCenter, nRadius, aType);
}

/// 搜索路径：参数分别为起点ID、终点ID、优先楼层通道类型（0：最近、1楼梯、2电梯、3扶梯）
function Navigate(pStartID, pEndID, nType = 0) {
    Engine.g_pInstance.m_pProject.Navigate(pStartID, pEndID, nType);
}

/// 是否将视角锁定在摄像机上，还是可以自由浏览地图
function LockCameraToPath(bLock) {
    NNavigation.LockCameraToPath(bLock);
}

/// 三维坐标转屏幕坐标
function WorldToScreen(mPos) {
    return Engine.g_pInstance.m_pCameraCtrl.WorldToScenePos(mPos);
}

/// 屏幕坐标转三维坐标
function ScreenToWorld(mPoint) {
    return Engine.g_pInstance.m_pCameraCtrl.TouchPoint({ pageX: mPoint.x, pageY: mPoint.y });
}

/// 三维坐标转经纬度
function WorldToLonLat(mPos) {
    return new THREE.Vector3(mPos.x, 0, mPos.z).applyMatrix4(GLOBAL.pCartesianToGis);
}

/// 经纬度转三维坐标
function LonLatToWorld(mPoint) {
    return new THREE.Vector3(mPoint.x, 0, mPoint.z).applyMatrix4(GLOBAL.pGisToCartesian);
}

///==数据加载================---------------------------------

/// 接口请求函数
function AJAX(pUrl, pType = "get", pCallback) {
    $.ajax({
        type: pType,
        url: pUrl,
        async: true,
        dataType: 'json',
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

/// 加载资源包
function LoadZip(pCallback) {
    fetch('project.zip').then(function (response) {
        if (response.status === 200 || response.status === 0) {
            return Promise.resolve(response.blob());
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    }).then(JSZip.loadAsync).then(function (zip) {
        pCallback(zip);
    });
}

/// 加载位置点列表数据
function LoadSiteList(pCallback) {
    AJAX(GLOBAL.pConfig.pHost + GLOBAL.pRoomListUrl, 'get', function (roomList) {
        let pRoomList = GLOBAL.pRoomList;

        for (let item of roomList.response) {
            let pRoom = {
                HyID: parseInt(item.HyID),
                roomID: item.roomID,
                floorID: item.floorID,
                buildingID: "默认值",
                companyName: item.companyName,
                iconUrl: item.iconUrl,
                imgUrl: item.imgUrl
            };

            if (2 > pRoom.HyID) {
                pRoom.HyID = 0;
            }

            pRoomList.push(pRoom);
        }

        pCallback();
    });
}

/// 加载指定场景的楼层列表数据
function LoadLayerList(pWork, pCallback) {
    AJAX(GLOBAL.pConfig.pHost + GLOBAL.pLayerListUrl + pWork.id, 'get', function (layerList) {
        let pLayerList = GLOBAL.pLayerList;
        let aResponse = layerList.response ? layerList.response : [];

        for (let item of aResponse) {
            let pLayer = {
                id: item.FloorID,
                b_id: item.FloorID,
                floor_id: item.FloorID,
                icon: item.iconUrl,
                floor_name: item.name,
                is_default: "0",
                detail: item.name,
                build_num: pWork.building_id,
                build_name: pWork.building_name
            };

            pLayerList.push(pLayer);
            pWork.layerList.push(pLayer);
        }

        pCallback();
    });
}

/// 加载指定场景的楼层列表数据
function LoadWorkList(pCallback) {
    AJAX(GLOBAL.pConfig.pHost + GLOBAL.pWorkListUrl, 'get', function (workList) {
        let nWorkCount = workList.response.length;
        let pWorkList = GLOBAL.pWorkList;

        for (let item of workList.response) {
            let pWork = {
                id: item.ID,
                icon_url: item.Icon,
                building_id: item.BuildingNum,
                building_name: item.Name,
                layerList: []
            };

            pWorkList.push(pWork);

            LoadLayerList(pWork, function () {
                if (0 === --nWorkCount) {
                    LoadSiteList(function () {
                        pCallback();
                    });
                }
            });
        }
    });
}

/// 加载后台数据
function LoadData(pCallback) {
    LoadWorkList(pCallback);
}

/// 绘制POI
function DrawPOI(pCavans, pSite) {
    pCavans.fillStyle = "#606060";
    pCavans.font = "bold 14px Microsoft YaHei";
    pCavans.strokeStyle = "white";
    pCavans.lineWidth = 2;
    pCavans.strokeText(pSite.Name, pSite.Position.x + 10, pSite.Position.y);
    pCavans.fillText(pSite.Name, pSite.Position.x + 10, pSite.Position.y);

    if (pSite.Image) {
        if (0 > pSite.Type) {
            pCavans.drawImage(pSite.Image, pSite.Position.x - 28, pSite.Position.y - 20, 32, 32);

            if (CheckClick(GLOBAL.pBuildingClick, pSite.Position)) {
                GLOBAL.pBuildingClick = null;
                SwitchScene(pSite.Name);
            }
        }
        else {
            pCavans.drawImage(pSite.Image, pSite.Position.x - 9, pSite.Position.y - 14, 18, 18);
        }
    }
}

/// 判断是否点击命中
function CheckClick(pClick, mPosition) {
    if (pClick) {
        let nDistance = Vector3.Distance(mPosition, pClick);
        if (32 > nDistance) {
            return true;
        }
    }

    return false;
}

