# 学习redis
Redis(Remote Dictionary Server)开放源代码（BSD）的内存存储、用于数据库、缓存和消息中间件。它支持string、hashes、lists、sets、带范围的sorted sets、bitmap、hyperloglogs、带半径查询和流的的地理空间索引。Redis带有内建的负值、Lua脚本、LRU缓存、事务和不同层次的磁盘持久化，提供了基于Redis Sentinel和Redis Cluster自动分区的高可用性。

## 在koa中使用redis
session可存储在redis中。[koa-session2](https://www.npmjs.com/package/koa-session2)是一个存取session的中间件，可使用redis作为store。[node-redis](https://github.com/NodeRedis/node_redis)是一个完整的nodejs redis客户端。支持所有的Redis命令，专注于高性能。

1. 安装
```bash
yarn add koa-session2
yarn add redis
```

2. 连接redis
```javascript
const redis = require("redis")
const redisClient = redis.createClient({
    password: "12345678"
})

redisClient.on("error", function (error) {
    console.error("redis error", error)
})

redisClient.on("connect", function () {
    console.log("redis connect successful.")
})

redisClient.on("end", function () {
    console.log("redis end.")
})

module.exports = redisClient
```

3. 实现一个koa-session2的Store
```javascript
const { Store } = require('koa-session2')
const uuid = require("uuid")
const redis = require('./redisConnect')

const prefix = "SESSION:" // session 前缀

class RedisStore extends Store {
    async get(sid, ctx) {
        let data = await new Promise((res, rej) => {
            redis.get(`${prefix}${sid}`, function (err, reply) {
                if(err) {
                    rej(err)
                } else {
                    res(reply)
                }
            })
        })

        return JSON.parse(data)
    }

    async set(session, { sid = uuid(), maxAge = 60 * 60 * 1000 * 24 * 7 } = {}, ctx) {
        try {
            await new Promise((res, rej) => {
                // 设置redis过期时间
                redis.set(`${prefix}${sid}`, JSON.stringify(session), 'EX', maxAge / 1000, function (err, reply) {
                    if(err) {
                        rej(err)
                    } else {
                        res(reply)
                    }
                })
            })
        } catch(error) {
            console.error(error)
        }

        return sid
    }

    async destroy(sid, ctx) {
        const reply = await new Promise((res, rej) => {
            redis.del(`${prefix}${sid}`, function (err, reply) {
                if(err) {
                    rej(err)
                } else {
                    res(reply)
                }
            })
        })
        return reply
    }
}

module.exports = RedisStore
```
4. 应用于koa-sessions
```javascript
const Koa = require('koa')
const RedisStore = require('./RedisStore')

const app = new Koa()
const redisStore = new RedisStore()

app.use(session({ // session
    key: "ssw", // cookie key
    store: redisStore, // redis作为store
    maxAge: 60 * 60 * 1000 * 24 * 7, // 设置cookies的属性值， maxAge需要和redis的expire一致
    httpOnly: true
}))

// app.use(ctx => {
//     // refresh session if set maxAge
//     ctx.session.refresh()
// }) // 对于koa-session2中的此处确实没看明白，只要设置，就一定会写回cookie，但有时候不需要写，比如登录不成功的时候，洋葱圈模型，一定会回到这里。如果不加这一段代码，就是正确的结果。

// bodyparser
// orm
// auth
// router
// 各种middlewares
```