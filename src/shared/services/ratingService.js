import fireStore from './../fireStore';

const ratingCollection = fireStore.collection('rating');
export default class gameService {

    static fetchRating(gameName) {
        return ratingCollection.doc(gameName).get().then(doc => doc.data());
    };

    static updateClan(gameName, clans) {
        return ratingCollection.doc(gameName).update({clans})
    }
}
