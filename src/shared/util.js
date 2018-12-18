Array.prototype.flatten = function () {
    return [].concat.apply([], this);
};
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.groupBy = function (grouper) {
    return this.reduce((r, e, i) => {
        let group = grouper(e, i);
        if (r[group]) r[group].push(e);
        else r[group] = [e];
        return r;
    }, {});
};
Array.prototype.groupSize = function (size) {
    let result = [];
    for (let i = 0; i < this.length; i += size)
        result.push(this.slice(i, i + size));
    return result;
};
Array.prototype.joinWithElement = function (element) {
    if (typeof element === "function")
        return this.flatMap((i, j, k) => {
            if (j === k.length - 1) return [i];
            return [i, element(j)];
        });
    else
        return this.flatMap((i, j, k) => {
            if (j === k.length - 1) return [i];
            return [i, element];
        });
};
Array.prototype.distinctBy = function (fn) {
    let unique = {};
    let distinct = [];
    this.forEach(function (x) {
        let key = fn(x);
        if (!unique[key]) {
            distinct.push(x);
            unique[key] = true;
        }
    });
    return distinct;
};
Array.prototype.sum = function (fn) {
    if (typeof fn === "function") return this.map(fn).reduce((a, b) => a + b, 0);
    return this.reduce((a, b) => a + b, 0);
};
Array.prototype.range = function (start, end, step) {
    step = !step ? 1 : step;
    end = end / step;
    for (let i = start; i <= end; i++) {
        this.push(i * step);
    }
    return this;
};
Array.prototype.max = function (fn) {
    if (this.length === 0) return undefined;
    let maxIdx = 0;
    let maxValue = fn(this[maxIdx]);
    this.forEach((i, idx) => {
        let cur = fn(i);
        if (maxValue < cur) {
            maxValue = cur;
            maxIdx = idx;
        }
    });
    return {
        item: this[maxIdx],
        index: maxIdx,
        value: maxValue
    };
};
Array.prototype.repeat = function (times) {
    let newArr = [...this];
    while (times-- > 0) newArr = newArr.concat(this);
    return newArr;
};
Array.prototype.sortBy = function (...props) {
    const keySize = props.length;
    return this.sort((a, b) => {
        let i = 0;
        let order = 0;
        while (order === 0 && i < keySize) {
            let prop = props[i];
            if (prop instanceof Function) order = compare(prop(a), prop(b));
            else order = compare(a[prop], b[prop]);
            i++;
        }
        return order;
    });
};
Array.prototype.maxValue = function () {
    return this.reduce((a, b) => Math.max(a, b), this[0]);
};
Array.prototype.minValue = function () {
    return this.reduce((a, b) => Math.min(a, b), this[0]);
};
const sorters = {
    string: (a, b) => a && b ? a.localeCompare(b) : 0,
    number: (a, b) => a - b
};
const compare = (a, b) => sorters[typeof a](a, b);

Date.prototype.format = function (f) {
    if (!this.valueOf()) return '';
    let d = this;
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case 'YYYY':
            case 'yyyy':
                return d.getFullYear();
            case 'yy':
                return (d.getFullYear() % 1000).zf(2);
            case 'MM':
                return (d.getMonth() + 1).zf(2);
            case 'DD':
            case 'dd':
                return d.getDate().zf(2);
            case 'E':
                return ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][d.getDay()];
            case 'HH':
                return d.getHours().zf(2);
            case 'hh':
                return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case 'mm':
                return d.getMinutes().zf(2);
            case 'ss':
                return d.getSeconds().zf(2);
            case 'a/p':
                return d.getHours() < 12 ? '오전' : '오후';
            default:
                return $1;
        }
    });
};
Date.prototype.termText = function () {
    const term = ~~((new Date().getTime() - this.getTime()) / 1000);
    const m = ~~(term / 60) % 60;
    const h = ~~(term / 3600) % 24;
    const d = ~~(term / 3600 / 24);
    const w = ~~(d / 7);
    const y = ~~(d / 365);

    if (y >= 1) return [`${y}`, `년전`, 6];
    if (d >= 7) return [`${w}`, `주전`, 5];
    else if (d > 1) return [`${d}`, `일전`, 4];
    else if (0 < d && d <= 1) return ['', '어제', 3];
    else if (h > 0) return [`${h}`, `시간전`, 2];
    else if (m > 2) return [`${m}`, `분전`, 1];
    else return ['', '방금전', 0];
};
String.prototype.zf = function (len) {
    return '0'.repeat(len - this.length) + this;
};
Number.prototype.zf = function (len) {
    return this.toString().zf(len);
};
Math.clamp = function (number, min, max, defaultValue = 0) {
    if (isFinite(number)) {
        return Math.max(min, Math.min(number, max))
    } else {
        return defaultValue;
    }
};
window.isMobileDevice = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
window._isChrome = null;
window.isChrome = function () {
    if (!window._isChrome) {
        let browser = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        window._isChrome = {
            isChrome: !!(browser && browser[0] && browser[0].indexOf('Chrome') >= 0)
        };
    }
    return window._isChrome.isChrome;
};

window.getTime = function getTime() {
    return (new Date()).getTime();
};


const elo_k = 16;
export function elo(a, b, rank, k = elo_k) {
    const winRate = 1.0 / (1.0 + Math.pow(10, (b - a) / 400));
    return k * (rank - winRate);
}
