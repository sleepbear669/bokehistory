import ImageSizeResolver from "./ImageSizeResolver";
export default class ImageUrlResolver {

    static canUseWebP = false;
    static useCloudFront = true;

    static checkWebPSupport() {
        const images = {
            basic: "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==",
            lossless: "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA="
        };

        let img = new Image();
        img.onload = function () {
            ImageUrlResolver.canUseWebP = this.width === 2 && this.height === 1;
        };
        img.onerror = function () {
            ImageUrlResolver.canUseWebP = false;
        };
        img.src = images["basic"];
    }

    static resolveCloudFrontUrl(md5, unitOrAnswer) {
        let d0 = md5.charAt(0);
        let d1 = md5.charAt(1);
        return `https://d27rgky0dohqcj.cloudfront.net/${unitOrAnswer}/${d0}/${d1}/${md5}.${ImageUrlResolver.getExt()}`;
    }

    static unit(md5) {
        if (!md5) return '';
        if (ImageUrlResolver.useCloudFront && !__DEV__) return ImageUrlResolver.resolveCloudFrontUrl(md5, 'units');
        return `https://api.matholic.com/public/api/image/unit/${md5}.${ImageUrlResolver.getExt()}`;
    }

    static answer(md5) {
        if (!md5) return '';
        if (ImageUrlResolver.useCloudFront && !__DEV__) return ImageUrlResolver.resolveCloudFrontUrl(md5, 'answers');
        return `https://api.matholic.com/public/api/image/answer/${md5}.${ImageUrlResolver.getExt()}`;
    }

    static getExt() {
        return ImageUrlResolver.canUseWebP ? 'webp' : 'gif';
    }

    static changeExtToGif(url) {
        return url.replace(".webp", ".gif");
    }

    static async resolve(lu) {
        lu.questionImageUrl = ImageUrlResolver.unit(lu.questionImageUrl);
        lu.answerImageUrl = ImageUrlResolver.answer(lu.answerImageUrl);

        try {
            lu.questionImageAspectRatio = (await ImageSizeResolver.size(lu.questionImageUrl)).aspectRatio;
        } catch (e) {
            if (lu.questionImageUrl.includes(".webp")) {
                lu.questionImageUrl = ImageUrlResolver.changeExtToGif(lu.questionImageUrl);
                lu.questionImageAspectRatio = (await ImageSizeResolver.size(lu.questionImageUrl)).aspectRatio;
            }
        }

        if (lu.answerImageUrl) {
            try {
                lu.answerImageAspectRatio = (await ImageSizeResolver.size(lu.answerImageUrl)).aspectRatio;
            } catch (e) {
                if (lu.answerImageUrl.includes(".webp")) {
                    lu.answerImageUrl = ImageUrlResolver.changeExtToGif(lu.answerImageUrl);
                    lu.answerImageAspectRatio = (await ImageSizeResolver.size(lu.answerImageUrl)).aspectRatio;
                }
            }
        }



    }
}

ImageUrlResolver.checkWebPSupport();


