import fireStore, {storage} from './../fireStore';

const gamesCollection = fireStore.collection('games');
const storageRef = storage.ref();
export default class gameService {

    static async addGame(gameInfo, thumbnail) {
        const extension = thumbnail.name.split('.').pop();
        const snapshot = await storageRef.child(`${gameInfo.originalName}.${extension}`).put(thumbnail);
        const url = await snapshot.ref.getDownloadURL();
        gamesCollection.doc(gameInfo.originalName).set({...gameInfo, thumbnail: url, createdAt: getTime()});
    }

    static fetchGames(callback = () => {}) {
        return gamesCollection.onSnapshot((snapshot) => {
            callback(snapshot.docs.map(doc => doc.data()));
        });
    }

    static recordGame(record) {
        const currentTime = getTime();
        record.createAt = currentTime;
        return gamesCollection.doc(record.game).collection('records')
            .doc(`${currentTime}:${record.gameResult[0].name}`).set(record);
    }

    static fetchGameByName(name) {
        return gamesCollection.doc(name).get();
    }

    static fetchRecordByGame(name) {
        return gamesCollection.doc(name).collection('records').get()
            .then(snapshot => snapshot.docs.map(doc => doc.data()));
    }
}
