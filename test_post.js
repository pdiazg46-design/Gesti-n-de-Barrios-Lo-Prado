const fs = require('fs');

fetch('https://lo-prado.vercel.app/api/admin/vip-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'UV19-S2', community_id: 19 })
})
.then(r => r.json())
.then(data => {
    console.log("POST RESPONSE:", JSON.stringify(data, null, 2));
})
.catch(e => console.error(e));
