const fetch = require('node-fetch');
const { TURNSTILE_SECRET_KEY } = require('../config/recaptcha');

const verifyTurnstile = async (req, res, next) => {
    try {
        const token = req.headers['cf-turnstile-response'];
        
        if (!token) {
            return res.status(400).json({
                error: 'Captcha required',
                message: 'Please complete the captcha verification'
            });
        }

        const formData = new URLSearchParams();
        formData.append('secret', TURNSTILE_SECRET_KEY);
        formData.append('response', token);
        formData.append('remoteip', req.ip);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const outcome = await result.json();

        if (!outcome.success) {
            return res.status(400).json({
                error: 'Invalid captcha',
                message: 'Captcha verification failed'
            });
        }

        next();
    } catch (error) {
        console.error('Captcha verification error:', error);
        res.status(500).json({
            error: 'Captcha verification failed',
            message: 'An error occurred during captcha verification'
        });
    }
};

module.exports = verifyTurnstile; 