import Backend from "./load-balancer/backend";
import { MAX_CONCURRENT_REQS_MOCK, MOCK_SERVER_COUNT, REQ_FIRING_TIMER } from "./load-balancer/constants";
import Context from "./load-balancer/context";
import LoadBalancer from "./load-balancer/load-balancer";
import ServerPool from "./load-balancer/server-pool";

let reqId = 0;

const serverPoolMock = () => {
    const serverPool = new ServerPool();
    for (let i = 0; i < MOCK_SERVER_COUNT; i++) {
        const backend = new Backend(`http://localhost:${i}00`, true);
        serverPool.addBackend(backend);
    }
    return serverPool;
}

const requestsMock = (lb) => {
    const concurrentReqs = Math.floor(Math.random() * MAX_CONCURRENT_REQS_MOCK);
    for (let i = 0; i < concurrentReqs; i++) {
        const request = {
            id: reqId++,
            context: new Context()
        }
        lb.serveRequests(request);
    }
    setTimeout(() => {
        requestsMock(lb);
    }, REQ_FIRING_TIMER);
}

const serverStatusMock = (lb) => {
    setTimeout(() => {
        lb.serverStatus();
        serverStatusMock(lb);
    }, 10000);
}

export default class driver {
    /* Load balancer initiated */
    initialise() {
        console.log("load balancer initiated....");
        const lb = new LoadBalancer(serverPoolMock());
        requestsMock(lb);
        serverStatusMock(lb);
        lb.healthCheck();
    }
}
