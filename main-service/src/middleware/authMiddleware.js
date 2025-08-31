const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;
    console.log('[AUTH MIDDLEWARE] Authorization header:', authHeader);
    const token  = authHeader?.split(' ')[1];
    if(!token) {
        console.error('[AUTH MIDDLEWARE] No token passed or expired');
        return res.status(401).json({message: 'No token passed or expired'});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[AUTH MIDDLEWARE] Decoded user:', decoded);
        req.user = decoded;
        next();
    }catch(err){
        console.error('[AUTH MIDDLEWARE] Invalid token:', err);
        res.status(401).json({message: 'Invalid token'});
    }
};

module.exports = authMiddleware;
