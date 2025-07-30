// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.protectStudent = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
            if (decoded.role !== 'student') throw new Error('Not authorized as student');

            req.user = await Student.findById(decoded.id).select('-password');
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};

exports.protectadmin = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
            if (decoded.role !== 'admin') throw new Error('Not authorized as company');

            req.user = await Admin.findById(decoded.id).select('-password');
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};
