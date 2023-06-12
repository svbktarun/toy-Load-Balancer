export default class ServerPool {
    constructor() {
        this.backends = [];
        this.currentBackendIndex = -1;
    }

    addBackend(backend) {
        this.backends.push(backend);
    }

    markBackendStatus(url, alive) {
        for (let i = 0; i < this.backends.length; i++) {
            if (this.backends[i].URL === url) {
                this.backends[i].alive = alive;
                return;
            }
        }
    }

    getNextBackend() {
        const idx = this.currentBackendIndex + 1;
        for (let i = idx; i < this.backends.length; i++) {
            if (this.backends[i].alive) {
                this.currentBackendIndex = i;
                return this.currentBackendIndex;
            }
        }
        for (let i = 0; i < idx; i++) {
            if (this.backends[i].alive) {
                this.currentBackendIndex = i;
                return this.currentBackendIndex;
            }
        }
        return null;
    }

    async healthCheck() {
        const healthPromises = this.backends.map(backend => backend.isBackendAlive());
        await Promise.all(healthPromises.map(async (healthPromise) => await healthPromise));
        console.log("Active Server Health check completed....");
    }
}