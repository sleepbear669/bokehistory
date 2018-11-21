import fireStore from './../fireStore';

const usersCollection = fireStore.collection('users');
const batch = fireStore.batch();

export default class userService {

    static addUser(name) {
        return usersCollection.doc(name).set({name, createdAt: getTime()});
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
                .doc(`${currentTime}:${record.gameResult[0].name}`);
            batch.set(ref, record)
        });
        return batch.commit();
    }

}
