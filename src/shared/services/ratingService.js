import fireStore from './../fireStore';

const ratingCollection = fireStore.collection('rating');
export default class gameService {

    static fetchRating(gameName) {
        return ratingCollection.doc(gameName).get().then(doc => doc.data());
    };

    static updateRating(gameName, ratingResult) {
        return ratingCollection.doc(gameName).update({...ratingResult})
    }
}
