class NewALinerMgr {
    constructor() {

    }

    ggStackUp(nFocus) {

        console.error("叠加");

        let nLength = this.m_pLayerList.length;
        let nIndex = 0;
        for (let i = -nFocus; i < nLength - nFocus; i++) {
            let pLayer = this.m_pLayerList[nIndex++];
            if (pLayer != null) {
                let mPosition = pLayer.m_pLayerRoot.position;
                mPosition.y = 16.0 * i;
                pLayer.m_pLayerRoot.position = mPosition;
                pLayer.m_pLayerRoot.m_pObject.updateMatrixWorld();
                if (0 == i) {
                    if (Engine.g_pInstance.m_pProjectIdent == "EAM") {
                        if (this.m_pActiveLayer != pLayer)
                            pLayer.ActiveScene(1);
                        this.m_pActiveLayer = pLayer;
                        this.FitViewMode();
                    }
                    else {
                        pLayer.ActiveScene(1);
                        this.m_pActiveLayer = pLayer;
                        this.FitViewMode();
                    }
                }
                else {
                    if (!ALinerDC.g_bStackUp) {
                        pLayer.ActiveScene(0);
                    }
                    else {
                        pLayer.ActiveScene(2);
                    }
                }
            }
        }

    };

}

/// EAM项目全局变量。
let EAM = null;

/// EAM项目。
class EAMProject {
    constructor() {
        this.pConfig = null;
        this.pEngine = null;

        this.pImgJointUrl = "/upload/";
        this.aAPI = [
            ["api/home/index/getAreaAndBuildingList", "./data/Json_3D/getAreaAndBuildingList.json"],//0
            ["api/home/index/getRoomList", "./data/Json_3D/getRoomList.json"],//1
            ["api/home/index/getBuildInfoById?buildId={0}", "./data/Json_3D/getBuildInfoById&buildId={0}.json"],//2
            ["api/home/index/getFloorListById?buildId={0}", "./data/Json_3D/getFloorListById&buildId={0}.json"],//3
            ["api/home/index/getUseroomState", "./data/Json_3D/getUseroomState.json"],//4
            ["", ""],//5
            ["", "./data/Json_3D/getRoadList.txt"],//6
        ];

        this.bNetWorkAPI = true;//加载网络接口。

        this.aWorkList = [];
        this.aLayerList = [];
        this.aRoomList = [];
        this.aInfrasList = [];

        this.m_pEamInfrasView = null;
        this.m_pEamInteriorView = null;
        this.m_pEamRoomStatusView = null;
        this.m_pEamLayerListView = null;
        this.m_pEamProcessView = null;
        this.m_pEamBuildBoard = null;
        this.m_pEamRoomBoard = null;
        this.m_pEamPanoramaBoard = null;
        this.m_pEamRoomStatusMode = null;
        this.m_pEamIdTrans = null;
        this.m_pEamPOIBoard = null;
        this.m_pEamCanvasHandle = null;
        this.m_pEamAPILoadQueue = null;

        /// 加载检查次数。
        this.m_nLoadCheckSize = 1;
        this.m_bLoadEndWork3d = false;
        this.m_nShowLv = 0;// 显示等级 0空 1节点 2实景 3模型
        this.m_nWorkType = -1;//空间类型 -1地球 0校区 1楼宇 2楼层
        //  

        // 当前所处楼宇，处于外景时该值为空
        this.pCurWork = null;
        // 当前所处楼宇，处于外景时该值为空
        this.pCurLayer = null;
        // 点击的2维位置点
        this.pV2Click = null;
        // 笛卡尔坐标系转GIS经纬度
        this.pCartesianToGis = null;
        // GIS经纬度转笛卡尔坐标系
        this.pGisToCartesian = null;

        // SDK开放接口
        this.Do = {
            // SDK初始化
            Init: this.Init,
            // SDK启动运行
            Start: this.Start,
            // SDK暂停运行
            Stop: this.Stop,
            // 重设画布大小
            Resize: this.Resize,
            // 切换视图模式，2表示2D模式、3表示3D模式
            SwitchView: this.SwitchView,
            // 设置摄像机视角。参数分布为观察目标坐标，仰角，偏航角，3D距离观察点距离/2D观察范围大小
            SetCamera: this.SetCamera,
            // 切换室内外场景
            SwitchScene: this.SwitchScene,
            // 切换楼层
            SwitchLayer: this.SwitchLayer,
            // 设置叠加楼层
            StackUp: this.StackUp,
            // 基于距离和类型过滤POI列表
            FilterPOI: this.FilterPOI,
            /// 搜索路径：参数分别为起点ID、终点ID、优先楼层通道类型（0：最近、1楼梯、2电梯、3扶梯）
            Navigate: this.Navigate,
            /// 是否将视角锁定在摄像机上，还是可以自由浏览地图
            LockCameraToPath: this.LockCameraToPath,
            /// 三维坐标转屏幕坐标
            WorldToScreen: this.WorldToScreen,
            /// 屏幕坐标转三维坐标
            ScreenToWorld: this.ScreenToWorld
        };

        // SDK用户根据需要自定义实现以下响应函数
        this.Action = {
            // 主进度条更新
            pMajorProgress: function (bShow, nRate) { },
            // 副进度条更新
            pMinorProgress: function (bShow, nRate) { },
            // 帧更新函数
            pUpdate: function () { },
            // 帧POI绘制函数
            pDrawPOI: function (pCavans, pSite) { },
            // POI绘制函数，EAM项目定制
            pDrawPOIAtEAM: function (pCavans, pSite, bVisible) { },
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
            pOnClick: function (pPoint, nKey) { },
            // 隐藏拾取光标
            pHideCursor: null, // hideSetPoint
            // 获取基站列表
            pStationListFeedback: null, // getBleList
            // 获取导航动画类型
            pGetAnimateType: null, // getAnimateType
            // 搜索路径失败响应
            pPathNotFound: null, // notFoundRoute\
            // 当设置起点时
            pOnSetPos: function (pArea, pNaerLandmark, pWordPos, pScreenPos) { },
            // 当ProjectA相关结束时。
            pProjectAEnd: function () { },
            // 当模型相关结束时。
            pModelEnd: function () { },
        };


    }

    //#region 接口 
    /* -▼ */

    /// SDK启动函数
    Start() {
        Engine.g_pInstance.Start();
    }

    Test() {
        let mCoord = EAM.WorldToLonLat({
            x: 1,
            y: 0,
            z: 1
        });
        console.log("WorldToLonLat: ", mCoord.x.toFixed(6), mCoord.y.toFixed(6), mCoord.z.toFixed(6));

        window.addEventListener("keydown", function (e) {
            /// 设置摄像机视角
            if ("0" == e.key) {
                // EAM.SetCamera({ x: 20.0, y: 0.0, z: 0.0 }, 60.0, 30.0, 150.0);
                console.error("让我看看当前场景=>", MiaokitDC.DC.m_nCurWork);
            }
            /// 2D/3D视图模式之间切换
            if ("1" == e.key) {
                EAM.SwitchView(MiaokitDC.DC.viewMode === ViewMode.View2D ? 3 : 2);
            }
            /// 叠加楼层
            if ("2" == e.key) {
                EAM.StackUp(!ALinerDC.g_bStackUp);
            }
            /// 切换到楼宇
            if ("3" == e.key) {
                EAM.SwitchScene(EAM.aWorkList[0].building_name);
            }
            /// 切换到外景
            if ("4" == e.key) {
                EAM.SwitchScene(null);
            }
            /// 切换楼层
            if ("5" == e.key) {
                if (EAM.pCurWork) {
                    let aLayerList = EAM.pCurWork.layerList;
                    EAM.SwitchLayer(aLayerList[aLayerList.length - 1].floor_name);
                }
            }
            /// 切换摄像机锁定
            if ("6" == e.key) {
                EAM.LockCameraToPath(!NNavigation.g_bLockPath);
            }
            /// 暂停SDK运行
            if ("7" == e.key) {
                EAM.Stop();
            }
            /// 开始SDK运行
            if ("8" == e.key) {
                EAM.Start();
            }
            /// 以R-L110为测试起点，导航到当前设置的终点
            if ("9" == e.key) {
                EAM.Navigate("YQ162", "YQ442", 0);
            }
        });
    }

    /// SDK暂停函数
    Stop() {
        Engine.g_pInstance.Stop();
    }

    /// 重设画布大小
    Resize() {
        EAM.m_pEamCanvasHandle.RefreshCanvasSize();
    }

    /// 切换视图模式，2表示2D模式、3表示3D模式
    SwitchView(nMode) {
        if (2 === nMode) {
            MiaokitDC.DC.viewMode = ViewMode.View2D;
        } else {
            MiaokitDC.DC.viewMode = ViewMode.View3D;
        }
    }

    /// 设置摄像机视角。参数分布为观察目标坐标，仰角，偏航角，3D距离观察点距离/2D观察范围大小。某项参数赋值为undefined则维持其状态由鼠标控制
    SetCamera(mTarget, nPitch, nYaw, nDistance) {
        Engine.g_pInstance.m_pCameraCtrl.ResetCamera(mTarget, nPitch, nYaw, nDistance);
    }

    /// 切换室内外场景
    SwitchScene(pName) {

    }

    /// 切换楼层
    SwitchLayer(pName) {

    }

    /// 设置叠加楼层。
    StackUp(bActive) {
        Engine.g_pInstance.m_pProject.StackUp(bActive);
    }

    /// 切换室内外场景,根据场景编号。
    SwitchSceneByBuildId(pBuildId, bCoerce = false) {
        let pEamPOIBoard = EAM.m_pEamPOIBoard;
        let pEamRoomStatusMode = EAM.m_pEamRoomStatusMode;
        if (EAM.pCurWork && !bCoerce) {
            if (pBuildId) {
                if (EAM.pCurWork.building_id.trim() === pBuildId)
                    return;
            }
        }
        if (pBuildId === 0) {
            EAM.pCurWork = null;
            Engine.g_pInstance.m_pCameraCtrl.mode = 4;
            pEamRoomStatusMode.m_pRoomStatus = null;
            pEamPOIBoard.ClearBoardActive();
            OpenModelByWorkId();
            Engine.g_pInstance.m_pProject.SwitchWork(0);
        } else if (!pBuildId) {
            EAM.pCurWork = null;
            Engine.g_pInstance.m_pCameraCtrl.mode = 4;
            pEamRoomStatusMode.m_pRoomStatus = null;
            pEamPOIBoard.ClearBoardActive();
            OpenModelByWorkId();
            Engine.g_pInstance.m_pProject.SwitchWork(0);
        } else {
            for (let pWork of EAM.aWorkList) {
                if (pWork.building_id == pBuildId) {
                    EAM.pCurWork = pWork;
                    Engine.g_pInstance.m_nWorkType = EAM.pCurWork.type;
                    Engine.g_pInstance.m_pCameraCtrl.mode = 3;
                    pEamRoomStatusMode.m_pRoomStatus = null;
                    pEamPOIBoard.ClearBoardActive();
                    OpenModelByWorkId(pBuildId);
                    if (ALinerDC.g_bStackUp)
                        EAM.StackUp(false);
                    Engine.g_pInstance.m_pProject.SwitchWork(pBuildId);
                    return;
                }
            }
        }
    }

    /// 切换楼层,根据数据索引。
    SwitchLayerByFloorIndex(nFloorIndex) {
        let pEamPOIBoard = EAM.m_pEamPOIBoard;
        let pEamIdTrans = EAM.m_pEamIdTrans;
        if (EAM.pCurLayer) {
            if (EAM.pCurLayer.index === nFloorIndex)
                return;
        }
        if (EAM.pCurWork) {
            pEamPOIBoard.ClearBoardActive();
            OpenModelByWorkId();
            let nMiaoLayerIndex = pEamIdTrans.GetMiaoLayerIndexByFloorIndex(nFloorIndex);
            if (nMiaoLayerIndex == null)
                return;
            Engine.g_pInstance.m_pProject.ActiveFloor(nMiaoLayerIndex);
        }
    }

    /// 刷新当前显示空间。
    RefreshSpace() {
        if (!EAM.pCurWork)
            return;
        if (!EAM.pCurWork.building_id)
            return;
        let pWorkId = EAM.pCurWork.building_id;
        EAM.SwitchSceneByBuildId(pWorkId, true);
        if (EAM.pCurLayer) {
            let pLayerIndex = EAM.pCurLayer.index;
            EAM.SwitchLayerByFloorIndex(pLayerIndex);
        }
    }

    /// 基于距离和类型过滤POI列表
    FilterPOI(bEnable, mCenter, nRadius, aType) {
        Engine.g_pInstance.FilterPOI(bEnable, mCenter, nRadius, aType);
    }

