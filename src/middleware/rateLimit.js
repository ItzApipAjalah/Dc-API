const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 5, // 5 requests per second
    message: {
        error: 'Too many requests',
        message: 'Please wait a moment before making more requests'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Add these settings for Vercel
    trustProxy: true,
    keyGenerator: (req) => {
        return req.headers['x-real-ip'] || req.ip;
    }
});

module.exports = apiLimiter; 