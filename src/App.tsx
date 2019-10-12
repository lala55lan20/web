import * as React from 'react';
import './App.css';

import { Layout } from 'antd';

import Home from './page'

const { Content } = Layout;


 



// import logo from './logo.svg';
class App extends React.Component {
  public render() {
    return (
      // <div className="App">
      //   <header className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <h1 className="App-title">Welcome to React</h1>
      //   </header>
      //   <p className="App-intro">
      //     To get started, edit <code>src/App.tsx</code> and save to reload.
      //   </p>
      // </div>

      <div>
        <Layout className="layout">
          <Content  >
            <div style={{ background: '#fff', minHeight: '100vh', border: '0px solid red' }}>
              <Home />
            </div>
          </Content>
        </Layout>
      </div>

      // <Router>
      //   <DataR data={this.state.data} />
      //   <Demo1  >
      //     <Route path="/home/tabble" component={Tabble} />
      //     <Route path="/home/form" component={Form}
      //       date={this.state}
      //       callback={this.callback}
      //     />
      //   </Demo1>
      // </Router>
    );
  }
}

export default App;
