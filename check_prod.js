fetch('https://lo-prado.vercel.app/api/admin/vip-codes?community_id=19')
.then(r => r.json())
.then(data => {
    console.log("VIP CODES ON PROD:", JSON.stringify(data, null, 2));
})
.catch(e => console.error(e));

fetch('https://lo-prado.vercel.app/api/admin/users')
.then(r => r.json())
.then(data => {
    console.log("USERS ON PROD:");
    console.log(JSON.stringify(data.profiles?.map(p => ({
        name: p.full_name, vip: p.used_vip_code, admin: p.is_community_admin
    })).filter(p => p.vip), null, 2));
})
.catch(e => console.error(e));
