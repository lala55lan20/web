import * as React from 'react';

import './webgl.css'

// import {List } from 'antd';

import { TreeSelect } from 'antd';

const list = [
    {
        floorid: 1,
        floorname: "1F",
    },
    {
        floorid: 2,
        floorname: "2F",
    },
    {
        floorid: 3,
        floorname: "3F",
    }
];



const treeData = [
    {
        children: [
            {
                key: 'tk0-0-1',
                title: 'Child Node1',
                value: 'tv0-0-1',

            },
            {
                key: 'tk0-0-2',
                title: 'Child Node2',
                value: 'tv0-0-2',

            },
        ],
        key: 'tk0-0',
        title: 'Node1',
        value: 'tv0-0',
    },
    {
        key: 'tk0-1',
        title: 'Node2',
        value: 'tv0-1',
    },
];

const sheshiData = [
    {
        children: [
            {
                key: 'sk0-0-1',
                title: 'Child sheshi1',
                value: 'sv0-0-1',
            },
            {
                key: 'sk0-0-2',
                title: 'Child sheshi2',
                value: 'sv0-0-2',

            },
        ],
        key: 'sk0-0',
        title: 'sheshi1',
        value: 'sv0-0',
    },
    {
        key: 'sk0-1',
        title: 'sheshi2',
        value: 'sv0-1',
    },
];


class Webglall extends React.Component {



    public state = {
        date: '原data',
        endId: undefined,
        endName: undefined,

        isFloorbox: false,

        isShowSearchbox: false,
        isShowSheshi: false,
        isTwothree: false,
        key: undefined,
        list: [],
        path: 0,
        startId: undefined,
        startName: undefined,

        value: undefined,

    };

    constructor(props: any) {
        super(props);

    };

    public changD = () => {
        console.log("2/3D")
        if (!this.state.isTwothree) {
            this.setState({
                isTwothree: true,
            })
        } else {
            this.setState({
                isTwothree: false,
            })
        }
    }

    public reset = () => {
        console.log("reset")
    }

    public showSearch = () => {
        this.setState({
            isShowSearchbox: true,
        });
        this.hideSheshi();
    }

    public hideSearch = () => {
        this.setState({
            end: '点此选择终点',
            isShowSearchbox: false,
            start: '点此选择起点',
        })
    }

    public showSheshi = () => {
        this.setState({
            isShowSheshi: true,
        });
        this.hideSearch();
    }

    public hideSheshi = () => {
        this.setState({
            end: '点此选择终点',
            isShowSheshi: false,
            start: '点此选择起点',
        })
    }

    public onChangeTop = (value: any, id: any) => {
        //  console.log(value, id);
        this.setState({ endId: value, endName: id });
        this.showSearch();
    };

    public onChangeStart = (value: any, id: any) => {
        console.log(value, id);
        this.setState({ startId: value, startName: id });
        //  console.log(this.state.value);
        //  console.log('startId', this.state.startId, 'startName',this.state.startName);
    };

    public onChangeEnd = (value: any, id: any) => {
        //  console.log(value, id);
        this.setState({ endId: value, endName: id });
    };

    public onChangeSheshi = (value: any, id: any) => {
        console.log(value, id);
        this.setState({ startId: value, startName: id });
        this.showSearch();
    };

    public selectadd = () => {
        // console.log( this.state.isFloorbox);
        if (!this.state.isFloorbox) {
            this.setState({
                isFloorbox: true,
            })
        } else {
            this.setState({
                isFloorbox: false,
            })
        }
    };

    public skey = (a: any) => {
        //  console.log(a);
        console.log(a.floorid, a.floorname);
    };

    public searchPath = (a: any, b: any) => {
        console.log(a);
        this.setState({
            path: a,
        })
    }

    
    public search = () => {
        console.log('start', this.state.startId, 'end', this.state.endId, 'path',this.state.path);
    };

    public render() {
        return (
            <div className="map-box">
                <div className='canvas'>
                    <canvas />
                </div>

                <div className="context">
                    <div className="sometime">
                        {this.state.isShowSearchbox ?
                            <div className="search-box">
                                <div>
                                    <TreeSelect
                                        style={{ width: 300 }}
                                        value={this.state.startId}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                        treeData={treeData}
                                        placeholder="点此选择起点"
                                        treeDefaultExpandAll={true}
                                        key={this.state.key}
                                        onChange={this.onChangeStart}
                                        id={this.state.startName}
                                    />
                                    <TreeSelect
                                        style={{ width: 300 }}
                                        value={this.state.endId}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                        treeData={treeData}
                                        placeholder="点此选择终点"
                                        treeDefaultExpandAll={true}
                                        onChange={this.onChangeEnd}
                                        id={this.state.endName}
                                    />
                                </div>
                                <div>
                                    <ul className="search-path">
                                        <li onClick={this.searchPath.bind(this, 0)}>推荐路线</li>
                                        <li onClick={this.searchPath.bind(this, 1)}>优先楼梯</li>
                                        <li onClick={this.searchPath.bind(this, 2)}>优先电梯</li>
                                    </ul>
                                </div>
                                <div className="history-rollback-wrapper">
                                    <ul className="search-path-floor">
                                        <li>{this.state.startName}</li>
                                        <li>{this.state.endName}</li>
                                    </ul>
                                </div>
                                <div className="nav-bottom">
                                    <input className="search-go" type="button" value="搜索" onClick={this.search} />
                                    <div className="search-clock" onClick={this.hideSearch} > 取消</div>
                                </div>
                            </div>
                            : null
                        }
                        {this.state.isShowSheshi ?
                            <div className="sheshiBox">
                                <TreeSelect
                                    style={{ width: 300 }}
                                    value={this.state.startId}

                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    treeData={sheshiData}
                                    placeholder="点此选择起点"
                                    treeDefaultExpandAll={true}
                                    onChange={this.onChangeSheshi}
                                    id={this.state.startName}
                                />
                                <div className="sheshi-clock" onClick={this.hideSheshi} > 取消</div>
                            </div>
                            : null
                        }
                    </div>

                    <div className="alltime">
                        <div>
                            <TreeSelect
                                style={{ width: 300 }}
                                value={this.state.endId}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={treeData}
                                placeholder="点此选择终点"
                                treeDefaultExpandAll={true}
                                onChange={this.onChangeTop}
                                id={this.state.endName}
                            />
                        </div>
                        {this.state.isFloorbox ?
                            <div className="select-add" onClick={this.selectadd}>返回室外</div>
                            :
                            <div className="select-add" onClick={this.selectadd}>进入室内</div>
                        }
                        {this.state.isTwothree ?
                            <div className="two_d_btn" onClick={this.changD}>3D</div>
                            :
                            <div className="two_d_btn" onClick={this.changD}> 2D </div>
                        }


                        <div className="reset" onClick={this.reset}> 复位 </div>
                        {this.state.isFloorbox ?
                            <div className="floor_box">
                                <ul className="uiF">
                                    {list.map((i, index) => {
                                        return (
                                            <li key={i.floorid} onClick={this.skey.bind(this, i)}>
                                                {i.floorname}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                            : null
                        }
                        <div className="search-btn" onClick={this.showSearch} > 搜索</div>
                        {/* <div className="sheshi-btn" onClick={this.showSheshi} > 设施</div> */}
                    </div>
                </div>

            </div>
        );
    }
}

export default Webglall;


