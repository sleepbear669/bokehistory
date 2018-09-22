export default class ImageSizeResolver {
    static size(url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = function () {
                const width = image.width;
                const height = image.height;
                resolve({url, width, height, aspectRatio: width / height});
            };
            image.onerror = function (e) {
                reject(e);
            };
            image.src = url;
        });
    }

    static sizes(urls) {
        return Promise.all(urls.map(size));
    }
}
