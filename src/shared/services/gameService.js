import fireStore from './../fireStore';

const gamesCollection = fireStore.collection('games');

export default class gameService {

    static addUser(name) {
        return gamesCollection.doc(name).set({name, createdAt: new Date()});
    }

    static fetchUserByName(name) {
        return gamesCollection.doc(name).get();
    }
}
