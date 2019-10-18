let test3DIndex = 0;
let COMMUBrowserIns = {

    // 等待被web调用的函数。(cl:对接处理状态0未处理 1处理中 2成功 3特殊情况，标明原因)

    /// 1.3D加载指定校区 cl:1
    m_p3DJumpArea: function (pDataId) {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        let pEamIdTrans = EAM.m_pEamIdTrans;
        if (pDataId == 0) {
            EAM.SwitchSceneByBuildId(pDataId);
            return;
        }
        let pBuilId = pEamIdTrans.GetAreaIdByDataId(pDataId);
        EAM.SwitchSceneByBuildId(pBuilId);
    },
    /// 2.改变3D画布宽高时 cl:0 (0正常，1全屏，2小窗口,3告警管理)
    m_p3DTransCanvasSize: function (nType) {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        let pEamCanvasHandle = EAM.m_pEamCanvasHandle;
        pEamCanvasHandle.m_nCanvasSizeType = nType;
        pEamCanvasHandle.RefreshCanvasSize();
    },
    /// 3.通知3Dx需要跳转到指定地点 函数({areaId:"一期大楼" , buildId:null , floorId:null , roomId:null}) cl:1
    m_p3DJumpGoto: function (pJumpInfo) {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        JumpGoto(pJumpInfo);
    },
    /// 4. 通知3D窗口尺寸改变。 cl:0
    /// 5. 通知3D全景窗口已经关闭。 cl:0
    m_p3D720WindowClose: function () {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        EAM.OnClosePanorama();
    },
    /// 6. 通知3D切换视图模式。 cl:0
    m_p3DSwitchView: function (nViewMode) {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        EAM.SwitchView(nViewMode);
    },
    /// 7. 通知3D查看房间详情。 cl:0
    m_p3DLookRoomInfo: function (pDataId) {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        let pEamIdTrans = EAM.m_pEamIdTrans;
        let pRoomId = pEamIdTrans.GetRoomIdByDataId(pDataId);
        ShowRoomBillboard(pRoomId);
    },
    /// 8. 刷新楼层状态。 cl:0
    m_p3DRefreshRoomStatus: function () {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        let pEamRoomStatusMode = EAM.m_pEamRoomStatusMode;
        let pEamRoomBoard = EAM.m_pEamRoomBoard;
        pEamRoomStatusMode.UpdataInfo();

        // 主动关闭房间弹窗。
        pEamRoomBoard.CloseEntry();
    },
    /// 9. 3D地图是否加载完毕。
    m_p3DMapIfLoadEnd: function () {
        if (!EAM)
            return;
        if (!EAM.m_bLoadEndWork3d)
            return;
        return EAM.m_nLoadCheckSize == 0 ? true : false;
    },

    // 调用web的函数。(cl:对接处理状态0未处理 1处理中 2成功 3特殊情况，标明原因)

    /// 1.通知web当前打开的楼宇。cl:2(废弃)
    m_pOpenBuild: function (Id) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        intoBuild(Id);
    },
    /// 2.通知web安排用房。cl:2
    m_pUseRoom: function (pId) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        indexApp.showUserm(pId);
    },
    /// 3.通知web安排退房。cl:2
    m_pBackRoom: function (pId) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        indexApp.showOutrm(pId);
    },
    /// 4.通知web全景图更新。cl:1
    m_pUpdata720Info: function (pPanoramaInfo) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        getSevenxy(pPanoramaInfo);
    },
    /// 5.通知web点击房间使用状态按钮。cl:2
    m_pClickRoomUseStateBtn: function () {
        if (!EAM.m_bLoadEndWork3d)
            return;
        indexApp.showRoomstatecolor();
    },
    /// 6.通知web应该关闭全景图。cl:0
    m_pClosePanoramaPanel: function () {
        if (!EAM.m_bLoadEndWork3d)
            return;
        closeSeven();
    },
    /// 7.通知web获取房间详情。cl:2
    m_pGetRoomInfoById: function (pDataId, pBackRoomInfo) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        getRoomId(pDataId, pBackRoomInfo);
    },
    /// 8.通知web显示房间详情的更多信息。cl:2
    m_pShowMoreInfo: function (pDataId) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        indexApp.showDetailrm(pDataId);
    },
    /// 9.通知web获取当前楼宇所有楼层下的房间状态信息。cl:0
    m_pGetRoomStatus: function (pDataId, pBackRoomStatusInfo) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        intoduildColor(pDataId, pBackRoomStatusInfo);
    },
    /// 10.通知web，3D部分所有东西已加载完毕。
    m_pLoadAll3DEnd: function () {
        if (!EAM.m_bLoadEndWork3d)
            return;
        loadedModel();
    },
    /// 11.通知web当前打开的场景(类型,id)
    m_pOpenWork: function (pType, pDataId) {
        if (!EAM.m_bLoadEndWork3d)
            return;
        switch (pType) {
            case 0:
                //    console.error("打开地球，id是=>" + pDataId);
                break;
            case 1:
                //    console.error("打开校区，id是=>" + pDataId);
                break;
            case 2:
                //    console.error("打开楼宇，id是=>" + pDataId);
                break;
        }

        resultSchoollist(pType, pDataId);
    },
}

