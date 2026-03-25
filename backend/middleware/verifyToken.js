import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  console.log('All cookies:', req.cookies)
  console.log('Headers:', req.headers.cookie)
  const token = req.cookies?.accessToken
  console.log('Token found:', token ? 'YES' : 'NO')
  if (!token) return res.status(401).json('Not authenticated.')
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log('JWT error:', err.message)
      return res.status(403).json('Token is not valid.')
    }
    req.userId   = payload.id
    req.username = payload.username
    next()
  })
}