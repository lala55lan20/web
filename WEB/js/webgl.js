const treeData = [
    {
        title: 'Node1',
        value: '0-0',
        key: '0-0',
        children: [
            {
                title: 'Child Node1',
                value: '0-0-1',
                key: '0-0-1',
            },
            {
                title: 'Child Node2',
                value: '0-0-2',
                key: '0-0-2',
            },
        ],
    },
    {
        title: 'Node2',
        value: '0-1',
        key: '0-1',
    },
];

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

class Webgl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: null,
            isTwothree: false,
            isFloorbox: false,
            isSearch: false,
            value: undefined,

            startId: undefined,
            startName: undefined,
            endId: undefined,
            endName: undefined,
            path: 0,
            list: [],
        };
        this.changD = this.changD.bind(this);
        this.selectadd = this.selectadd.bind(this);
        this.showSearch = this.showSearch.bind(this);

        this.onChangeTop = this.onChangeTop.bind(this);
        this.onChangeStart = this.onChangeStart.bind(this);
        this.onChangeEnd = this.onChangeEnd.bind(this);
        this.searchGo = this.searchGo.bind(this);
        this.hideSearch = this.hideSearch.bind(this);
    }

    onChange = value => {
        console.log(value);
        this.setState({
            value: value,
        });
        // console.log({this:state.value});
        this.showSele(value);
    };

    showSele(value) {
        console.log(value);
    }

    selectadd() {
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

    changD() {
        // console.log("2/3D")
        // console.log( this.state)
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

    reset() {
        console.log("reset")
    }
    showSearch() {
        console.log(this.state.isSearch)
        this.setState({
            isSearch: true,
        })
    }

    hideSearch() {
        console.log(this.state.isSearch)
        this.setState({
            isSearch: false,
        })
    }

    onChangeTop = (value, id) => {
        console.log(value, id);
        this.setState({ endId: value, endName: id });
        this.showSearch();
    };

    onChangeStart = (value, id) => {
        console.log(value, id);
        this.setState({ startId: value, startName: id });
        //  console.log(this.state.value);
        //  console.log('startId', this.state.startId, 'startName',this.state.startName);
    };

    onChangeEnd = (value, id) => {
        console.log(value, id);
        this.setState({ endId: value, endName: id });
    };

    searchPath = (a) => {
        console.log(a);
        this.setState({
            path: a,
        })
    }

    searchGo() {
        console.log('start', this.state.startId, 'end', this.state.endId, 'path', this.state.path);
    }

    skey = (a) => {
        //  console.log(a);
        console.log(a.floorid, a.floorname);
    };

    render() {
        //  console.log(3333)
        return (
            <div className="webglEle" >
                <div className="index-serch">
                    <antd.TreeSelect
                        style={{ width: 300 }}
                        value={this.state.value}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        treeData={treeData}
                        placeholder="Please select"
                        treeDefaultExpandAll
                        onChange={this.onChangeTop}
                    />
                </div>

                Webgl {this.props.name}

                {this.state.isTwothree ?
                    <div className="two_d_btn r_btn" onClick={this.changD}>3D</div>
                    :
                    <div className="two_d_btn r_btn" onClick={this.changD}> 2D </div>
                }
                {this.state.isFloorbox ?
                    <div className="select-add r_btn2" onClick={this.selectadd}>返回室外</div>
                    :
                    <div className="select-add r_btn2" onClick={this.selectadd}>进入室内</div>
                }
                <div className="reset  r_btn2" onClick={this.reset}> 复位 </div>

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
                :null
                }

                <div className="search-btn">
                    <antd.Button type="primary" onClick={this.showSearch} block> 搜索 </antd.Button>
                </div>
                {this.state.isSearch ?
                    <div className="search_box" >
                        <div className="search_con_box">
                            <div className="start_input">
                                <antd.TreeSelect
                                    style={{ width: 300 }}
                                    value={this.state.startId}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    treeData={treeData}
                                    placeholder="选择起点"
                                    treeDefaultExpandAll
                                    onChange={this.onChangeStart}
                                    id={this.state.startName}
                                />
                            </div>
                            <div className="end_input">
                                <antd.TreeSelect
                                    style={{ width: 300 }}
                                    value={this.state.endId}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    treeData={treeData}
                                    placeholder="选择终点"
                                    treeDefaultExpandAll
                                    onChange={this.onChangeEnd}
                                    id={this.state.endName}
                                />
                            </div>
                        </div>
                        <ul className="search-path ">
                            <li className="path" onClick={this.searchPath.bind(this, 0)}>AAA</li>
                            <li className="path" onClick={this.searchPath.bind(this, 1)}>BBB</li>
                            <li className="path" onClick={this.searchPath.bind(this, 2)}>CCC</li>
                        </ul>
                        <div className="history-rollback-wrapper">
                            <ul className="search-path-floor">
                                <li>{this.state.startName}</li>
                                <li>{this.state.endName}</li>
                            </ul>
                        </div>
                        <div className="nav-bottom">
                            <antd.Button className="search_cancel search_sbtn" onClick={this.hideSearch}>取消</antd.Button>
                            <antd.Button type="primary" className="search-go search_sbtn" onClick={this.searchGo}>搜索</antd.Button>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}