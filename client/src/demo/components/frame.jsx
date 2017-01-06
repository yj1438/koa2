import React, { Component } from 'react';
import { observer } from 'mobx-react';

import DataStore from '../stores/dataStore';

@observer
class Frame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: new DataStore(),
        };
    }

    render() {
        return (
            <div className="wrap">
                <header>
                    this is frame title haha : {this.state.data.title}
                </header>
                {this.props.children}
            </div>
        );
    }
}

export default Frame;
