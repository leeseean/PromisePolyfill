/* 
  原生js模拟promise
*/
const PromisePolyfill = (() => {
    const promiseStatusSymbol = Symbol('PromiseStatus');
    const promiseValueSymbol = Symbol('PromiseValue');
    const STATUS = {
        PENDING: 'PENDING',
        FULFILLED: 'FULFILLED',
        REJECTED: 'REJECTED'
    };

    function resolve() {
        this[promiseValueSymbol] = arguments[0];
        this[promiseStatusSymbol] = STATUS['FULFILLED'];
    }

    function reject() {
        this[promiseValueSymbol] = arguments[0];
        this[promiseStatusSymbol] = STATUS['REJECTED'];
    }

    function noop() {}

    class myPromise {
        constructor(resolver) {
            if (typeof resolver !== 'function') {
                throw new TypeError(`parameter 1 must be a function, but get a ${typeof func}`);
            }
            this[promiseStatusSymbol] = STATUS['PENDING'];
            resolver(
                resolve.bind(this),
                reject.bind(this)
            );
        }
        then(callback) {
            const interval = setInterval(() => {
                if (this[promiseStatusSymbol] === 'FULFILLED' || this[promiseStatusSymbol] === 'REJECTED') {
                    clearInterval(interval);
                    callback(this[promiseValueSymbol], resolve.bind(this), reject.bind(this));
                    this[promiseStatusSymbol] = 'PENDING';
                }
            });
            return this;
        }
    }
    myPromise.all = (iterable) => {
        return new myPromise((resolve, reject) => {
            let count = 0,
                ans = new Array(count);
            for (const i in iterable) {
                const v = iterable[i];
                if (typeof v === 'object' && typeof v.then === 'function') {
                    v.then((res) => {
                        ans[i] = res;
                        if (--count === 0) {
                            resolve(ans);
                        }
                    }, reject);
                    count++;
                } else {
                    ans[i] = v;
                }
            }
        });
    };
    myPromise.race = (iterable) => {
        return new myPromise((resolve, reject) => {
            for (const i in iterable) {
                const v = iterable[i];
                if (typeof v === 'object' && typeof v.then === 'function') {
                    v.then(resolve, reject);
                } else {
                    resolve(v);
                }
            }
        });
    };
    return myPromise;
})();
//测试，下面会先打印出111aaa，再打印出222bbb，333ccc
new PromisePolyfill(function (resolve, reject) {
    setTimeout(() => {
        resolve(222);
        console.log(`111aaa`)
    }, 1000);
}).then(function (res, resolve, reject) {
    setTimeout(() => {
        resolve(333);
        console.log(`${res}bbb`)
    }, 3000);
}).then(function (res, resolve, reject) {
    console.log(`${res}ccc`);
});