    /// 单击2维度位置。
    ClickV2Pos(pPoint) {
        EAM.pV2Click = pPoint;
    }

    /// 搜索路径：参数分别为起点ID、终点ID、优先楼层通道类型（0：最近、1楼梯、2电梯、3扶梯）
    Navigate(pStartID, pEndID, nType = 0) {
        Engine.g_pInstance.m_pProject.Navigate(pStartID, pEndID, nType);
    }

    /// 是否将视角锁定在摄像机上，还是可以自由浏览地图
    LockCameraToPath(bLock) {
        NNavigation.LockCameraToPath(bLock);
    }

    /// 三维坐标转屏幕坐标
    WorldToScreen(mPos) {
        return Engine.g_pInstance.m_pCameraCtrl.WorldToScenePos(mPos);
    }

    /// 屏幕坐标转三维坐标
    ScreenToWorld(mPoint) {
        return Engine.g_pInstance.m_pCameraCtrl.TouchPoint({
            pageX: mPoint.x,
            pageY: mPoint.y
        });
    }

    /// 三维坐标转经纬度
    WorldToLonLat(mPos) {
        return new THREE.Vector3(mPos.x, 0, mPos.z).applyMatrix4(EAM.pCartesianToGis);
    }

    /// 经纬度转三维坐标
    LonLatToWorld(mPoint) {
        return new THREE.Vector3(mPoint.x, 0, mPoint.z).applyMatrix4(EAM.pGisToCartesian);
    }

    /// 获取节点三维坐标。
    GetPOIPos(pSite) {



    }

    /* -▲ */
    //#endregion -接口 end

    //#region 成员函数
    /* -▼ */

    //#region 业务流程
    /* --▼ */

    /// SDK初始化方法
    Init(pConfig, pCallback) {
        let pThis = this;
        pThis.RegisterEventAll(); // 注册所有事件。
        pThis.pConfig = pConfig;
        pConfig.pCallback = pCallback;
        //pConfig.pZipLoader = pThis.LoadZip;
        pConfig.pZipLoader = g_pProjectLoad.LoadZip;
        pConfig.pUpdate1 = pThis.Action.pMajorProgress;
        pConfig.pUpdate2 = pThis.Action.pMinorProgress;
        pConfig.pUpdate = function () {
            pThis.pV2Click = null;
            pThis.Action.pUpdate();
        };
        //pConfig.pDrawPOI = pThis.Action.pDrawPOI;
        pConfig.pDrawPOIAtEAM = pThis.Action.pDrawPOIAtEAM;
        pConfig.pLayerUpdate = pThis.Action.pLayerListFlush;
        pConfig.pOutWorkBack = pThis.Action.pOutsideSwich;
        pConfig.pSwichViweModelBack = pThis.Action.pViewSwich;
        pConfig.pCompass = pThis.Action.pCompassUpdate;
        pConfig.pChooseLayer = pThis.Action.pLayerActive;
        pConfig.pShowActiveLayer = pThis.Action.pLayerShow;
        pConfig.pSetNavPoint = pThis.Action.pCursorInfo;
        pConfig.pNavBack = pThis.Action.pPathDataFeedback;
        pConfig.pVoicePost = pThis.Action.pHintFeedback;
        pConfig.pOnClick = pThis.Action.pOnClick;
        pConfig.pChickTouchMove = pThis.Action.pHideCursor;
        pConfig.pPostBlueToothList = pThis.Action.pStationListFeedback;
        pConfig.pMovie = pThis.Action.pGetAnimateType;
        pConfig.pNoFindPath = pThis.Action.pPathNotFound;
        pConfig.pOnSetPos = pThis.Action.pOnSetPos;
        pConfig.pProjectAEnd = EAM.Action.pProjectAEnd;
        pConfig.pModelEnd = EAM.Action.pModelEnd;
        pConfig.aFirstProjectBaoNameList = g_pConfig3d.m_pProjectBaoInfo.firstBaoNameAndExtList;
        pConfig.pProjectBaoName = g_pConfig3d.m_pProjectBaoInfo.projectBaoNameAndExt;
        {
            // 经线上，100米间隔0.0009度
            // 纬线上，100米间隔0.1 / (111 * cosα)度
            // 确定三维场景中心点经纬度，在根据偏移距离指定位置经纬度

            let mScale = new THREE.Matrix4();
            mScale.makeScale(0.000009, 1.0, 0.001 / (111 * Math.cos(pThis.pConfig.mCoord.lat)));

            let mRotation = new THREE.Matrix4();
            mRotation.makeRotationY(-pThis.pConfig.nCompassBias / 180 * 3.141592654);

            let mTransform = new THREE.Matrix4();
            mTransform.multiplyMatrices(mScale, mRotation);

            let mTransformInv = new THREE.Matrix4();
            mTransformInv.getInverse(mTransformInv, true);

            pThis.pCartesianToGis = mTransform;
            pThis.pGisToCartesian = mTransformInv;
        }

        {
            pThis.m_pEamInfrasView = new EamInfrasView();
            pThis.m_pEamInteriorView = new EamInteriorView();
            pThis.m_pEamRoomStatusView = new EamRoomStatusView();
            pThis.m_pEamLayerListView = new EamLayerListView();
            pThis.m_pEamProcessView = new EamProcessView();
            pThis.m_pEamBuildBoard = new EamBuildBoard();
            pThis.m_pEamRoomBoard = new EamRoomBoard();
            pThis.m_pEamPanoramaBoard = new EamPanoramaBoard();
            pThis.m_pEamRoomStatusMode = new EamRoomStatusMode();
            pThis.m_pEamIdTrans = new EamIdTrans();
            pThis.m_pEamPOIBoard = new EamPOIBoard();
            pThis.m_pEamCanvasHandle = new EamCanvasHandle();
            //
            EAM.OverwriteMethod();
        }

        pThis.LoadData(function () {
            pConfig.pSiteData = pThis.aInfrasList.concat(EAM.aRoomList);
            pConfig.pFloorData = pThis.aLayerList;

            pThis.pEngine = new Engine();
            pThis.pEngine.Init(pConfig);
        });
    }

    /// 加载网络数据
    LoadData(pCallback) {
        // 注册。
        m_pAPIQueue.Add(EAM.LoadSiteList);
        m_pAPIQueue.Add(EAM.LoadRoadList);
        m_pAPIQueue.Add(EAM.m_pEamPOIBoard.LoadTypeIcon);
        m_pAPIQueue.Add(EAM.LoadWorkList);

        // 开始。
        m_pAPIQueue.Start(m_pAPIBack, function () {
            pCallback();
        });
    }

    /// 当projectA包加载完成时。
    ProjectAEnd() {
        //
        EAM.Resize();
        // 进入第一个校区。
        {
            let pAreaId = "";
            for (let pItemName in g_pConfig3d.m_pCustomModelInfo.customModelList) {
                pAreaId = pItemName;
                break;
            }
            let pFistAreaId = null;
            for (let pWork of EAM.aWorkList) {
                if (!pFistAreaId)
                    pFistAreaId = pWork.building_id;
                if (pWork.type == 1 && pWork.building_id == pAreaId) {
                    pAreaId = pWork.building_id;
                    break;
                }
            }
            if (!pAreaId)
                pAreaId = pFistAreaId;
            EAM.SwitchSceneByBuildId(pAreaId);
        }
        //
        EAM.m_nShowLv = 1;
        //
        EAM.StartWork();
    }

    /// 重写Miaokit的方法。
    OverwriteMethod() {
        return;
        let NewStackUp = function () {

            console.error("叠加");


        }

        Object.defineProperty(ALinerMgr, "StackUp", NewStackUp)

        console.error("叠加 开啊啊=>", ALinerMgr);

        //  Engine.g_pInstance.m_pDrawPOIAtEAM = pData.pDrawPOIAtEAM;
        //   Engine.g_pInstance.m_bTestPOIMode = EAM.pConfig.bTestPOIMode;
        // setInterval(function () {
        //     Engine.g_pInstance.m_bNeedCollideCheckStateMark = true;
        // }, 1000);
    }

