import jwt from "jsonwebtoken";
export default function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
