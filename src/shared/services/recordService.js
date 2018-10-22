import fireStore from './../fireStore';

const recordsCollection = fireStore.collection('records');

export default class recordService {

    static recordGame(record){
        return recordsCollection.add(record);
    }

    static fetchGameRecord() {
        return recordsCollection.get();
    }
}
