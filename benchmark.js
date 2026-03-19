const { performance } = require('perf_hooks');

const history = [];
for (let i = 0; i < 1000; i++) {
    history.push({
        id: i,
        date: "2023-10-27",
        status: "Shipped",
        items: [{name: "Item 1"}, {name: "Item 2"}]
    });
}

// Mock DOM
class Element {
    constructor() {
        this._innerHTML = '';
        this.children = [];
    }
    get innerHTML() {
        return this._innerHTML;
    }
    set innerHTML(val) {
        // Simulate parsing overhead by repeating string operations or parsing
        this._innerHTML = val;
        // The real issue is browser layout/parsing, which is hard to mock in Node.
        // We can simulate an O(n^2) cost for `+=`
        for(let i=0; i<this._innerHTML.length; i+=1000) {}
    }
}

function loadOrderHistoryOld(container) {
    container.innerHTML = '';
    const start = performance.now();
    history.forEach(order => {
        const itemNames = order.items.map(i => i.name).join(", ");
        const card = `<div>${order.id} ${itemNames}</div>`;
        container.innerHTML += card;
    });
    const end = performance.now();
    return end - start;
}

function loadOrderHistoryNew(container) {
    container.innerHTML = '';
    const start = performance.now();
    container.innerHTML = history.map(order => {
        const itemNames = order.items.map(i => i.name).join(", ");
        return `<div>${order.id} ${itemNames}</div>`;
    }).join('');
    const end = performance.now();
    return end - start;
}

const c1 = new Element();
const oldTime = loadOrderHistoryOld(c1);

const c2 = new Element();
const newTime = loadOrderHistoryNew(c2);

console.log(`Old time (simulated): ${oldTime.toFixed(2)} ms`);
console.log(`New time (simulated): ${newTime.toFixed(2)} ms`);
