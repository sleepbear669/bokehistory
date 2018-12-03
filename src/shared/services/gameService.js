import fireStore from './../fireStore';

const gamesCollection = fireStore.collection('games');

export default class gameService {

    static addGame(name) {
        return gamesCollection.doc(name).set({name, createdAt: getTime()});
    }

    static fetchGames(callback = () => {
    }) {
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
}
