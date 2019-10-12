
import * as React from 'react';


// import { BrowserRouter } from 'react-router-dom';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Intro from '../page/intro'

import Webgl from '../page/webgl'


import { Link } from 'react-router-dom'

import './index.css'

class Pagebutton extends React.Component {



    public render() {
        return (
            <div >
                <Router  >
                    
                        <Route path="/" component={Webgl} exact={true} />
                        <Route path="/Webgl " component={Webgl} />
                        <Route path="/Intro" component={Intro} />
                   
                    <div className="bottomBox">
                        <ul className="ui">
                            <li> 1 </li>
                            <li >
                                <Link to="/Intro">Intro</Link>
                            </li>
                            <li >
                                <Link to="/Webgl ">导航</Link>
                            </li>
                            <li> 4 </li>
                            <li> 5 </li>
                        </ul>
                    </div>
                </Router>

            </div>
        );
    }
}

export default Pagebutton;