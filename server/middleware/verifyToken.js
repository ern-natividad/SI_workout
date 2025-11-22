import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export default function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing Authorization header' });
  }
  const token = auth.split(' ')[1];
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured. Rejecting token verification.');
    return res.status(500).json({ success: false, message: 'Server misconfiguration' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
