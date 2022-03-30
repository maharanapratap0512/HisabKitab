const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./config');

const hashPassword = async (password) => {
    try{
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    } catch(err){
        return err;
    }
};

const comparePassword = async(password, hash) => {
    try{
        return await bcrypt.compare(password, hash);
    } catch(err){
        console.error(err.message);
        return err;
    }
};


const getToken = async (payload) => {
    try{
        const token = await jwt.sign(payload, config.JWT_SECRET, {expiresIn: '12h'}); // Token expires in 1 hour. '1h' / '1200ms'
        return token;
    } catch(err){
        console.error(err.message);
        return err;
    }
};

const checkAuth = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = await jwt.verify(token, config.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch(err){
        return res.status(440).json({
            success: false,
            message: 'Unauthorized Access or Session Expired'
        });
    }
}

module.exports = {
    hashPassword, comparePassword, getToken, checkAuth
}