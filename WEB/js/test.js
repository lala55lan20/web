class Hello extends React.Component {

    // constructor(props) {
    //     super(props);
    //     this.state = {opacity: 1.0};
    // }

    // componentDidMount() {
    //   this.timer = setInterval(function () {
    //     var opacity = this.state.opacity;
    //     opacity -= .05;
    //     if (opacity < 0.1) {
    //       opacity = 1.0;
    //     }
    //     this.setState({
    //       opacity: opacity
    //     });
    //   }.bind(this), 100);
    // }

    // render () {
    //   return (
    //     <div style={{opacity: this.state.opacity}}>
    //       Hello {this.props.name}
    //     </div>
    //   );
    // }


    render() {
        return (
            <div style={{ background: '#fff', height: '100vh', border: '0px solid red' }}>
                 <Webgl />
                <Content />
               
            </div>
        );
    }

}



class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: " ",
            isShowSheshi: 1,
        };
        this.threeC = this.threeC.bind(this);
        this.twoC = this.twoC.bind(this);
        this.webglC = this.webglC.bind(this);
    }

    handleLoginClick() {
        this.setState({ isLoggedIn: true });
    }

    handleLogoutClick() {
        this.setState({ isLoggedIn: false });
    }

    threeC() {
        console.log('one');
        this.setState({
            name: "oooo",
            isShowSheshi: 3,
        });
        console.log(this.state);
    }
    twoC() {
        console.log('twoC');
        this.setState({
            name: "tttt",
            isShowSheshi: 2,
        });
        console.log(this.state.isShowSheshi);
    }
    webglC() {
        console.log('threeC');
        this.setState({
            name: "tttt",
            isShowSheshi: 1,
        });
        console.log(this.state.isShowSheshi);
    }

    webglSearch(){
      console.log('webglSearch')
    }

    render() {
        const isShowSheshi = this.state.isShowSheshi;
        console.log("state", isShowSheshi);

        if (isShowSheshi === 1) {
            return (
                <div className="Content">
                    <div className="btm">
                        <ul className="ctnEle">
                            <li onClick={this.threeC}>threeC</li>
                            <li onClick={this.webglSearch}>webglSearch</li>
                            <li onClick={this.twoC}>two</li>
                        </ul>
                    </div>
                </div>
            )
        } else if (isShowSheshi === 2) {
            return (
                <div className="Content">
                    <div className="btm">
                    <ul className="ctnEle">
                            <li onClick={this.threeC}>threeC</li>
                            <li onClick={this.webglC}>webglC</li>
                            <li onClick={this.twoC}>two</li>
                        </ul>
                    </div>
                    <Two name={this.state.name} />
                </div>
            )
        } else if (isShowSheshi === 3) {
            return (
                <div className="Content">
                    <div className="btm">
                    <ul className="ctnEle">
                            <li onClick={this.threeC}>threeC</li>
                            <li onClick={this.webglC}>webglC</li>
                            <li onClick={this.twoC}>two</li>
                        </ul>
                    </div>
                     <Three name={this.state.name} />
                </div>
            )
        }
    }
}



class Three extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="ctn" >
                Three{this.props.name}
            </div>
        );
    }
}

class Two extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="ctn" >
                Two{this.props.name}
            </div>
        );
    }
}


class TabBarExample extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        selectedTab: 'redTab',
        hidden: false,
        fullScreen: true,
      };
    }
  
    renderContent(pageText) {
      return (
        <div style={{ backgroundColor: 'white', height: '100%', textAlign: 'center' }}>
          <div style={{ paddingTop: 60 }}>Clicked “{pageText}” tab， show “{pageText}” information</div>
        </div>
      );
    }
  
    render() {
      return (
        <div style={this.state.fullScreen ? { position: 'fixed', height: '100%', width: '100%', top: 0 } : { height: '100%' }}>
          <m.TabBar
            unselectedTintColor="#949494"
            tintColor="#33A3F4"
            barTintColor="white"
            hidden={this.state.hidden}
          >
            <m.TabBar.Item
              title="Life"
              key="Life"
              icon={<div style={{
                width: '22px',
                height: '22px',
                background: 'url(https://zos.alipayobjects.com/rmsportal/sifuoDUQdAFKAVcFGROC.svg) center center /  21px 21px no-repeat' }}
              />
              }
              selectedIcon={<div style={{
                width: '22px',
                height: '22px',
                background: 'url(https://zos.alipayobjects.com/rmsportal/iSrlOTqrKddqbOmlvUfq.svg) center center /  21px 21px no-repeat' }}
              />
              }
              selected={this.state.selectedTab === 'blueTab'}
              badge={1}
              onPress={() => {
                this.setState({
                  selectedTab: 'blueTab',
                });
              }}
              data-seed="logId"
            >
              {this.renderContent('Life')}
            </m.TabBar.Item>
            <m.TabBar.Item
              icon={
                <div style={{
                  width: '22px',
                  height: '22px',
                  background: 'url(https://gw.alipayobjects.com/zos/rmsportal/BTSsmHkPsQSPTktcXyTV.svg) center center /  21px 21px no-repeat' }}
                />
              }
              selectedIcon={
                <div style={{
                  width: '22px',
                  height: '22px',
                  background: 'url(https://gw.alipayobjects.com/zos/rmsportal/ekLecvKBnRazVLXbWOnE.svg) center center /  21px 21px no-repeat' }}
                />
              }
              title="Koubei"
              key="Koubei"
              badge={'new'}
              selected={this.state.selectedTab === 'redTab'}
              onPress={() => {
                this.setState({
                  selectedTab: 'redTab',
                });
              }}
              data-seed="logId1"
            >
              {this.renderContent('Koubei')}
            </m.TabBar.Item>
            <m.TabBar.Item
              icon={
                <div style={{
                  width: '22px',
                  height: '22px',
                  background: 'url(https://zos.alipayobjects.com/rmsportal/psUFoAMjkCcjqtUCNPxB.svg) center center /  21px 21px no-repeat' }}
                />
              }
              selectedIcon={
                <div style={{
                  width: '22px',
                  height: '22px',
                  background: 'url(https://zos.alipayobjects.com/rmsportal/IIRLrXXrFAhXVdhMWgUI.svg) center center /  21px 21px no-repeat' }}
                />
              }
              title="Friend"
              key="Friend"
              dot
              selected={this.state.selectedTab === 'greenTab'}
              onPress={() => {
                this.setState({
                  selectedTab: 'greenTab',
                });
              }}
            >
              {this.renderContent('Friend')}
            </m.TabBar.Item>
            <m.TabBar.Item
              icon={{ uri: 'https://zos.alipayobjects.com/rmsportal/asJMfBrNqpMMlVpeInPQ.svg' }}
              selectedIcon={{ uri: 'https://zos.alipayobjects.com/rmsportal/gjpzzcrPMkhfEqgbYvmN.svg' }}
              title="My"
              key="my"
              selected={this.state.selectedTab === 'yellowTab'}
              onPress={() => {
                this.setState({
                  selectedTab: 'yellowTab',
                });
              }}
            >
              {this.renderContent('My')}
            </m.TabBar.Item>
          </m.TabBar>
        </div>
      );
    }
  }