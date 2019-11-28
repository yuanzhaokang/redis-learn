const redis = require('redis');

const client = redis.createClient({
    password: '12345678'
});
client.on('error', err => {
    console.error(err)
})
client.set("myname", "wind01", redis.print)
client.quit()