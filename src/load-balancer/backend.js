import { MOCK_API_RETURN_TIME } from "./constants";

export default class Backend {

    constructor(URL, alive) {
        this.URL = URL;
        this.alive = alive;
        this.totalRequestsServed = 0;
        this.queue = 0;
    }

    async isBackendAlive() {
        const randTime = Math.random() * MOCK_API_RETURN_TIME;
        return new Promise((resolve, ) => {
            setTimeout(() => {
                const determiner = Math.random() > 0.2;
                const isAlive = determiner ? 'alive' : 'not alive';
                resolve(determiner);
                console.log(`Server with ${this.URL} is ${isAlive}`);
                this.alive = determiner;
            }, randTime);
        });
    }

    async attendRequest(req) {
        const randTime = Math.random() * MOCK_API_RETURN_TIME;
        this.queue++;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const shouldResolve = Math.random() > 0.5;
                if (shouldResolve) {
                    req.message = `response returned from server url: ${this.URL}. I am happy.`;
                    resolve(req);
                } else {
                    req.message = `error returned from server url: ${this.URL}. I am trying.`;
                    reject(req);
                }
                this.queue--;
            }, randTime);
        });
    }
}