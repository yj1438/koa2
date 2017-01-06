import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Router, IndexRoute, browserHistory } from 'react-router';

import Frame from './components/frame';
import Index from './components/index';
import Error from './components/error';

const routers = (
    <Router history={browserHistory}>
        <Route path="/(:base)/demo" component={Frame}>
            <IndexRoute component={Index} />
            <Route path="index" component={Index} />
        </Route>
        <Route path="*" component={Error} />
    </Router>
);

//向页面中渲染
ReactDOM.render(routers, document.getElementById('app'));
