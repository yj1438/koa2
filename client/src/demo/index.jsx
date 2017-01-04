import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Index extends Component {
    render() {
        return (
            <div>
                this is a test page.
            </div>
        );
    }
}

//向页面中渲染
ReactDOM.render(Index, document.getElementById('app'));
