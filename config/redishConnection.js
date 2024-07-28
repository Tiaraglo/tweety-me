const Redis = require("ioredis");

// redis-cli -u redis://default:U0gTqCmsZGSicty4smLmytOXNhws89UB@redis-15712.c1.asia-northeast1-1.gce.redns.redis-cloud.com:15712 

const redis = new Redis({
    port: 15712, // Redis port
    host: "redis-15712.c1.asia-northeast1-1.gce.redns.redis-cloud.com", // Redis host
    username: "default", // needs Redis >= 6
    password: "U0gTqCmsZGSicty4smLmytOXNhws89UB",
    db: 0, // Defaults to 0
});

module.exports = redis