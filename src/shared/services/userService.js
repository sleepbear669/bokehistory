import fireStore from './../fireStore';

const usersCollection = fireStore.collection('users');
const batch = fireStore.batch();

export default class userService {

    static addUser(name) {
        return usersCollection.doc(name).set({name, createdAt: getTime()});
    }

    static fetchUser() {
        return usersCollection.get()
            .then(snapshot => snapshot.docs.map(doc => doc.data()));
    }

    static fetchUserByName(name) {
        return usersCollection.doc(name).get();
    }

    static recordGame(record) {
        const currentTime = getTime();
        record.createAt = currentTime;

        const gameResult = record.gameResult;
        gameResult.map(r => {
            const ref = usersCollection.doc(r.name).collection('records')
                .doc(`${currentTime}:${record.game}`);
            batch.set(ref, record)
        });
        return batch.commit();
    }

}
