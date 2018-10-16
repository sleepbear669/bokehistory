import fireStore from './../fireStore';

const usersCollection = fireStore.collection('users');

export default class userService {

    static addUser(name) {
        return usersCollection.doc(name).set({name, createdAt: new Date()});
    }

    static fetchUserByName(name) {
        return usersCollection.doc(name).get();
    }
}