function JumpGoto(pJumpInfo) {
    console.log("校区=>" + pJumpInfo.areaId + " 大楼=>" + pJumpInfo.buildId + " 楼层=>" + pJumpInfo.floorId + " 房间=>" + pJumpInfo.roomId);

    // return;

    let pEamIdTrans = EAM.m_pEamIdTrans;
    let pWorkId = -1;
    if (pJumpInfo.buildId) {
        let pBuildId = pEamIdTrans.GetBuildIdByDataId(pJumpInfo.buildId);
        if (pBuildId != null && pBuildId != -1)
            pWorkId = pBuildId;
    } else if (pJumpInfo.areaId) {
        let pAreaId = pEamIdTrans.GetAreaIdByDataId(pJumpInfo.areaId);
        if (pAreaId != null && pAreaId != -1)
            pWorkId = pAreaId;
    } else {
        return;
    }

    if (pWorkId == null || pWorkId == -1)
        return;

    // 开始跳转场景,有层就不管,没层就叠加
    if (pJumpInfo.floorId) {
        EAM.SwitchSceneByBuildId(pWorkId.trim());
        // if (ALinerDC.g_bStackUp)
        //     StackUp(false);
    } else {
        EAM.SwitchSceneByBuildId(pWorkId.trim());
        if (!ALinerDC.g_bStackUp)
            EAM.StackUp(true);
    }

    // 跳楼层。
    let pFloorDataId = pJumpInfo.floorId;
    if (!pFloorDataId)
        return;
    let nFloorIndex = pEamIdTrans.GetFloorIndexByDataId(pFloorDataId);
    if (nFloorIndex == null || nFloorIndex == -1)
        return;
    // 拿到索引，条件跳转。
    let nFloorCount = EAM.pCurWork.aLayerList.length;
    if (nFloorIndex >= nFloorCount)
        return;

    EAM.SwitchLayerByFloorIndex(nFloorIndex);

    // 跳房间。
    if (!pJumpInfo.roomId)
        return;
    let pDataId = pJumpInfo.roomId;
    let RoomId = pEamIdTrans.GetRoomIdByDataId(pDataId);
    ShowRoomBillboard(RoomId);
    if (EAM.m_pEamPOIBoard.m_pCheckSite) {
        let pTarget = { x: EAM.m_pEamPOIBoard.m_pCheckSite.V3Pos.x, y: EAM.m_pEamPOIBoard.m_pCheckSite.V3Pos.y, z: -EAM.m_pEamPOIBoard.m_pCheckSite.V3Pos.z };
        EAM.SetCamera(pTarget, undefined, undefined, 70);
    }

}

function ShowRoomBillboard(pRoomId) {
    if (pRoomId == null || pRoomId == -1)
        return;
    EAM.m_pEamPOIBoard.m_pCheckSite = null;
    EAM.m_pEamRoomBoard.m_bShowActive = false;
    let lLandmarkList = NavChartDC.DC.m_pLayerMgr.m_pActiveLayer.m_mLandmarkList;
    for (let pLandmarkItem of lLandmarkList) {
        if (EAM.m_pEamPOIBoard.m_pCheckSite == null) {
            if (pLandmarkItem.m_pSerial == pRoomId) {
                EAM.m_pEamPOIBoard.m_pCheckSite = {
                    Id: pLandmarkItem.m_pSerial,
                    Name: pLandmarkItem.m_pName,
                    Position: pLandmarkItem.m_mPoint.Object.m_mPosition,
                    Image: null,
                    Type: 0,
                    V3Pos: pLandmarkItem.m_mPoint.Object.m_mPosition
                };
            }
        }
    }
}

function ShowBuildBillboard(pBuildId) {
    if (pBuildId == null || pBuildId == -1)
        return;
    EAM.m_pEamPOIBoard.m_pCheckSite = null;
    EAM.m_pEamBuildBoard.m_bShowActive = false;
    let lLandmarkList = EyejiaDC.DC.m_pLayerMgr.m_pActiveLayer.m_aBuilding;
    for (let pLandmarkItem of lLandmarkList) {
        if (EAM.m_pEamPOIBoard.m_pCheckSite == null) {
            if (pLandmarkItem.Name == pBuildId) {
                EAM.m_pEamPOIBoard.m_pCheckSite = {
                    Id: pLandmarkItem.Name,
                    Name: pLandmarkItem.Name,
                    Position: pLandmarkItem.Position,
                    Image: null,
                    Type: -1,
                    V3Pos: pLandmarkItem.m_mPoint.Object.m_mPosition
                };
            }
        }
    }
}