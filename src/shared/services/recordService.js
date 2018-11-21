import fireStore from './../fireStore';

const recordsCollection = fireStore.collection('records');

export default class recordService {

    static recordGame(record) {
        const currentTime = getTime();
        record.createAt = currentTime;
        return recordsCollection.doc(`${currentTime}:${record.gameResult[0].name}`).set(record);
    }

    static fetchGameRecord() {
        return recordsCollection.get();
    }
}
