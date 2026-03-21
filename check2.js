const fs = require('fs');
const url = "https://yrelbvgdixjsnltbzsez.supabase.co/rest/v1/items?select=id,title,community_id,creator_id,author_email,type,lat,lng&order=created_at.desc&limit=20";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxidmdkaXhqc25sdGJ6c2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDk0NTgsImV4cCI6MjA4NTcyNTQ1OH0.x52-obsIURc7yFK6YMwCG6tD2iBGfTFlFzvkiupo-S8";

fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
  .then(res => res.json())
  .then(data => {
      fs.writeFileSync('db_items.json', JSON.stringify(data, null, 2));
      const url2 = "https://yrelbvgdixjsnltbzsez.supabase.co/rest/v1/communities?select=id,slug,name";
      return fetch(url2, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  })
  .then(res => res.json())
  .then(data => {
      fs.writeFileSync('db_communities.json', JSON.stringify(data, null, 2));
      console.log("DONE");
  });
