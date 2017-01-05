import { observable, computed } from 'mobx';

class DataStore {

    @observable title = 'TITLE';

    @observable list = [];

    @computed get listCount() {
        return this.list.length;
    }

    inputTitle(title) {
        this.title = title;
    }

    add(data) {
        this.list.push(data);
    }

}

export default DataStore;
