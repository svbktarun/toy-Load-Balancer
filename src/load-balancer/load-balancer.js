import { MAX_REQ_ATTEMPTS, SERVER_HEALTH_CHECK_TIME } from "./constants";

export default class LoadBalancer {
    constructor(serverPool) {
        this.serverPool = serverPool;
    }

    // Active health check
    healthCheck() {
        console.log("Active Server Health check running....");
        setTimeout(async () => {
            await this.serverPool.healthCheck();
            setTimeout(() => {
                this.healthCheck();
            }, SERVER_HEALTH_CHECK_TIME);
        }, SERVER_HEALTH_CHECK_TIME);
    }

    serverStatus() {
        const statusArr = this.serverPool.backends.map(backend => {
            if (!backend.alive) {
                return 'OFF';
            }
            return backend.queue ? backend.queue : 'ON';
        });
        console.log("status of server pool........");
        console.log(statusArr.join(" "));
    }

    async serveRequests(req, backend = null) {
        req.context.attempts++;
        console.log(`req with id ${req.id} is received.....`);
        if (backend === null) {
            const backendIndex = this.serverPool.getNextBackend();
            if (backendIndex === null) {
                console.log(`req ${req.id} rejected due to non-availability of servers`);
                return;
            }
            else {
                backend = this.serverPool.backends[backendIndex];
            }
        }
        try {
            const res = await backend.attendRequest(req);
            console.log(`req id ${req.id} fulfilled in ${res.context.attempts} attempts by backend ${backend.URL}`);
            backend.totalRequestsServed++;
        } catch {
            if (req.context.attempts < MAX_REQ_ATTEMPTS) {
                this.serveRequests(req, backend);
            }
            else {
                console.log(`req id ${req.id} rejected in ${req.context.attempts} by backend ${backend.URL}`);
                backend.alive = false;
            }
        }
    }
}