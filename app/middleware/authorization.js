export function authorize() {
  return async (req, res, next) => {
    try {
      const { user_id } = req.headers;

      if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') { //trim odstranuje bílé znaky
        return res.status(401).json({ error: "Unauthorized: Missing or invalid user ID" });
      }

      req.userId = user_id;
      next();
    } catch (err) {
      res.status(500).json({ error: "Internal server error" }); // Obecná chyba serveru
    }
  };
}