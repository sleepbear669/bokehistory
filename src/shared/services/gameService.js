import fireStore from './../fireStore';

const gamesCollection = fireStore.collection('games');

export default class gameService {

    static addUser(name) {
        return gamesCollection.doc(name).set({name, createdAt: new Date()});
    }

    static fetchGames(callback) {
        return gamesCollection.onSnapshot((snapshot) => {
            callback(snapshot.docs.map(doc => doc.data()));
        });
    }

    static fetchGameByName(name) {
        return gamesCollection.doc(name).get();
    }
}
