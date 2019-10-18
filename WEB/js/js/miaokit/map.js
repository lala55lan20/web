/// 使部分浏览器下右键时不弹出提示框。
document.oncontextmenu = function () {
    event.returnValue = false;
}

function Test() {
    let mCoord = WorldToLonLat({
        x: 1,
        y: 0,
        z: 1
    });
    console.log("WorldToLonLat: ", mCoord.x.toFixed(6), mCoord.y.toFixed(6), mCoord.z.toFixed(6));

    window.addEventListener("keydown", function (e) {
        /// 设置摄像机视角
        if ("0" == e.key) {
            SetCamera({ x: 20.0, y: 0.0, z: 0.0 }, 60.0, 30.0, 150.0);
        }
        /// 2D/3D视图模式之间切换
        if ("1" == e.key) {
            SwitchView(MiaokitDC.DC.viewMode === ViewMode.View2D ? 3 : 2);
        }
        /// 叠加楼层
        if ("2" == e.key) {
            StackUp(!ALinerDC.g_bStackUp);
        }
        /// 切换到楼宇
        if ("3" == e.key) {
            SwitchScene(GLOBAL.pWorkList[0].building_name);
        }
        /// 切换到外景
        if ("4" == e.key) {
            SwitchScene(null);
        }
        /// 切换楼层
        if ("5" == e.key) {
            if (GLOBAL.pCurBuilding) {
                let pLayerList = GLOBAL.pCurBuilding.layerList;
                SwitchLayer(pLayerList[pLayerList.length - 1].floor_name);
            }
        }
        /// 切换摄像机锁定
        if ("6" == e.key) {
            LockCameraToPath(!NNavigation.g_bLockPath);
        }
        /// 暂停SDK运行
        if ("7" == e.key) {
            Stop();
        }
        /// 开始SDK运行
        if ("8" == e.key) {
            Start();
        }
        /// 以R-L110为测试起点，导航到当前设置的终点
        if ("9" == e.key) {
            Navigate("YQ162", "YQ442", 0);
        }
    });
}

/// Miaokit入口。
function InitMiaokit(pMiaokitInfo) {
    /// 初始化SDK 
    Init({
        pProjectIdent: pMiaokitInfo.projectIdent,// 项目标识。(如果没有则填空)
        pHost: pMiaokitInfo.host, // 后台服务地址
        pLanguage: "zh-cn", // 语言类型
        bTestPOIMode: pMiaokitInfo.testPOIMode,// 是否显示 未录入数据 的 节点浮标。
        nCompassBias: 130.0, // 地图正方向相对与北方逆时针旋转度数
        mCoord: {// 中心点经纬度坐标
            long: 0,
            lat: 0
        },
        nWidth: window.innerWidth, // 初始画布宽度
        nHeight: window.innerHeight, // 初始画布高度
        mBackground: {// 背景颜色。
            r: 0.09,//0.09
            g:0.13,//0.13
            b: 0.23//0.23
        },
        pOutModel: {
            HasOutModel: false, // 是否包含定制的室外模型
            OutModelPath: "./Model/", // 定制的室外模型路径
            OutModelCount: 7, // 室外模型数量
            OutModelStartJPG: 1, // 室外模型JPG贴图起始索引
            OutModelStartPNG: 6, // 室外模型数量PNG贴图起始索引
        }
    }, function (pError) {
        if (pError) {
            console.error("初始化失败：", pError);
        } else {
            console.info("初始化成功");

            /// 注册窗口缩放响应事件
            window.addEventListener('resize', () => {
                if (IsProject("")) {
                    Resize(window.innerWidth, window.innerHeight);
                }
                if (IsProject("EAM")) {
                    EAM.Resize();
                }
            }, false);

            if (IsProject("")) {
                Start();
                Test();
            }
            if (IsProject("EAM")) {
                EAM.Start();
                //EAM.Test();
            }
        }
    });
}

/// 3D入口
function Init3D() {
    let m_pConfig3dFileLoaclPath = "./Model/config3d.txt";// config3d.txt的地址
    /// 初始化config3d。
    InitConfig3d(m_pConfig3dFileLoaclPath, function () {
        let pProjecBaotInfo = g_pConfig3d.m_pProjectBaoInfo;
        /// 初始化project包。
        InitProjectLoad(pProjecBaotInfo, function () {
            let pMiaokitInfo = g_pConfig3d.m_pMiaokitInfo;
            /// 初始化miaokit。
            InitMiaokit(pMiaokitInfo);
        });
    });
}

Init3D();

