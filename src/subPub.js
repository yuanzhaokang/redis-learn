const redis = require("redis");
const sub = redis.createClient({
    password: '12345678'
}), pub = redis.createClient({
    password: "12345678"
});

// ----------------------- sub ----------------------
sub.on('connect', function () {
    console.log("sub connect successful.")
})

sub.on('error', function (error) {
    console.error(error)
})

sub.on("end", function () {
    console.log("sub end")
})

sub.on("subscribe", function (channel, count) {
    console.log("subscribe: " + channel)
});

sub.on("message", function (channel, message) {
    console.log("message comming... ", channel, message)
});

// ---------------------- pub ------------------------------

pub.on('connect', function () {
    console.log("pub connect successful.")
})

pub.on('error', function (error) {
    console.log(error)
})

pub.on("end", function () {
    console.log("pub end")
})

sub.subscribe("chat") // sub订阅chat通道

pub.publish("chat", "hello world") // pub通过chat通道发布消息

setTimeout(() => {
    pub.quit()
    sub.quit()
}, 1000)