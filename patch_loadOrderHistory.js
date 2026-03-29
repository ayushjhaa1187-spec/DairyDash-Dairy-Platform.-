const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const targetStr = `        history.forEach(order => {
            // Build a string of item names (e.g., "Phone, Pills")
            const itemNames = order.items.map(i => i.name).join(", ");

            const card = \`
                <div class="bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 mb-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4">
                        <div>
                            <span class="text-sm text-gray-500 font-bold uppercase">Order #\${order.id}</span>
                            <div class="text-xl font-bold text-gray-800">\${order.date}</div>
                        </div>
                        <div class="mt-2 md:mt-0">
                            <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                                🚚 \${order.status}
                            </span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="text-gray-600 text-lg"><span class="font-bold">Items:</span> \${itemNames}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="font-bold text-gray-700">Status: On the way to your home.</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-4 mt-3">
                            <div class="bg-[#208090] h-4 rounded-full" style="width: 60%"></div>
                        </div>
                    </div>
                </div>
            \`;
            container.innerHTML += card;
        });`;

const replaceStr = `        container.innerHTML = history.map(order => {
            // Build a string of item names (e.g., "Phone, Pills")
            const itemNames = order.items.map(i => i.name).join(", ");

            return \`
                <div class="bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 mb-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4">
                        <div>
                            <span class="text-sm text-gray-500 font-bold uppercase">Order #\${order.id}</span>
                            <div class="text-xl font-bold text-gray-800">\${order.date}</div>
                        </div>
                        <div class="mt-2 md:mt-0">
                            <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                                🚚 \${order.status}
                            </span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="text-gray-600 text-lg"><span class="font-bold">Items:</span> \${itemNames}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="font-bold text-gray-700">Status: On the way to your home.</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-4 mt-3">
                            <div class="bg-[#208090] h-4 rounded-full" style="width: 60%"></div>
                        </div>
                    </div>
                </div>
            \`;
        }).join('');`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('script.js', code);
    console.log('Successfully patched loadOrderHistory');
} else {
    console.log('Could not find target string for loadOrderHistory');
}
