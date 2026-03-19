const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const targetStr = `        let total = 0;
        cart.forEach((item, index) => {
            total += parseFloat(item.price);
            const itemHTML = \`
                <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
                    <img src="\${item.img}" class="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-300">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-xl font-bold text-gray-800">\${item.name}</h3>
                        <p class="text-gray-600 text-lg">$\${item.price}</p>
                    </div>
                    <button onclick="removeItem(\${index})" class="text-red-600 font-bold underline px-4 py-2 hover:bg-red-50 rounded text-lg">Remove</button>
                </div>
            \`;
            container.innerHTML += itemHTML;
        });`;

const replaceStr = `        let total = 0;
        container.innerHTML = cart.map((item, index) => {
            total += parseFloat(item.price);
            return \`
                <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
                    <img src="\${item.img}" class="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-300">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-xl font-bold text-gray-800">\${item.name}</h3>
                        <p class="text-gray-600 text-lg">$\${item.price}</p>
                    </div>
                    <button onclick="removeItem(\${index})" class="text-red-600 font-bold underline px-4 py-2 hover:bg-red-50 rounded text-lg">Remove</button>
                </div>
            \`;
        }).join('');`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('script.js', code);
    console.log('Successfully patched renderCartPage');
} else {
    console.log('Could not find target string for renderCartPage');
}