    /// 开始业务加载。
    StartWork() {
        // 队列加载
        let pLQ = CreateAPILoadQueue();
        // 加载第一批定制模型。
        pLQ.pAPIQueue.Add(EAM.LoadFirstCustomModel);
        pLQ.pAPIQueue.AddFunc(function () {
            EAM.m_nShowLv = 2;
            //
            EAM.RefreshSpace();
            // 关闭进度条。
            EAM.Open3DMode();
        });
        // 加载UI相关。
        pLQ.pAPIQueue.Add(EAM.LoadMain);
        pLQ.pAPIQueue.AddFunc(function () {
            // 开启web相关加载。
            EAM.OpenWebLoad();
            // 加载miaokit模型。
            MiaokitDC.DC.m_pAssetsLoader.LoadMinor();
        });
        // 加载所有定制模型。
        pLQ.pAPIQueue.Add(EAM.LoadCustomModel);
        pLQ.pAPIQueue.AddFunc(function () {

        });
        //
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            console.error("3d部分所有东西加载完成。");
        });
    }

    /// 加载第一批定制模型。
    LoadFirstCustomModel(pBack) {
        let pFirsCustomModelInfo = {
            customBaoLocalPath: g_pConfig3d.m_pCustomModelInfo.customBaoLocalPath,
            customModelList: new Array(),
        };
        for (let pItemName in g_pConfig3d.m_pCustomModelInfo.customModelList) {
            let pItem = g_pConfig3d.m_pCustomModelInfo.customModelList[pItemName];
            pFirsCustomModelInfo.customModelList[pItemName] = pItem;
            break;
        }

        let pLQ = CreateAPILoadQueue();
        pLQ.pAPIQueue.Add(InitCustomModel, pFirsCustomModelInfo);
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            pBack();
        });
    }

    /// 加载页面UI相关。
    LoadMain(pBack) {
        let pLQ = CreateAPILoadQueue();
        // 注册。
        for (let pWork of EAM.aWorkList) {
            pLQ.pAPIQueue.Add(EAM.LoadLayerList, pWork);
        }
        EAM.m_pEamInfrasView.Init();
        EAM.m_pEamRoomStatusView.Init(pLQ.pAPIQueue);
        EAM.m_pEamInteriorView.Init();
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            pBack();
        });
    }

    /// 加载所有定制模型。
    LoadCustomModel(pBack) {
        InitCustomModel(g_pConfig3d.m_pCustomModelInfo, function () {
            pBack();
        });
    }

    /// 加载页面菜单相关。
    LoadMain(pBack) {
        let pLQ = CreateAPILoadQueue();
        // 注册。
        for (let pWork of EAM.aWorkList) {
            pLQ.pAPIQueue.Add(EAM.LoadLayerList, pWork);
        }
        EAM.m_pEamInfrasView.Init();
        EAM.m_pEamRoomStatusView.Init(pLQ.pAPIQueue);
        EAM.m_pEamInteriorView.Init();
        pLQ.pAPIQueue.Start(pLQ.pAPIBack, function () {
            pBack();
        });
    }

    /// 开启3D模块使用。
    Open3DMode() {
        EAM.m_pEamCanvasHandle.RefreshCanvasSize();
        EAM.m_pEamProcessView.SetProcessInfo(true, 100);
        setTimeout(function () {
            EAM.m_pEamProcessView.SetProcessInfo(false, 100);
        }, 5000);
    }

    /// miaokit模型加载结束。
    ModelEnd() {
        EAM.m_nShowLv = 3;
        EAM.RefreshSpace();
    }

    /// 开始Web部分加载。
    OpenWebLoad() {
        EAM.m_bLoadEndWork3d = true;
        COMMUBrowserIns.m_pLoadAll3DEnd();
    }

    /// 判断用户是否登陆。
    HasLanded() {
        sessionStorage.getItem("accessToken");
        if (!sessionStorage.accessToken || sessionStorage.accessToken == 'undefined' || sessionStorage.accessToken == null) {
            return false;
        } else {
            return true;
        }
    }

    /// 获取登录用户id。
    GetUserId() {
        let pUserId = "";
        sessionStorage.getItem("userid");
        pUserId = sessionStorage.userid;
        return pUserId;
    }

    /// 时间戳转日期。
    GetSecondTransData(nSecond) {
        let timestamp3 = nSecond;
        let newDate = new Date();
        newDate.setTime(timestamp3 * 1000);
        Date.prototype.format = function (format) {
            let date = {
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S+": this.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (let k in date) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                        date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                }
            }
            return format;
        }
        return (newDate.format('yyyy-MM-dd h:m'));

    }

    /// 获取API。
    GetAPI(nIndex, bLocalAPI = false) {
        let pFullUrl = "";
        let pUrl = "";
        let nType = 0;
        if (!EAM.bNetWorkAPI || bLocalAPI)
            nType = 1;

        pUrl = EAM.aAPI[nIndex][nType];
        if (!pUrl)
            nType = 1;

        pUrl = EAM.aAPI[nIndex][nType];
        if (nType == 0) {
            pFullUrl = EAM.pConfig.pHost + pUrl;
        } else {
            pFullUrl = pUrl;
        }
        return pFullUrl;
    }

    GetFormat(args) {
        var result = "";
        if (arguments.length > 0) {
            for (var i = 0; i < arguments.length; i++) {
                if (i == 0) {
                    result = arguments[i];
                    continue;
                }
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                    let nIndex = (i - 1);
                    var reg = new RegExp("({)" + nIndex + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
        return result;
    }

    /* --▲ */
    //#endregion --函数 end

    //#region 事件
    /* --▼ */

    /// 事件注册。
    RegisterEventAll() {
        EAM.Action.pOutsideSwich = EAM.OnOutsideSwich;
        EAM.Action.pMajorProgress = EAM.OnMajorProgress;
        EAM.Action.pLayerListFlush = EAM.OnLayerListFlush;
        EAM.Action.pLayerShow = EAM.OnLayerShow;
        EAM.Action.pOnClick = EAM.OnClick;
        EAM.Action.pOnSetPos = EAM.OnSetPos;
        EAM.Action.pUpdate = EAM.OnUpdate;
        EAM.Action.pDrawPOIAtEAM = EAM.OnDrawPOIAtEAM;
        EAM.Action.pDrawPOI = EAM.OnDrawPOI;
        EAM.Action.pProjectAEnd = EAM.OnProjectAEnd;
        EAM.Action.pModelEnd = EAM.OnModelEnd;
    }

    ///当内外景切换。
    OnOutsideSwich(bOut) {
        if (EAM.pCurWork != null) {
            switch (EAM.pCurWork.type) {
                case 1:
                    EAM.OnTurnSpace(1);
                    break;
                case 2:
                    EAM.OnTurnSpace(2);
                    break;
            }
        } else {
            EAM.OnTurnSpace(-1);
        }
    }

    /// 当进度条有变化。
    OnMajorProgress(bShow, nRate) {
        if (bShow)
            EAM.m_pEamProcessView.SetProcessInfo(bShow, nRate * 100);
    }

    /// 当楼层列表刷新。
    OnLayerListFlush(nLayerCount, nWorkIndex) {
        if (nWorkIndex != 0 && nLayerCount != null)
            EAM.m_pEamLayerListView.UpdataLayerListView();
    }

    /// 当楼层显示。
    OnLayerShow(pNavBackData) {
        let nMiaoLayerIndex = pNavBackData.LayerId;// 苗哥这个有问题的，字段叫id但是传过来的是索引.
        let pFloorId = EAM.m_pEamIdTrans.GetFloorIdByMiaoLayerIndex(nMiaoLayerIndex);
        if (pFloorId == null)
            return;
        EAM.m_pEamLayerListView.SetLayerShowByFloorId(pFloorId);
    }

    /// 当单击画布。
    OnClick(pPoint, nKey) {
        if (nKey == 0)
            EAM.m_pEamPOIBoard.OnClickV2Pos(pPoint);
    }

    /// 当点击地板。
    OnSetPos(pArea, pNaerLandmark, pWordPos, pScreenPos) {
        let pCheckSite = EAM.m_pEamPOIBoard.m_pCheckSite;
        if (pNaerLandmark == null)
            return;
        let bNeedShow = false;
        if (pCheckSite != null) {
            if (pCheckSite.Id != pNaerLandmark.m_pSerial)
                bNeedShow = true;
        } else {
            bNeedShow = true;
        }
        if (bNeedShow) {
            EAM.m_pEamRoomBoard.m_bShowActive = false;
            EAM.m_pEamBuildBoard.m_bShowActive = false;
            EAM.m_pEamPanoramaBoard.m_bShowActive = false;
            EAM.m_pEamPOIBoard.m_pCheckSite = {
                Id: pNaerLandmark.m_pSerial,
                Name: pNaerLandmark.m_pName,
                Position: pNaerLandmark.m_mPoint.Object.m_mPosition,
                Image: null,
                Type: 0,
                V3Pos: pNaerLandmark.m_mPoint.Object.m_mPosition
            };
        }
    }

    /// 当帧更新。
    OnUpdate() {
        EAM.m_pEamBuildBoard.Update();
        EAM.m_pEamRoomBoard.Update();
        EAM.m_pEamPanoramaBoard.Update();
        UpdateCustomModel();
    }

    /// 绘制POI
    OnDrawPOIAtEAM(pCavans, pSite, bVisible) {
        EAM.m_pEamPOIBoard.DrawPOIAtEAM(pCavans, pSite, bVisible);
    }

    /// 绘制POI
    OnDrawPOI(pCavans, pSite) {

    }

    //==非miaokit

    /// 当画布大小改变时。
    OnTransCanvasSize() {
        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        let nType = pEamCanvasHandle.m_nCanvasSizeType;
        pEamCanvasHandle.RefreshMenuShowActive();
        switch (nType) {
            case 0:
                break;
            case 1:
                EAM.m_pEamPOIBoard.m_pCheckSite = null;
                EAM.m_pEamRoomBoard.m_bShowActive = false;
                EAM.m_pEamBuildBoard.m_bShowActive = false;
                EAM.m_pEamPanoramaBoard.m_bShowActive = false;
                break;
            case 2:
                break;
        }
    }

    /// 当切换空间时。
    OnTurnSpace(nType) {
        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        let pEamRoomStatusMode = EAM.m_pEamRoomStatusMode;
        let pEamIdTrans = EAM.m_pEamIdTrans;
        let nWorkDataId = -1;
        EAM.m_nWorkType = nType;
        switch (nType) {
            // 地球
            case -1:
                COMMUBrowserIns.m_pOpenWork(0, 0);
                pEamCanvasHandle.SwitchMenuShowActive(-1);
                break;
            // 校区
            case 1:
                nWorkDataId = pEamIdTrans.GetWorkDataIdByAreaId(EAM.pCurWork.building_id);
                COMMUBrowserIns.m_pOpenWork(1, nWorkDataId);
                pEamCanvasHandle.SwitchMenuShowActive(1);
                break;
            // 楼宇
            case 2:
                nWorkDataId = pEamIdTrans.GetWorkDataIdByBuildId(EAM.pCurWork.building_id);
                COMMUBrowserIns.m_pOpenWork(2, nWorkDataId);
                pEamCanvasHandle.SwitchMenuShowActive(2);
                pEamRoomStatusMode.UpdataInfo();
                break;
            // 楼层
            case 3:
                pEamRoomStatusMode.TransLayerPanelColor();
                break;
        }
    }

    /// 当然关闭720窗口。
    OnClosePanorama() {
        let pEamPanoramaBoard = EAM.m_pEamPanoramaBoard;
        pEamPanoramaBoard.OnClosePanorama();
    }

    /// 当projectA包相关结束时。
    OnProjectAEnd() {
        EAM.ProjectAEnd();
    }

    /// 当模型相关结束时。
    OnModelEnd() {
        EAM.ModelEnd();
    }

    /* --▲ */
    //#endregion --事件 end

    /* -▲ */
    //#endregion -成员函数 end

    //#region 数据加载
    /* -▼ */

    /// 接口请求函数。
    AJAX(pUrl, pType = "get", pCallback) {
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

    /// 接口加载。(字段拼接)
    AJAXPuzzle(pUrl, pType = "get", pAddObj, pCallback) {
        let pMsg = {
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
        };

        let pBigMsg = Object.assign(pMsg, pAddObj);

        $.ajax(pBigMsg);
    }

    /// 加载资源包。
    LoadZip(pCallback) {
        fetch("Model/" + 'project.zip').then(function (response) {
            if (response.status === 200 || response.status === 0) {
                return Promise.resolve(response.blob());
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        }).then(JSZip.loadAsync).then(function (zip) {
            pCallback(zip);
        });
    }

    /// 加载所有房间数据。
    LoadSiteList(pCallback) {
        let pFullUrl = EAM.GetAPI(1);
        EAM.AJAX(pFullUrl, 'get', function (roomList) {
            let aRoomList = EAM.aRoomList;
            for (let item of roomList.data) {
                let pRoom = {
                    id: item.id,
                    HyID: parseInt(item.HyID),
                    roomID: item.roomID,
                    floorID: item.floorID,
                    buildingID: "默认值",
                    companyName: item.companyName,
                    iconUrl: "",
                    imgUrl: "",
                    panoramaUrl: item.panoramaUrl
                };
                aRoomList.push(pRoom);
            }

            pCallback();
        });
    }

    /// 加载本地所有道路信息。
    LoadRoadList(pCallback) {
        let pFullUrl = EAM.GetAPI(6);
        EAM.AJAXText(pFullUrl, 'get', function (RoadData) {
            if (!RoadData) {
                pCallback();
                return;
            }
            let aRoomList = EAM.aRoomList;
            let lRowList = RoadData.split('\n');
            for (let pRow of lRowList) {
                if (!pRow)
                    continue;
                if (pRow.indexOf("=") == -1)
                    continue;
                let aRowItems = pRow.split('=');
                if (aRowItems.length != 2)
                    continue;
                let pItem = {
                    HyID: 4,
                    roomID: aRowItems[0],
                    floorID: "1",
                    buildingID: "默认值",
                    companyName: aRowItems[1],
                    iconUrl: "",
                    imgUrl: "",
                    panoramaUrl: ""
                };
                aRoomList.push(pItem);
            }
            pCallback();
        });
    }

    /// 加载楼层列表数据。
    LoadLayerList(pWork, pCallback) {
        if (pWork.type == 1) {
            pCallback();
            return;
        }

        let nDataId = pWork.id;
        let pFullUrl = EAM.GetFormat(EAM.GetAPI(3), nDataId);
        EAM.AJAX(pFullUrl, 'get', function (layerList) {
            let aLayerList = EAM.aLayerList;
            let aResponse = layerList.data ? layerList.data : [];
            for (let i = 0; i < aResponse.length; i++) {
                let pData = aResponse[i];
                let pLayer = {
                    id: pData.id,
                    index: i,
                    b_id: pData.FloorID,
                    floor_id: pData.FloorID,
                    icon: "",
                    floor_name: pData.name,
                    is_default: "0",
                    detail: pData.name,
                    build_num: pWork.building_id,
                    build_name: ""
                };

                aLayerList.push(pLayer);
                pWork.aLayerList.push(pLayer);
            }

            pCallback();
        });
    }

    /// 加载所有场景列表数据。
    LoadWorkList(pCallback) {
        let pFullUrl = EAM.GetAPI(0);
        EAM.AJAX(pFullUrl, 'get', function (workList) {
            let aWorkList = EAM.aWorkList;
            for (let item of workList.data) {
                let pWork = {
                    id: item.ID,
                    icon_url: "",
                    building_id: item.BuildingNum,
                    building_name: item.Name,
                    type: item.Type,
                    aLayerList: []
                };
                aWorkList.push(pWork);
            }
            pCallback();
        });
    }

    /* -▲ */
    //#endregion -数据加载 end
}

/// 模板。
class EamTemplate {
    constructor() {
        this.bModeSwitch = true;// 模块总闸。
    }

    //#region -成员函数
    /* -▼ */

    /// xxx。
    xxx() {
    }


    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end

    //#region -成员变量
    /* -▼ */


    /* -▲ */
    //#endregion -成员变量 end
}

/// 设施图层视图。
class EamInfrasView {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;

        /// 图层状态。
        this.m_aInfrasActiveList = [
            {
                Name: "楼宇标签",
                TypeId: -1,
                ShowActive: true
            }, {
                Name: "校园道路",
                TypeId: 4,
                ShowActive: true
            },
            {
                Name: "校园实景",
                TypeId: 3,
                ShowActive: true
            }
        ];

    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamInfrasView;

        return !pThis.bModeSwitch;
    }

    Init() {
        let pThis = EAM.m_pEamInfrasView;

        if (pThis.IfModeClose()) {
            return;
        }

        pThis.InitInfrasActiveInfo();
    }

    /// 初始化基础设施图层信息。
    InitInfrasActiveInfo() {
        let pThis = EAM.m_pEamInfrasView;

        if (pThis.IfModeClose()) {
            return;
        }

        let aInfrasActiveList = EAM.m_pEamInfrasView.m_aInfrasActiveList;
        let pRoot = $("#choice-box");
        let pList = pRoot.find(".a-choice");
        let pObject = $(pList.first());
        let nCurItemCount = pRoot.children().first().children().length;
        let nTargetCount = aInfrasActiveList.length;
        if (nCurItemCount > nTargetCount) // 实体大于目标。
        {
            for (let i = 0; i < nCurItemCount; i++) {
                if (i >= nTargetCount) // 隐藏大于目标的元素。
                {
                    let pItem = pList[i];
                    pItem = $(pItem);
                    pItem.css('display', 'none');
                } else {
                    let pItem = pList[i];
                    pItem = $(pItem);
                    let pName = aInfrasActiveList[i].Name;
                    let pContent = pItem.find("span").first();
                    pContent.html(pName);
                    pItem.css('display', 'block');
                }
            }
        } else // 目标大于实体。
        {
            for (let i = 0; i < nTargetCount; i++) {
                if (i < nCurItemCount) {
                    let pItem = pList[i];
                    pItem = $(pItem);
                    let pName = aInfrasActiveList[i].Name;
                    let pContent = pItem.find("span").first();
                    pContent.html(pName);
                    pItem.css('display', 'block');
                } else {
                    let pItem = pObject.clone(true);
                    pItem = $(pItem);
                    pRoot.children().append(pItem);
                    let pName = aInfrasActiveList[i].Name;
                    let pContent = pItem.find("span").first();
                    pContent.html(pName);
                    pItem.css('display', 'block');
                }
            }
        }

        // 单击事件绑定。
        pList = pRoot.find(".a-choice");
        for (let i = 0; i < pList.length; i++) {
            var pItem = $(pList[i]);
            var pContent = pItem.find("span").first();
            let pClickName = pContent.html()
            pItem.click(function () {
                for (let pActiveItem of aInfrasActiveList) {
                    if (pActiveItem.Name == pClickName) {
                        pActiveItem.ShowActive = !pActiveItem.ShowActive;
                    }
                }
            });
        }
    }

    /// 判断是否匹配图层分类。
    IfMatchType(nTypeId) {
        let pThis = EAM.m_pEamInfrasView;

        if (pThis.IfModeClose()) {
            return true;
        }

        let aInfrasActiveList = EAM.m_pEamInfrasView.m_aInfrasActiveList;
        for (let pItem of aInfrasActiveList) {
            if (nTypeId == 5 && pItem.TypeId == 4) {
                return pItem.ShowActive;
            }
            if (nTypeId == pItem.TypeId)
                return pItem.ShowActive;
        }
        return true;
    }

    /// 切换显示状态。
    SwitchShowActive() {
        let pThis = EAM.m_pEamInfrasView;

        if (pThis.IfModeClose()) {
            return;
        }

        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        let bSuccess = false;
        let nActive = 1;
        let lTypeList = [0, 1]; //(0正常，1全屏，2小窗口)
        let pObject = $(".infrastructureBox");

        for (let nItem of lTypeList) {
            if (pEamCanvasHandle.m_nCanvasSizeType == nItem && pEamCanvasHandle.m_nMenuActive == nActive) {
                bSuccess = true;
                break;
            }
        }

        if (pObject.length > 0) {
            $.each(pObject, function (i, item) {
                if (bSuccess) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        }
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end
}

/// 内景菜单视图。
class EamInteriorView {
    constructor() {
        this.bModeSwitch = true;// 模块总闸。
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamInteriorView;

        return !pThis.bModeSwitch;
    }

    Init() {
        // 房间使用状态按钮绑定点击事件。
        $(".roomStateTitle").first().click(function () {
            COMMUBrowserIns.m_pClickRoomUseStateBtn();
        });

    }

    /// 切换显示状态。
    SwitchShowActive() {
        let pThis = EAM.m_pEamInteriorView;

        if (pThis.IfModeClose()) {
            return;
        }
        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        let bSuccess = false;
        let nActive = 2;
        let lTypeList = [0, 1]; //(0正常，1全屏，2小窗口)
        let pObject = $(".roomStateBox");

        for (let nItem of lTypeList) {
            if (pEamCanvasHandle.m_nCanvasSizeType == nItem && pEamCanvasHandle.m_nMenuActive == nActive) {
                bSuccess = true;
                break;
            }
        }

        if (pObject.length > 0) {
            $.each(pObject, function (i, item) {
                if (bSuccess) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        }

    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end
}

/// 房间状态分类视图。
class EamRoomStatusView {
    constructor() {
        this.bModeSwitch = true;// 模块总闸。
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamRoomStatusView;

        return !pThis.bModeSwitch;
    }

    Init(pAPIQueue) {
        let pThis = EAM.m_pEamRoomStatusView;
        if (pThis.IfModeClose()) {
            return;
        }

        pThis.InitRoomStatusPanel(pAPIQueue);
    }

    /// 初始化房间状态视图面板。
    InitRoomStatusPanel(pAPIQueue) {
        let pThis = EAM.m_pEamRoomStatusView;

        if (pThis.IfModeClose()) {
            return;
        }

        let pParent = $(".stateColorlist").first().children().first();
        let pPrefab = $(pParent.children().get(0));

        pAPIQueue.Add(pThis.LoadRoomStatusList);
        pAPIQueue.AddFunc(function (lRoomStatusList) {
            for (let pRoomStatus of lRoomStatusList) {
                let pObject = $(pPrefab.clone(true));
                let pSpan1 = $(pObject.children().get(0));
                let pSpan2 = $(pObject.children().get(1));
                pSpan1.css('background', pRoomStatus.Color);
                pSpan2.html(pRoomStatus.Name);
                pParent.append(pObject)
            }
            pPrefab.css('display', 'none');
        });

    }

    /// 切换显示状态。
    SwitchShowActive() {
        let pThis = EAM.m_pEamRoomStatusView;

        let bMode = true;
        if (pThis.IfModeClose()) {
            bMode = false;
        }

        let pObject = $(".roomStateBox");
        if (pObject.length > 0) {
            let pColorbject = $(pObject).find(".stateColorlist").first();
            if (pColorbject.length > 0) {
                $.each(pColorbject, function (i, item) {
                    if (bMode) {
                        item.style.display = "block";
                    } else {
                        item.style.display = "none";
                    }
                });
            }
        }
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 加载所有房间状态列表。
    LoadRoomStatusList(pCallback) {
        let pFullUrl = EAM.GetAPI(4);
        EAM.AJAX(pFullUrl, 'get', function (pData) {
            let pRoomStatusList = [];
            for (let item of pData.data) {
                let pRoomStatus = {
                    Id: item.roomStateId,
                    Name: item.roomStateName,
                    Color: item.roomStateColor,
                };
                pRoomStatusList.push(pRoomStatus);
            }
            pCallback(pRoomStatusList);
        });

    }

    /* -▲ */
    //#endregion -数据加载 end
}

/// 楼层列表视图。
class EamLayerListView {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamLayerListView;

        return !pThis.bModeSwitch;
    }

    /// 更新楼层列表。
    UpdataLayerListView() {
        let pThis = EAM.m_pEamLayerListView;

        if (pThis.IfModeClose()) {
            return;
        }

        if (EAM.pCurWork == null)
            return;
        let pFirstFloorId = null;
        let aLayerList = EAM.pCurWork.aLayerList;
        let pParent = $("#scroll_bar");
        let nTargetLayerCount = (aLayerList == null) ? 0 : aLayerList.length; //目标楼层数为后台数据楼层数
        let nObjCount = pParent.children().length;
        for (let i = 0; i < nTargetLayerCount; i++) {
            let pItem = aLayerList[i];
            let nFloorIndex = pItem.index;
            if (!pFirstFloorId)
                pFirstFloorId = pItem.floor_id;
            let pEntny = null;
            let pFloorIdEntny = null;
            if (i >= nObjCount) {
                pEntny = $("<li class=" + '"' + "floorListSel" + '"' + "style=" + '"' + "display:block;" + '"' + ">bF</li>");
                pFloorIdEntny = $("<div class=" + '"' + "floorId" + '"' + ">" + -1 + "</div>");
                pEntny.append(pFloorIdEntny);
                pParent.append(pEntny);
                pFloorIdEntny.css('display', 'none');
            }

            pEntny = $(pParent.children().get(i));
            pFloorIdEntny = pEntny.find(".floorId").first();

            pEntny.off('click');
            pEntny.click(function () {
                EAM.SwitchLayerByFloorIndex(nFloorIndex);
            });
            pEntny.html(pItem.floor_name);
            pEntny.css('display', 'block');

            pFloorIdEntny.html(pItem.floor_id + "");
            pEntny.append(pFloorIdEntny);
        }

        // 这里销毁大于实体的使用。
        if (nTargetLayerCount)
            for (let i = nTargetLayerCount; i < nObjCount; i++) {
                let pEntny = $(pParent.children().get(i));
                pEntny.css('display', 'none');
            }

        pThis.SetLayerShowByFloorId(pFirstFloorId);
    }

    /// 设置楼层显示。
    SetLayerShowByFloorId(pFloorId) {
        let pThis = EAM.m_pEamLayerListView;

        if (pThis.IfModeClose()) {
            return;
        }

        let pParent = $("#scroll_bar");
        for (let i = 0; i < pParent.children().length; i++) {
            let pEntny = $(pParent.children().get(i));
            let pGetFloorId = pEntny.find(".floorId").first().html();
            if (pFloorId == pGetFloorId) {
                if (pEntny.is(".floorListSel")) {
                    pEntny.removeClass("floorListSel")
                    pEntny.addClass("floorListSeled");
                }
            } else {
                if (pEntny.is(".floorListSeled")) {
                    pEntny.removeClass("floorListSeled")
                    pEntny.addClass("floorListSel");
                }
            }
        }

        if (EAM.pCurLayer) {
            if (EAM.pCurLayer.floor_id === pFloorId)
                return;
        }

        if (EAM.pCurWork != null) {
            let aLayerList = EAM.pCurWork.aLayerList;
            for (let i = 0; i < aLayerList.length; i++) {
                if (aLayerList[i].floor_id === pFloorId) {
                    EAM.pCurLayer = aLayerList[i];
                    break;
                }
            }
            switch (EAM.pCurWork.type) {
                // 校区
                case 1:
                    break;
                // 大楼。
                case 2:
                    EAM.OnTurnSpace(3);
                    break;
            }
        }
    }

    /// 切换显示状态。
    SwitchShowActive() {
        let pThis = EAM.m_pEamLayerListView;

        let bMode = true;
        if (pThis.IfModeClose()) {
            bMode = false;
        }

        let pObject = $(".roomStateBox");
        if (pObject.length > 0) {
            let pColorbject = $(pObject).find(".floorListBox").first();
            if (pColorbject.length > 0) {
                $.each(pColorbject, function (i, item) {
                    if (bMode) {
                        item.style.display = "block";
                    } else {
                        item.style.display = "none";
                    }
                });
            }
        }

    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end

}

/// 进度条视图。
class EamProcessView {
    constructor() {

        this.bModeSwitch = true;// 模块总闸。

        // 进度条根实体。
        this.m_pRootEntry = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamProcessView;

        return !pThis.bModeSwitch;
    }

    /// 拿进度条。
    GetProcessEntry() {
        let pThis = EAM.m_pEamProcessView;

        if (pThis.IfModeClose()) {
            return;
        }

        if (pThis.m_pRootEntry == null) {
            let pObject = $(".processcontainer").first();
            pThis.m_pRootEntry = pObject;
        }
        return pThis.m_pRootEntry;
    }

    /// 设置进度条显示信息。
    SetProcessInfo(bShow, nWidth) {
        let pThis = EAM.m_pEamProcessView;

        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetProcessEntry();
        if (bShow) {
            pItem = pItem.find("#processbar");
            let pWidth = nWidth + "%";
            pItem.css("width", pWidth);
        }
        let pShow = (bShow == true) ? "block" : "none";
        pItem.css("display", pShow);

        if (bShow == false) {
            $('.loadBox').addClass('hide');
        }
    }


    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end

}

/// 节点浮标。
class EamPOIBoard {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;
        /// 当前选中的浮标。
        this.m_pCheckSite = null;
        // 楼宇小图标。
        this.m_pBuildingImg = null;
        // 全景小图标。
        this.m_pPanoramaImg = null;
        // 背景框左中右。
        this.m_aBgList = [];
        // 三角形底部。
        this.m_pTriangleImg = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamPOIBoard;

        return !pThis.bModeSwitch;
    }

    // 点击。
    OnClickV2Pos(pPoint) {
        let pThis = EAM.m_pEamPOIBoard;
        if (pThis.IfModeClose()) {
            return;
        }
        EAM.pV2Click = pPoint;
    }

    /// 绘制POI
    DrawPOIAtEAM(pCavans, pSite, bVisible) {
        let pThis = EAM.m_pEamPOIBoard;
        if (pThis.IfModeClose()) {
            return;
        }
        if (EAM.m_nShowLv <= 0)
            return;
        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        let pEamInfrasView = EAM.m_pEamInfrasView;
        let bCanClick = false;
        if (bVisible) {
            // 显示类型。
            switch (pSite.Type) {
                // 大楼或校区。
                case -1:
                    if (!pEamInfrasView.IfMatchType(pSite.Type))
                        return;
                    let pCheckWork = null;
                    let bWorkType = 0; // 0无绑定 1校区 2大楼
                    for (let pWork of EAM.aWorkList) {
                        if (pWork.building_id == pSite.Id) {
                            bWorkType = pWork.type;
                            pCheckWork = pWork;
                            break;
                        }
                    }
                    switch (bWorkType) {
                        // 无绑定。
                        case 0:
                            // 屏蔽校区没有数据的楼宇。
                            if (!EAM.pConfig.bTestPOIMode)
                                return;
                            pThis.DrawPOI(5, pCavans, pSite, pCheckWork);
                            break;
                        // 校区
                        case 1:

                            break;
                        // 大楼。
                        case 2:
                            pThis.DrawPOI(2, pCavans, pSite, pCheckWork);
                            bCanClick = true;
                            break;
                    }
                    break;
                // 房间。
                case 0:
                    if (EAM.pConfig.bTestPOIMode)
                        pSite.Name += " | " + pSite.Id;
                    pThis.DrawPOI(0, pCavans, pSite, null);
                    bCanClick = true;
                    break;
                // 720全景点。
                case 3:
                    if (!pEamInfrasView.IfMatchType(pSite.Type))
                        return;
                    pThis.DrawPOI(3, pCavans, pSite, null);
                    bCanClick = true;
                    break;
                // 道路。
                case 4:
                    if (!pEamInfrasView.IfMatchType(pSite.Type))
                        return;
                    pThis.DrawPOI(4, pCavans, pSite, null);

                    break;
                // 未绑定数据节点。
                case 5:
                    if (!EAM.pConfig.bTestPOIMode)
                        return;
                    if (!pEamInfrasView.IfMatchType(pSite.Type))
                        return;
                    pThis.DrawPOI(5, pCavans, pSite, null);
                    break;
            }
        } else {
            if (pEamCanvasHandle.m_nCanvasSizeType == 2)
                return;

            // 续命当前已经点击的节点 
            if (pThis.CheckSite(pSite)) {
                pThis.m_pCheckSite = pSite;
            }
            return;
        }

        if (!bCanClick)
            return;

        if (pEamCanvasHandle.m_nCanvasSizeType == 2)
            return;

        // 浮标单击事件检测。
        if (pThis.CheckClick(EAM.pV2Click, pSite.Position)) {
            pThis.m_pCheckSite = pSite;
            EAM.m_pEamRoomBoard.m_bShowActive = false;
            EAM.m_pEamBuildBoard.m_bShowActive = false;
            EAM.m_pEamPanoramaBoard.m_bShowActive = false;
        }

        // 续命当前已经点击的节点
        if (pThis.CheckSite(pSite)) {
            pThis.m_pCheckSite = pSite;
        }
    }

    /// 判断是否点击命中浮标。
    CheckClick(pClick, mPosition) {
        let pThis = EAM.m_pEamPOIBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        if (pClick) {
            let nDistance = Vector3.Distance(mPosition, pClick);
            if (50 > nDistance) {
                return true;
            }
        }
        return false;
    }

    /// 判断当前节点是否为点击的节点。
    CheckSite(pSite) {
        let pThis = EAM.m_pEamPOIBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        if (pThis.m_pCheckSite == null)
            return;
        if (pSite == null) {
            return;
        }

        if (pThis.m_pCheckSite.Id == pSite.Id) {
            return true;
        } else {
            return false;
        }
    }

    /// 清理节点状态。
    ClearBoardActive() {
        let pThis = EAM.m_pEamPOIBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        EAM.pV2Click = null;
        pThis.m_pCheckSite = null;
    }

    DrawPOI(nStyle, pCavans, pSite, pCheckWork) {
        let pThis = EAM.m_pEamPOIBoard;
        switch (nStyle) {
            case 0:
                // 内容。
                var pStr = pSite.Name;
                // 背景高。
                var nBgHeigth = 36;
                // 背景偏离高
                var nBgDevPos = -23;
                // 统计总长度。
                var nFullWidth = 0;
                // 文字
                pCavans.strokeStyle = "white";
                pCavans.lineWidth = 3;
                pCavans.fillStyle = "#000000";
                pCavans.font = "bold 20px Microsoft YaHei";
                var nTextWidth = pCavans.measureText(pStr).width;
                nFullWidth += nTextWidth;
                // 统计总长度 End。
                //===========================
                // 开始绘制。
                var nLeftStart = -(nFullWidth / 2);
                // 描边
                pCavans.strokeText(pStr, pSite.Position.x + nLeftStart, pSite.Position.y);
                // 文字
                pCavans.fillText(pStr, pSite.Position.x + nLeftStart, pSite.Position.y);
                // 开始绘制 End。
                break;
            case 1:

                break;
            case 2:
                // 内容。
                var pStr = pCheckWork.building_name;
                // 背景高。
                var nBgHeigth = 36;
                // 背景偏离高
                var nBgDevPos = -23;
                // 统计总长度。
                var nFullWidth = 0;
                // 单项宽。
                var nItemWidth = 8;
                // 左部
                nFullWidth += nItemWidth;
                // 空格
                nFullWidth += nItemWidth;
                // Logo
                nFullWidth += 20;
                // 空格
                nFullWidth += nItemWidth;
                // 文字
                pCavans.fillStyle = "#0793D1";
                pCavans.font = "bold 16px Microsoft YaHei";
                var nTextWidth = pCavans.measureText(pStr).width;
                nFullWidth += nTextWidth;
                // 空格
                nFullWidth += nItemWidth;
                // 右部
                nFullWidth += nItemWidth;
                // 统计总长度 End。
                //===========================
                // 开始绘制。
                var nLeftStart = -(nFullWidth / 2);
                // 左部
                pCavans.drawImage(pThis.m_aBgList[0].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                nLeftStart += nItemWidth;
                // 中部。
                pCavans.drawImage(pThis.m_aBgList[1].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nFullWidth - nItemWidth * 2, nBgHeigth);
                // 空格
                nLeftStart += nItemWidth;
                // Logo
                pCavans.drawImage(pThis.m_pBuildingImg.image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos + 6, 20, 20);
                nLeftStart += 20;
                // 空格
                nLeftStart += nItemWidth;
                // 文字
                pCavans.fillText(pStr, pSite.Position.x + nLeftStart, pSite.Position.y - 1);
                nLeftStart += nTextWidth;
                // 空格
                nLeftStart += nItemWidth;
                // 右部
                pCavans.drawImage(pThis.m_aBgList[2].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                // 三角形.
                pCavans.drawImage(pThis.m_pTriangleImg.image, pSite.Position.x - nItemWidth, pSite.Position.y, 20, 20);
                // 开始绘制 End。
                break;
            case 3:
                pCavans.drawImage(pThis.m_pPanoramaImg.image, pSite.Position.x - 25, pSite.Position.y, 50, 50);
                break;
            case 4:
                // 内容。
                var pStr = pSite.Name;
                // 背景高。
                var nBgHeigth = 36;
                // 背景偏离高
                var nBgDevPos = -23;
                // 统计总长度。
                var nFullWidth = 0;
                // 单项宽。
                var nItemWidth = 8;
                // 左部
                nFullWidth += nItemWidth;
                // 空格
                nFullWidth += nItemWidth;
                // 文字
                pCavans.fillStyle = "#6A6A6A";
                pCavans.font = "bold 16px Microsoft YaHei";
                var nTextWidth = pCavans.measureText(pStr).width;
                nFullWidth += nTextWidth;
                // 空格
                nFullWidth += nItemWidth;
                // 右部
                nFullWidth += nItemWidth;
                // 统计总长度 End。
                //===========================
                // 开始绘制。
                var nLeftStart = -(nFullWidth / 2);
                // 左部
                pCavans.drawImage(pThis.m_aBgList[0].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                nLeftStart += nItemWidth;
                // 中部。
                pCavans.drawImage(pThis.m_aBgList[1].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nFullWidth - nItemWidth * 2, nBgHeigth);
                // 空格
                nLeftStart += nItemWidth;
                // 文字
                pCavans.fillText(pStr, pSite.Position.x + nLeftStart + 2, pSite.Position.y - 1);
                nLeftStart += nTextWidth;
                // 空格
                nLeftStart += nItemWidth;
                // 右部
                pCavans.drawImage(pThis.m_aBgList[2].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                // 三角形.
                pCavans.drawImage(pThis.m_pTriangleImg.image, pSite.Position.x - nItemWidth, pSite.Position.y, 20, 20);
                // 开始绘制 End。
                break;
            case 5:
                // 内容。
                var pStr = pSite.Name;
                // 背景高。
                var nBgHeigth = 36;
                // 背景偏离高
                var nBgDevPos = -23;
                // 统计总长度。
                var nFullWidth = 0;
                // 单项宽。
                var nItemWidth = 8;
                // 左部
                nFullWidth += nItemWidth;
                // 空格
                nFullWidth += nItemWidth;
                // 文字
                pCavans.fillStyle = "#6A6A6A";
                pCavans.font = "bold 16px Microsoft YaHei";
                var nTextWidth = pCavans.measureText(pStr).width;
                nFullWidth += nTextWidth;
                // 空格
                nFullWidth += nItemWidth;
                // 右部
                nFullWidth += nItemWidth;
                // 统计总长度 End。
                //===========================
                // 开始绘制。
                var nLeftStart = -(nFullWidth / 2);
                // 左部
                pCavans.drawImage(pThis.m_aBgList[0].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                nLeftStart += nItemWidth;
                // 中部。
                pCavans.drawImage(pThis.m_aBgList[1].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nFullWidth - nItemWidth * 2, nBgHeigth);
                // 空格
                nLeftStart += nItemWidth;
                // 文字
                pCavans.fillText(pStr, pSite.Position.x + nLeftStart + 2, pSite.Position.y - 1);
                nLeftStart += nTextWidth;
                // 空格
                nLeftStart += nItemWidth;
                // 右部
                pCavans.drawImage(pThis.m_aBgList[2].image, pSite.Position.x + nLeftStart, pSite.Position.y + nBgDevPos, nItemWidth, nBgHeigth);
                // 开始绘制 End。
                break;
        }
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 加载各个分类的图标。
    LoadTypeIcon(pCallback) {
        let pThis = EAM.m_pEamPOIBoard;
        pThis.m_pBuildingImg = new THREE.ImageUtils.loadTexture('./img/Texture_3D/BuildingImg.png', {}, function () {
            pThis.m_pPanoramaImg = new THREE.ImageUtils.loadTexture('./img/Texture_3D/PanoramaImg.png', {}, function () {
                pThis.m_aBgList[0] = new THREE.ImageUtils.loadTexture('./img/Texture_3D/TextBgLeft.png', {}, function () {
                    pThis.m_aBgList[1] = new THREE.ImageUtils.loadTexture('./img/Texture_3D/TextBgCenter.png', {}, function () {
                        pThis.m_aBgList[2] = new THREE.ImageUtils.loadTexture('./img/Texture_3D/TextBgRight.png', {}, function () {
                            pThis.m_pTriangleImg = new THREE.ImageUtils.loadTexture('./img/Texture_3D/TriangleImg.png', {}, function () {
                                pCallback();
                            });
                        });
                    });
                });
            });
        });
    }

    /* -▲ */
    //#endregion -数据加载 end

}

/// 楼宇详情浮标。
class EamBuildBoard {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;
        /// 显示状态。
        this.m_bShowActive = false;
        /// 详情浮标实体。
        this.m_pBoardEntry = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamBuildBoard;

        return !pThis.bModeSwitch;
    }

    /// 关闭面板。
    CloseEntry() {
        let pThis = EAM.m_pEamBuildBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        pThis.m_bShowActive = false;
        EAM.m_pEamPOIBoard.ClearBoardActive();
        let pItem = pThis.GetEntry();
        pItem.css("display", "none");
    }

    /// 获取面板。
    GetEntry() {
        let pThis = EAM.m_pEamBuildBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        if (pThis.m_pBoardEntry == null) {
            let pObject = $(".webgl-BillboardInfoBox").first();
            let pItem = pObject.find(".billboardInfo-build-Panel").first();
            pThis.m_pBoardEntry = pItem;
            pThis.m_pBoardEntry.find(".billboardInfo-build-Show-Goto").first().click(function () {
                if (pThis.m_pBoardEntry.find(".billboardInfo-build-Show-Goto").hasClass("btnDisable"))
                    return;
                EAM.SwitchSceneByBuildId(EAM.m_pEamPOIBoard.m_pCheckSite.Id);
                if (!ALinerDC.g_bStackUp)
                    EAM.StackUp(true);
                pThis.CloseEntry();
            });
            pThis.m_pBoardEntry.find(".billboardInfo-build-Show-close").first().click(function () {
                pThis.CloseEntry();
            });
        }

        return pThis.m_pBoardEntry;
    }

    /// 更新楼宇详情面板。
    Update() {
        let pThis = EAM.m_pEamBuildBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pCheckSite = EAM.m_pEamPOIBoard.m_pCheckSite;
        if (pCheckSite == null) {
            if (pThis.m_bShowActive == true) {
                pThis.CloseEntry();
            }
            return;
        }

        let nIdent = -1;
        if (pCheckSite.Type != nIdent) {
            pThis.m_bShowActive = false;
            let pItem = pThis.GetEntry();
            pItem.css("display", "none");
            return;
        }

        let pItem = pThis.GetEntry();
        if (!pThis.m_bShowActive) {
            let x = EAM.pEngine.m_nCavasScale.x * pCheckSite.Position.x;
            let y = EAM.pEngine.m_nCavasScale.y * pCheckSite.Position.y;
            pItem.css("left", x + "px");
            pItem.css("top", y + "px");

            pThis.m_bShowActive = true;

            pItem.find(".billboardInfo-build-BuildName").first().html(" ");
            pItem.find(".billboardInfo-build-heightSize").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-layerNum").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-roomNum").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-useAcreage").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-buildAcreage").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-createTime").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-openTime").find(".billboardInfo-build-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-build-useOdds").find(".billboardInfo-build-itemData").first().html(" ");
            pItem.find(".billboardInfo-build-lendEndNum").find(".billboardInfo-build-itemData").first().html(" ");

            pItem.find(".billboardInfo-build-useOdds").find(".billboardInfo-build-itemName").css({
                color: "#C0C0C0"
            });
            pItem.find(".billboardInfo-build-lendEndNum").find(".billboardInfo-build-itemName").css({
                color: "#C0C0C0"
            });
            pItem.css("display", "block");

            pThis.SetButtonActive(true);

            if (!EAM.HasLanded()) {
                pItem.find(".billboardInfo-build-BuildName").first().html("请登录查看楼宇详细信息");
                pItem.find(".billboardInfo-build-BuildName").first().css("color", "#f14707");
                //pThis.SetButtonActive(true);
                return;
            }

            let pBuildId = pCheckSite.Id;
            pThis.LoadBuildInfoByBuildId(pBuildId, function (pDataInfo) {
                if (pCheckSite == null)
                    return;
                let bSuccess = false;
                let bChange = false;
                if (pBuildId == pCheckSite.Id)
                    bSuccess = true;
                if (!pDataInfo)
                    bSuccess = false;
                if (pDataInfo) {
                    if (EAM.m_pEamPOIBoard.m_pCheckSite) {
                        if (pDataInfo.pBuildId != EAM.m_pEamPOIBoard.m_pCheckSite.Id)
                            bChange = true;
                    }
                }
                if (bChange) {
                    pItem.find(".billboardInfo-build-BuildName").first().html("正在获取楼宇详情");
                }
                else if (bSuccess) {
                    pItem.find(".billboardInfo-build-BuildName").first().html(pDataInfo.pBuildName);
                    pItem.find(".billboardInfo-build-heightSize").find(".billboardInfo-build-itemData").first().html(pDataInfo.pHeightSize + "M");
                    pItem.find(".billboardInfo-build-layerNum").find(".billboardInfo-build-itemData").first().html(pDataInfo.pLayerNum + "层");
                    pItem.find(".billboardInfo-build-roomNum").find(".billboardInfo-build-itemData").first().html(pDataInfo.pRoomNum + "");
                    pItem.find(".billboardInfo-build-useAcreage").find(".billboardInfo-build-itemData").first().html(pDataInfo.pUseAcreage + "㎡");
                    pItem.find(".billboardInfo-build-buildAcreage").find(".billboardInfo-build-itemData").first().html(pDataInfo.pBuildAcreage + "㎡");
                    let pCreateTime = "暂无";
                    if (pDataInfo.pCreateTime)
                        pCreateTime = EAM.GetSecondTransData(pDataInfo.pCreateTime);
                    pItem.find(".billboardInfo-build-createTime").find(".billboardInfo-build-itemData").first().html(pCreateTime + "");
                    let pOpenTime = "暂无";
                    if (pDataInfo.pOpenTime)
                        pOpenTime = EAM.GetSecondTransData(pDataInfo.pOpenTime);
                    pItem.find(".billboardInfo-build-openTime").find(".billboardInfo-build-itemData").first().html(pOpenTime + "");
                    if (EAM.HasLanded()) {
                        let pUseOdds = pDataInfo.pUseOdds;
                        if (!pUseOdds)
                            pUseOdds = "0%";
                        pItem.find(".billboardInfo-build-useOdds").find(".billboardInfo-build-itemData").first().html(pUseOdds + "");
                        pItem.find(".billboardInfo-build-lendEndNum").find(".billboardInfo-build-itemData").first().html(pDataInfo.pLendEndNum + "");
                        pItem.find(".billboardInfo-build-useOdds").find(".billboardInfo-build-itemName").css({
                            color: "#307ED9"
                        });
                        pItem.find(".billboardInfo-build-lendEndNum").find(".billboardInfo-build-itemName").css({
                            color: "#FF0000"
                        });
                    }
                    // pThis.SetButtonActive(true);
                } else {
                    pItem.find(".billboardInfo-build-BuildName").first().html("楼宇详情获取失败");
                    // pThis.SetButtonActive(false);
                }
            });
        }

        if (pThis.m_bShowActive) {
            // 更新位置 
            let x = EAM.pEngine.m_nCavasScale.x * pCheckSite.Position.x;
            let y = EAM.pEngine.m_nCavasScale.y * pCheckSite.Position.y;

            pItem.css("left", x + "px");
            pItem.css("top", y + "px");
        }
    }

    /// 设置按钮显示状态。
    SetButtonActive(b) {
        let pThis = EAM.m_pEamBuildBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetEntry();
        if (b) {
            if (!pItem.find(".billboardInfo-build-Show-Goto").hasClass("btnEnable"))
                pItem.find(".billboardInfo-build-Show-Goto").addClass("btnEnable");
            if (pItem.find(".billboardInfo-build-Show-Goto").hasClass("btnDisable"))
                pItem.find(".billboardInfo-build-Show-Goto").removeClass("btnDisable");
        } else {
            if (!pItem.find(".billboardInfo-build-Show-Goto").hasClass("btnDisable"))
                pItem.find(".billboardInfo-build-Show-Goto").addClass("btnDisable");
            if (pItem.find(".billboardInfo-build-Show-Goto").hasClass("btnEnable"))
                pItem.find(".billboardInfo-build-Show-Goto").removeClass("btnEnable");
        }
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 根据楼宇Id获取楼宇详情数据。
    LoadBuildInfoByBuildId(nBuildId, pBack) {
        let pEamIdTrans = EAM.m_pEamIdTrans;
        let nDataId = pEamIdTrans.GetWorkDataIdByBuildId(nBuildId);
        let pUserIdAdd = "&id=";
        pUserIdAdd += EAM.GetUserId();
        let pFullUrl = EAM.GetFormat(EAM.GetAPI(2), nDataId);
        pFullUrl += pUserIdAdd;
        let pAddObj = {
            beforeSend: function (XMLHttpRequest) {
                sessionStorage.getItem("accessToken");
                this.zaccessToken = sessionStorage.accessToken; // token
                XMLHttpRequest.setRequestHeader('XX-Token', this.zaccessToken); //自定义header头
            },
        };
        EAM.AJAXPuzzle(pFullUrl, 'get', pAddObj, function (pData) {
            if (!pData) {
                pBack(null);
                return;
            }
            pData = pData.data;
            let pDataInfo = {
                nId: pData.id,
                pBuildId: pData.build_id,
                pBuildName: pData.build_name,
                pHeightSize: pData.build_heightSize,
                pLayerNum: pData.build_layerNum,
                pRoomNum: pData.build_roomNum,
                pUseAcreage: pData.build_useAcreage,
                pBuildAcreage: pData.build_buildAcreage,
                pCreateTime: pData.build_createTime,
                pOpenTime: pData.build_openTime,
                pUseOdds: pData.build_useOdds,
                pLendEndNum: pData.build_lendEndNum,
            };
            pBack(pDataInfo);
        });
    }

    /* -▲ */
    //#endregion -数据加载 end

}

/// 房间详情浮标。
class EamRoomBoard {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;
        /// 显示状态。
        this.m_bShowActive = false;
        /// 详情浮标实体。
        this.m_pBoardEntry = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamRoomBoard;

        return !pThis.bModeSwitch;
    }

    /// 关闭房间详情面板。
    CloseEntry() {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        pThis.m_bShowActive = false;
        EAM.m_pEamPOIBoard.ClearBoardActive();
        let pItem = pThis.GetEntry();
        pItem.css("display", "none");
    }

    /// 获取房间详情面板。
    GetEntry() {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pEamIdTrans = EAM.m_pEamIdTrans;
        if (pThis.m_pBoardEntry == null) {
            let pObject = $(".webgl-BillboardInfoBox").first();
            let pItem = pObject.find(".billboardInfo-room-Panel").first();
            pThis.m_pBoardEntry = pItem;
            pThis.m_pBoardEntry.find(".billboardInfo-room-Show-useRoom").first().click(function () {
                if (!EAM.HasLanded())
                    return;
                let pItem = pThis.GetEntry();
                if (pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnDisable"))
                    return;
                let pRoomDataId = pEamIdTrans.GetRoomDataIdByRoomId(EAM.m_pEamPOIBoard.m_pCheckSite.Id);
                COMMUBrowserIns.m_pUseRoom(pRoomDataId);
            });
            pThis.m_pBoardEntry.find(".billboardInfo-room-Show-backRoom").first().click(function () {
                if (!EAM.HasLanded())
                    return;
                let pItem = pThis.GetEntry();
                if (pItem.find(".billboardInfo-room-Show-backRoom").hasClass("btnDisable"))
                    return;
                let pRoomDataId = pEamIdTrans.GetRoomDataIdByRoomId(EAM.m_pEamPOIBoard.m_pCheckSite.Id);
                COMMUBrowserIns.m_pBackRoom(pRoomDataId);
            });
            pThis.m_pBoardEntry.find(".billboardInfo-room-Show-close").first().click(function () {
                pThis.CloseEntry();
            });
            pThis.m_pBoardEntry.find(".billboardInfo-room-more").first().click(function () {
                if (!EAM.HasLanded())
                    return;
                if (pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnDisable"))
                    return;
                let pRoomDataId = pEamIdTrans.GetRoomDataIdByRoomId(EAM.m_pEamPOIBoard.m_pCheckSite.Id);
                COMMUBrowserIns.m_pShowMoreInfo(pRoomDataId);
            });
        }

        return pThis.m_pBoardEntry;
    }

    /// 更新房间详情面板。
    Update() {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pCheckSite = EAM.m_pEamPOIBoard.m_pCheckSite;
        let pEamIdTrans = EAM.m_pEamIdTrans;
        if (pCheckSite == null) {
            if (pThis.m_bShowActive == true)
                pThis.CloseEntry();
            return;
        }
        let nIdent = 0;
        if (pCheckSite.Type != nIdent) {
            pThis.m_bShowActive = false;
            let pItem = pThis.GetEntry();
            pItem.css("display", "none");
            return;
        }

        let pItem = pThis.GetEntry();
        if (!pThis.m_bShowActive) {
            let x = EAM.pEngine.m_nCavasScale.x * pCheckSite.Position.x;
            let y = EAM.pEngine.m_nCavasScale.y * pCheckSite.Position.y;
            pItem.css("left", x + "px");
            pItem.css("top", y + "px");

            pThis.m_bShowActive = true;

            pItem.find(".billboardInfo-room-RoomName").first().html(" ");
            pItem.find(".billboardInfo-room-department").find(".billboardInfo-room-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-room-property").find(".billboardInfo-room-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-room-userName").find(".billboardInfo-room-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-room-acreage").find(".billboardInfo-room-itemData").first().html("暂无 ");
            pItem.find(".billboardInfo-room-more").css("display", "none");
            pItem.css("display", "block");


            if (!EAM.HasLanded()) {
                pThis.CheckHaveUserName(null);
                pItem.find(".billboardInfo-room-RoomName").first().html("请登录查看房间详细信息");
                pItem.find(".billboardInfo-room-RoomName").first().css("color", "#f14707");
                pThis.SetButtonActive(false);
                return;
            }
            let pRoomDataId = pEamIdTrans.GetRoomDataIdByRoomId(pCheckSite.Id);

            pThis.LoadRoomInfoByRoomDataId(pRoomDataId, function (pDataInfo) {
                if (pCheckSite == null)
                    return;
                let bSuccess = false;
                let pCurDataId = pEamIdTrans.GetRoomDataIdByRoomId(pCheckSite.Id);
                if (pRoomDataId == pCurDataId)
                    bSuccess = true;
                if (pDataInfo == null)
                    bSuccess = false;
                if (bSuccess) {
                    pItem.find(".billboardInfo-room-RoomName").first().html(pDataInfo.pRoomName);
                    pItem.find(".billboardInfo-room-RoomName").first().css("color", " #0793D1");
                    pItem.find(".billboardInfo-room-department").find(".billboardInfo-room-itemData").first().html(pDataInfo.pDepartment + "");
                    pItem.find(".billboardInfo-room-property").find(".billboardInfo-room-itemData").first().html(pDataInfo.pProperty + "");
                    pItem.find(".billboardInfo-room-userName").find(".billboardInfo-room-itemData").first().html(pDataInfo.pUserName + "");
                    pThis.CheckHaveUserName(pDataInfo.pUserName);
                    pItem.find(".billboardInfo-room-acreage").find(".billboardInfo-room-itemData").first().html(pDataInfo.pAcreage + "㎡");
                    pItem.find(".billboardInfo-room-more").css("display", "block");
                    pThis.SetButtonActive(true);
                } else {
                    pThis.CheckHaveUserName(null);
                    pItem.find(".billboardInfo-room-RoomName").first().html("房间详情获取失败");
                    pItem.find(".billboardInfo-room-RoomName").first().css("color", "#f14707");
                    pThis.SetButtonActive(false);
                }
            });
        }

        if (pThis.m_bShowActive) {
            // 更新位置 
            let x = EAM.pEngine.m_nCavasScale.x * pCheckSite.Position.x;
            let y = EAM.pEngine.m_nCavasScale.y * pCheckSite.Position.y;

            pItem.css("left", x + "px");
            pItem.css("top", y + "px");
        }
    }

    /// 设置房间详情面板按钮显示状态。
    SetButtonActive(b) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetEntry();
        if (b) {
            if (!pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnEnable"))
                pItem.find(".billboardInfo-room-Show-useRoom").addClass("btnEnable");
            if (pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnDisable"))
                pItem.find(".billboardInfo-room-Show-useRoom").removeClass("btnDisable");

            if (!pItem.find(".billboardInfo-room-Show-backRoom").hasClass("btnEnable"))
                pItem.find(".billboardInfo-room-Show-backRoom").addClass("btnEnable");
            if (pItem.find(".billboardInfo-room-Show-backRoom").hasClass("btnDisable"))
                pItem.find(".billboardInfo-room-Show-backRoom").removeClass("btnDisable");
        } else {
            if (!pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnDisable"))
                pItem.find(".billboardInfo-room-Show-useRoom").addClass("btnDisable");
            if (!pItem.find(".billboardInfo-room-Show-useRoom").hasClass("btnDisable"))
                pItem.find(".billboardInfo-room-Show-useRoom").addClass("btnDisable");

            if (!pItem.find(".billboardInfo-room-Show-backRoom").hasClass("btnDisable"))
                pItem.find(".billboardInfo-room-Show-backRoom").addClass("btnDisable");
            if (pItem.find(".billboardInfo-room-Show-backRoom").hasClass("btnEnable"))
                pItem.find(".billboardInfo-room-Show-backRoom").removeClass("btnEnable");
        }
    }

    /// 检查是否有用户名。
    CheckHaveUserName(UserName) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        if (UserName) {
            pThis.SetRoomButtonShowSize(2);
        } else {
            pThis.SetRoomButtonShowSize(1);
        }
    }

    /// 设置按钮显示个数。
    SetRoomButtonShowSize(nSize) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        pThis.SwitchUseRoomButtonActive(nSize);
        pThis.SwitchBackRoomButtonActive(nSize);
        pThis.SwitchUserNameItemActive(nSize);
    }

    /// 设置用房按钮显示状态。
    SwitchUseRoomButtonActive(nSize) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetEntry().find(".billboardInfo-room-Show-useRoom").first();
        let nIdent = 1;
        switch (nSize) {
            case 1:
                pItem.css("left", 90 + "px");
                pItem.children().first().html("安排用房");
                break;
            case 2:
                pItem.css("left", 30 + "px");
                pItem.children().first().html("编辑用房");
                break;
        }
    }

    /// 设置退房按钮显示状态。
    SwitchBackRoomButtonActive(nSize) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetEntry().find(".billboardInfo-room-Show-backRoom").first();
        let nIdent = 2;
        switch (nSize) {
            case 1:
                pItem.css("display", "none");
                break;
            case 2:
                pItem.css("display", "block");
                break;
        }
    }

    /// 设置用户项显示状态。
    SwitchUserNameItemActive(nSize) {
        let pThis = EAM.m_pEamRoomBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pItem = pThis.GetEntry().find(".billboardInfo-room-userName").find(".billboardInfo-room-itemData").first();
        switch (nSize) {
            case 1:
                pItem.html("暂无");
                break;
            case 2:

                break;
        }
    }


    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /// 根据房间Id加载房间详情。
    LoadRoomInfoByRoomDataId(pRoomDataId, pBackData) {
        COMMUBrowserIns.m_pGetRoomInfoById(pRoomDataId, function (pRoomInfo) {
            if (pRoomInfo == null) {
                pBackData(null);
                return;
            }

            let pDataInfo = {
                pRoomName: pRoomInfo.roomName,
                pDepartment: pRoomInfo.UseDepartment,
                pProperty: pRoomInfo.arrangeType,
                pUserName: pRoomInfo.UserName,
                pAcreage: pRoomInfo.useArea,
                pPower: pRoomInfo.power,

            };

            pBackData(pDataInfo);

        });
    }


    /* -▲ */
    //#endregion -数据加载 end

}

/// 全景浮标。
class EamPanoramaBoard {
    constructor() {
        // 模块总闸。
        this.bModeSwitch = true;
        /// 显示状态。
        this.m_bShowActive = false;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamPanoramaBoard;

        return !pThis.bModeSwitch;
    }

    /// 更新720全景面板。
    Update() {
        let pThis = EAM.m_pEamPanoramaBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        let pCheckSite = EAM.m_pEamPOIBoard.m_pCheckSite;
        let bUpdatePos = false; // 是否支持帧持续更新位置信息。
        if (pCheckSite == null) {
            if (pThis.m_bShowActive == true) {
                // 通知web关闭720窗口。
                pThis.m_bShowActive = false;
                COMMUBrowserIns.m_pClosePanoramaPanel();
            }
            return;
        }

        let nIdent = 3;
        if (pCheckSite.Type != nIdent)
            return;

        let pImgUrl = "";
        let pName = "";

        if (!pThis.m_bShowActive) {
            pThis.m_bShowActive = true;
            pName = pCheckSite.Name;
            let aRoomList = EAM.aRoomList;
            for (let pRoomItem of aRoomList) {
                if (pCheckSite.Id == pRoomItem.roomID) {
                    pImgUrl = EAM.pConfig.pHost + EAM.pImgJointUrl + pRoomItem.panoramaUrl;
                }
            }
        }

        if (pThis.m_bShowActive) {
            // 更新位置 
            let x = EAM.pEngine.m_nCavasScale.x * pCheckSite.Position.x;
            let y = EAM.pEngine.m_nCavasScale.y * pCheckSite.Position.y;

            let pPanoramaInfo = {
                PosX: x,
                PosY: y,
                ImgUrl: pImgUrl,
                Name: pName,
            };

            // 把位置通知给前端。
            COMMUBrowserIns.m_pUpdata720Info(pPanoramaInfo);

            if (!bUpdatePos) {
                EAM.m_pEamPOIBoard.m_pCheckSite = null;
                pThis.m_bShowActive = false;
            }
        }
    }

    /// Web关闭720窗口时。
    OnClosePanorama() {
        let pThis = EAM.m_pEamPanoramaBoard;
        if (pThis.IfModeClose()) {
            return;
        }

        EAM.m_pEamPOIBoard.ClearBoardActive();
        pThis.m_bShowActive = false;
    }


    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end

}

/// 房间状态功能。
class EamRoomStatusMode {
    constructor() {

        this.bModeSwitch = true;// 模块总闸。

        /// 楼宇的所有房间状态信息。
        this.m_pRoomStatus = null;
    }

    //#region -成员函数
    /* -▼ */

    /// 模块是否拉闸。
    IfModeClose() {
        let pThis = EAM.m_pEamRoomStatusMode;

        return !pThis.bModeSwitch;
    }

    // 更新房间使用状态信息。
    UpdataInfo() {
        let pThis = EAM.m_pEamRoomStatusMode;

        if (pThis.IfModeClose()) {
            return;
        }

        if (!EAM.HasLanded())
            return;

        let pBuildId = EAM.pCurWork.building_id;
        pThis.LoadRoomStatusByBuildId(pBuildId, function (pData) {
            if (EAM.pCurWork.building_id != pBuildId)
                return;
            pThis.m_pRoomStatus = pData;
            pThis.TransLayerPanelColor();
        });

    }

    /// 改变当前楼层下所有地板的颜色。  
    TransLayerPanelColor() {
        let pThis = EAM.m_pEamRoomStatusMode;

        if (pThis.IfModeClose()) {
            return;
        }

        if (pThis.m_pRoomStatus == null)
            return;
        if (EAM.pCurLayer == null)
            return;

        // 当前层的所有房间完全数据列表。
        let aLayerRoomList = [];
        // 当前层所有地板。
        let aAAreaLabelList = ALinerDC.DC.m_pLayerMgr.m_pActiveLayer.m_pLabelList;
        // 当前层所有节点。
        let aLandmarkList = NavChartDC.DC.m_pLayerMgr.m_pActiveLayer.m_mLandmarkList;
        // 所有房间json数据列表。
        let aRoomList = EAM.aRoomList;
        // 当前层所有房间状态列表。
        let aRoomStatusList = [];

        // 1.填充当前楼层所有房间状态信息。叠RoomId和Position
        for (let pLandmarkItem of aLandmarkList) {
            for (let pRoomItem of aRoomList) {
                if (pLandmarkItem.m_pSerial == pRoomItem.roomID) {
                    let pPos = {
                        x: pLandmarkItem.m_mPoint.Object.m_mPosition.x.toFixed(2),
                        y: pLandmarkItem.m_mPoint.Object.m_mPosition.y.toFixed(2),
                        z: pLandmarkItem.m_mPoint.Object.m_mPosition.z.toFixed(2),
                    };
                    aLayerRoomList.push({
                        nId: pRoomItem.id,
                        nRoomId: pRoomItem.roomID,
                        pPosition: pPos,
                        pStatus: -1,
                        pColor: "",
                        pPanelMaterial: null,
                    });
                }
            }
        }
        // 2.填充当前层所有房间状态列表。
        for (let pLayerStatus of pThis.m_pRoomStatus.aLayerDataList) {
            if (pLayerStatus.nFloorId == EAM.pCurLayer.floor_id) {
                for (let pRoomStatus of pLayerStatus.aRoomDataList) {
                    aRoomStatusList.push({
                        nId: pRoomStatus.nId,

                        pRoomStatus: pRoomStatus.pRoomStatus,
                        pColor: pRoomStatus.pColor,
                    });
                }
            }
        }
        // 3.填充当前楼层所有房间状态。叠Status
        for (let pRoomItem of aLayerRoomList) {
            for (let pRoomStatus of aRoomStatusList) {
                if (pRoomItem.nId == pRoomStatus.nId) {
                    pRoomItem.pStatus = pRoomStatus.pRoomStatus;
                    pRoomItem.pColor = pRoomStatus.pColor;
                }
            }
        }
        // 4.填充当前楼层所有房间地板材质物体。叠PanelObj
        for (let pRoomItem of aLayerRoomList) {
            for (let pLabe of aAAreaLabelList) {
                //这里判断当前房间节点是不是在当前地板的范围内
                let pPos = new Vector3(pRoomItem.pPosition.x, pRoomItem.pPosition.y, pRoomItem.pPosition.z);
                if (pLabe.m_pArea.CollideBottom(pPos)) {
                    pRoomItem.pPanelMaterial = pLabe.m_pArea.m_pBottomMesh.m_pMaterial.m_pMaterial;
                }
            }
        }
        // 5.当所有数据拥有时开始设置颜色。
        for (let pRoomItem of aLayerRoomList) {
            let pMaterial = pRoomItem.pPanelMaterial;
            // 以颜色方式设置颜色。
            let lRgb = pThis.TransColor(pRoomItem.pColor);
            if (lRgb == null)
                continue;
            lRgb = lRgb.split(",")
            if (lRgb.length == 0)
                continue;
            pMaterial.map = null;
            pMaterial.color = new THREE.Color((lRgb[0] / 255).toFixed(2), (lRgb[1] / 255).toFixed(2), (lRgb[2] / 255).toFixed(2));
            pMaterial.needsUpdate = true;
        }
    }

    /// 颜色编码转rgb
    TransColor(pNumber) {
        let pThis = EAM.m_pEamRoomStatusMode;

        if (pThis.IfModeClose()) {
            return null;
        }

        if (!pNumber)
            return null;
        let sColor = pNumber.toLowerCase();
        // 十六进制颜色值的正则表达式
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 如果是16进制颜色
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                let sColorNew = "#";
                for (let i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            // 处理六位的颜色值
            let sColorChange = [];
            for (let i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return sColorChange.join(",");
        }
        return null;
    };

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    LoadRoomStatusByBuildId(nBuildId, pBack) {
        /// 根据楼宇Id获取楼宇所有楼层下房间状态信息。
        let pEamIdTrans = EAM.m_pEamIdTrans;
        let nDataId = pEamIdTrans.GetWorkDataIdByBuildId(nBuildId);
        COMMUBrowserIns.m_pGetRoomStatus(nDataId, function (pBackData) {
            // console.error("看看房间状态信息=>",pBackData);

            if (pBackData == null)
                return;
            let pData = pBackData;
            let pDataInfo = {
                aLayerDataList: [],
            };
            for (let pLayerData of pData) {
                let pLayer = {
                    nFloorId: pLayerData.floorId,
                    aRoomDataList: [],
                };
                for (let pRoomData of pLayerData.roomList) {
                    let pRoom = {
                        nId: pRoomData.id,
                        pColor: pRoomData.roomColor,
                        pRoomStatus: pRoomData.roomStatus,
                    };
                    pLayer.aRoomDataList.push(pRoom);
                }
                pDataInfo.aLayerDataList.push(pLayer);
            }
            pBack(pDataInfo);
        });
    }

    /* -▲ */
    //#endregion -数据加载 end
}

/// 编号转换。
class EamIdTrans {
    constructor() {

    }
    //#region -成员函数
    /* -▼ */

    //#region 数据Id-<-转-<-场景Id
    /* --▼ */

    /// 获取场景数据Id根据校区Id。
    GetWorkDataIdByAreaId(pAreaId) {
        if (pAreaId == null)
            return null;
        let Ident = 1;
        let aWorkList = EAM.aWorkList;
        for (let pItem of aWorkList) {
            if (pItem.building_id == pAreaId && pItem.type == Ident) {
                return pItem.id;
            }
        }
        return -1;
    }

    /// 获取场景数据Id根据楼宇Id。
    GetWorkDataIdByBuildId(pBuildId) {
        if (pBuildId == null)
            return null;
        let Ident = 2;
        let aWorkList = EAM.aWorkList;
        for (let pItem of aWorkList) {
            if (pItem.building_id == pBuildId && pItem.type == Ident) {
                return pItem.id;
            }
        }
        return -1;
    }

    /// 获取楼层数据Id根据楼层Id。
    GetLayerDataIdByLayerId(pLayerId) {
        if (pLayerId == null)
            return null;
        let aLayerList = EAM.aLayerList;
        for (let pItem of aLayerList) {
            if (pItem.floor_id == pLayerId.trim()) {
                return pItem.id;
            }
        }
        return -1;
    }

    /// 获取房间数据Id根据房间Id。
    GetRoomDataIdByRoomId(pRoomId) {
        if (pRoomId == null)
            return null;
        let aRoomList = EAM.aRoomList;
        for (let pItem of aRoomList) {
            if (pItem.roomID == pRoomId.trim() && pItem.HyID == 0) {
                return pItem.id;
            }
        }
        return -1;
    }

    /* --▲ */
    //#endregion 数据Id-<-转-<-场景Id end

    //#region 场景Id-<-转-<-数据Id
    /* --▼ */

    /// 获取校区编号,根据数据Id。
    GetAreaIdByDataId(pDataId) {
        if (pDataId == null)
            return null;
        let Ident = 1;
        let aWorkList = EAM.aWorkList;
        for (let pItem of aWorkList) {
            if (pItem.id == pDataId && pItem.type == Ident) {
                return pItem.building_id;
            }
        }
        return -1;
    }

    /// 获取楼宇Id根据数据Id。
    GetBuildIdByDataId(pDataId) {
        if (pDataId == null)
            return null;
        let Ident = 2;
        let aWorkList = EAM.aWorkList;
        for (let pItem of aWorkList) {
            if (pItem.id == pDataId && pItem.type == Ident) {
                return pItem.building_id;
            }
        }
        return -1;
    }

    /// 获取楼层编号，根据数据Id。
    GetFloorIdByDataId(pDataId) {
        if (!pDataId)
            return null;
        let aLayerList = EAM.aLayerList;
        for (let pItem of aLayerList) {
            if (pItem.id == pDataId) {
                return pItem.id;
            }
        }
        return -1;
    }

    /// 获取楼层索引，根据数据Id。
    GetFloorIndexByDataId(pDataId) {
        if (!pDataId)
            return null;
        let aLayerList = EAM.aLayerList;
        for (let pItem of aLayerList) {
            if (pItem.id == pDataId) {
                return pItem.index;
            }
        }
        return -1;
    }

    /// 获取房间Id根据数据Id。
    GetRoomIdByDataId(pDataId) {
        if (pDataId == null)
            return null;
        let aRoomList = EAM.aRoomList;
        for (let pItem of aRoomList) {
            if (pItem.id == pDataId && pItem.HyID == 0) {
                return pItem.roomID;
            }
        }
        return -1;
    }

    /* --▲ */
    //#endregion 场景Id-<-转-<-数据Id end

    //#region 其他
    /* --▼ */

    /// 获取楼层编号，根据楼层索引。
    GetFloorIdByMiaoLayerIndex(nMiaoLayerIndex) {
        if (!EAM.pCurWork)
            return null;

        let pLayerId = null;
        let nLayerCount = MiaokitDC.DC.GetWork(MiaokitDC.DC.m_nCurWork).m_pALinerDC.m_pLayerMgr.GetLayersLenth();
        if (nMiaoLayerIndex >= nLayerCount)
            return null;
        pLayerId = MiaokitDC.DC.GetWork(MiaokitDC.DC.m_nCurWork).m_pEyejiaDC.m_pLayerMgr.GetLayer(nMiaoLayerIndex).name;
        return pLayerId;
    }

    /// 获取楼层索引，根据数据索引。
    GetMiaoLayerIndexByFloorIndex(nFloorIndex) {
        let nMiaoLayerIndex = null;
        let aFloorList = EAM.pCurWork.aLayerList;
        let pFloorItem = aFloorList[nFloorIndex];

        let nLayerCount = MiaokitDC.DC.GetWork(MiaokitDC.DC.m_nCurWork).m_pALinerDC.m_pLayerMgr.GetLayersLenth();
        for (let i = 0; i < nLayerCount; i++) {
            let pLayerId = MiaokitDC.DC.GetWork(MiaokitDC.DC.m_nCurWork).m_pEyejiaDC.m_pLayerMgr.GetLayer(i).name;
            if (pLayerId == pFloorItem.floor_id) {
                nMiaoLayerIndex = i;
                break;
            }
        }

        return nMiaoLayerIndex;
    }

    /* --▲ */
    //#endregion 其他 end

    /* -▲ */
    //#endregion 成员函数 end

    //#region 数据加载
    /* -▼ */

    /* -▲ */
    //#endregion 数据加载 end

}

/// 画布处理。
class EamCanvasHandle {
    constructor() {
        /// 菜单切换标识。
        this.m_nMenuActive = 0;
        /// 尺寸类型。
        this.m_nCanvasSizeType = 0;
        // 尺寸列表。
        this.m_aCanvasScaleList = [
            {
                // 正常
                mCanvasLeftWidth: {
                    Lenght: 92,
                    ScreenPercentage: 0.23125
                },
                mCanvasTopHeight: {
                    Lenght: 80,
                    ScreenPercentage: 0
                },
                pWidthScale: 0.70620,
                pHeightScale: 0.90721
            },
            {
                // 全屏
                mCanvasLeftWidth: {
                    Lenght: 0,
                    ScreenPercentage: 0
                },
                mCanvasTopHeight: {
                    Lenght: 0,
                    ScreenPercentage: 0
                },
                pWidthScale: 1,
                pHeightScale: 1
            },
            {
                // 小窗口
                mCanvasLeftWidth: {
                    Lenght: 92,
                    ScreenPercentage: 0.70052
                },
                mCanvasTopHeight: {
                    Lenght: 125,
                    ScreenPercentage: 0.26288
                },
                pWidthScale: 0.23281,
                pHeightScale: 0.24742
            },
            {
                // 告警管理
                mCanvasLeftWidth: {
                    Lenght: 92,
                    ScreenPercentage: 0.23125
                },
                mCanvasTopHeight: {
                    Lenght: 80,
                    ScreenPercentage: 0
                },
                pWidthScale: 0.70620,
                pHeightScale: 0.90721
            },
        ];
    }
    //#region -成员函数
    /* -▼ */

    /// 刷新画布尺寸设置。
    RefreshCanvasSize() {
        let pThis = EAM.m_pEamCanvasHandle;
        if (!Engine.g_pInstance) {
            return;
        }

        let nWidth = window.innerWidth;
        let nHeight = window.innerHeight;
        let nLeft = 0;
        let nTop = 0;

        let pContainer = $('#webgl_container');
        let pContainerParent = pContainer.parent();

        if (pContainerParent) {
            nWidth = pContainerParent.width() - 6;
            nHeight = pContainerParent.height() - 1;
            nLeft = pContainerParent.offset().left;
            nTop = pContainerParent.offset().top;
        }

        // 设值。
        Engine.g_pInstance.Resize(nWidth, nHeight);
        Engine.g_pInstance.m_nCanvasLeftOffset = nLeft;
        Engine.g_pInstance.m_nCanvasTopOffset = nTop;
        EAM.OnTransCanvasSize();
    }

    /// 切换右上角菜单显示状态。1.图层菜单 2.房间状态菜单
    SwitchMenuShowActive(nActive) {
        let pThis = EAM.m_pEamCanvasHandle;
        pThis.m_nMenuActive = nActive;
        EAM.m_pEamInfrasView.SwitchShowActive();
        EAM.m_pEamRoomStatusView.SwitchShowActive();
        EAM.m_pEamLayerListView.SwitchShowActive();
        EAM.m_pEamInteriorView.SwitchShowActive();
    }

    // 刷新右上角菜单显示状态。
    RefreshMenuShowActive() {
        EAM.m_pEamInfrasView.SwitchShowActive();
        EAM.m_pEamRoomStatusView.SwitchShowActive();
        EAM.m_pEamLayerListView.SwitchShowActive();
        EAM.m_pEamInteriorView.SwitchShowActive();
    }

    /* -▲ */
    //#endregion -成员函数 end

    //#region -数据加载
    /* -▼ */

    /* -▲ */
    //#endregion -数据加载 end
}

/// 接口加载队列。
class EamAPILoadQueue {
    constructor(pBack) {
        this.pThis = null;
        this.aQueue = [];
        this.pActionBack = null;
        if (pBack)
            this.pActionBack = pBack;
        this.pIng = false;
    }

    CheckQueue(pBack) {
        if (this.aQueue.length > 0) {
            this.pIng = true;
            let pItem = this.aQueue.shift();
            if (pItem.pData) {
                pItem.pAPI(pItem.pData, function (pData) {
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
            if (this.pActionBack)
                this.pActionBack();
        }
    };

    Add(pAPIAction, pData) {
        let pItem =
        {
            pAPI: pAPIAction,
            pFunc: null,
            pData: pData,
        };
        this.aQueue.push(pItem);
    }

    AddFunc(pAction) {
        if (this.aQueue.length <= 0)
            return;
        let pItem = this.aQueue[this.aQueue.length - 1];
        pItem.pFunc = pAction;
    }

    Start(pBack) {
        if (!this.pIng)
            this.CheckQueue(pBack);
    }

}