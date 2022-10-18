import merge from 'deep-assign';


const mergeLocalStorageItem = (key: string, value: string) => {
    const oldValue = window.localStorage.getItem(key);
    const oldObject = oldValue !== null ? JSON.parse(oldValue) : {};
    const newObject = JSON.parse(value);
    const nextValue = JSON.stringify(merge({}, oldObject, newObject));
    window.localStorage.setItem(key, nextValue);
};

const createPromise = (getValue: () => any, callback: Function | undefined): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            const value = getValue();
            if (callback) {
                callback(null, value);
            }
            resolve(value);
        } catch (err) {
            if (callback) {
                callback(err);
            }
            reject(err);
        }
    });
};

const createPromiseAll = (promises: Promise<any>[], callback: Function | undefined, processResult?: {(result: any): any; (arg0: any[]): any;} | undefined): Promise<any> => {
    return Promise.all(promises).then(
        result => {
            const value = processResult ? processResult(result) : null;
            callback && callback(null, value);
            return Promise.resolve(value);
        },
        errors => {
            callback && callback(errors);
            return Promise.reject(errors);
        },
    );
};

export default class AsyncLocalStorage {

    /**
     * Fetches `key` value.
     */
    static getItem(key: string, callback?: Function): Promise<any> {
        return createPromise(() => {
            return window.localStorage.getItem(key);
        }, callback);
    }

    /**
     * Sets `value` for `key`.
     */
    static setItem(key: string, value: string, callback?: Function): Promise<any> {
        return createPromise(() => {
            window.localStorage.setItem(key, value);
        }, callback);
    }

    /**
     * Removes a `key`
     */
    static removeItem(key: string, callback?: Function): Promise<any> {
        return createPromise(() => {
            return window.localStorage.removeItem(key);
        }, callback);
    }

    /**
     * Merges existing value with input value, assuming they are stringified JSON.
     */
    static mergeItem(key: string, value: string, callback?: Function): Promise<any> {
        return createPromise(() => {
            mergeLocalStorageItem(key, value);
        }, callback);
    }

    /**
     * Erases *all* AsyncLocalStorage for the domain.
     */
    static clear(callback?: Function): Promise<any> {
        return createPromise(() => {
            window.localStorage.clear();
        }, callback);
    }

    /**
     * Gets *all* keys known to the app, for all callers, libraries, etc.
     */
    static getAllKeys(callback?: Function): Promise<any> {
        return createPromise(() => {
            const numberOfKeys = window.localStorage.length;
            const keys: any[] = [];
            for (let i = 0; i < numberOfKeys; i += 1) {
                const key = window.localStorage.key(i);
                keys.push(key);
            }
            return keys;
        }, callback);
    }

    /**
     * (stub) Flushes any pending requests using a single batch call to get the data.
     */
    static flushGetRequests() {
    }

    /**
     * multiGet resolves to an array of key-value pair arrays that matches the
     * input format of multiSet.
     *
     *   multiGet(['k1', 'k2']) -> [['k1', 'val1'], ['k2', 'val2']]
     */
    static multiGet(keys: Array<string>, callback?: Function): Promise<any> {
        const promises = keys.map(key => AsyncLocalStorage.getItem(key));
        const processResult = (result: any[]) => result.map((value, i) => [keys[i], value]);
        return createPromiseAll(promises, callback, processResult);
    }

    /**
     * Takes an array of key-value array pairs.
     *   multiSet([['k1', 'val1'], ['k2', 'val2']])
     */
    static multiSet(keyValuePairs: Array<Array<string>>, callback?: Function): Promise<any> {
        const promises = keyValuePairs.map(item => AsyncLocalStorage.setItem(item[0], item[1]));
        return createPromiseAll(promises, callback);
    }

    /**
     * Delete all the keys in the `keys` array.
     */
    static multiRemove(keys: Array<string>, callback?: Function): Promise<any> {
        const promises = keys.map(key => AsyncLocalStorage.removeItem(key));
        return createPromiseAll(promises, callback);
    }

    /**
     * Takes an array of key-value array pairs and merges them with existing
     * values, assuming they are stringified JSON.
     *
     *   multiMerge([['k1', 'val1'], ['k2', 'val2']])
     */
    static multiMerge(keyValuePairs: Array<Array<string>>, callback?: Function): Promise<any> {
        const promises = keyValuePairs.map(item => AsyncLocalStorage.mergeItem(item[0], item[1]));
        return createPromiseAll(promises, callback);
    }
}
