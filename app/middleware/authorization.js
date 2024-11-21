import mongoclient, { userCollection, listCollection } from "../services/database.js";

export const authorize = (requiredRole = null, requiresList = true) => {
    return async (req, res, next) => {
      try {
        await mongoclient.connect();
        const { user_id } = req.headers;
  
        if (!user_id) {
          return res.status(401).json({ error: "Unauthorized: Missing user ID" });
        }
  
        if (requiresList) {
          const { listId } = req.params;
  
          if (!listId) {
            return res.status(400).json({ error: "Bad request: Missing list ID" });
          }
  
          const shoppingList = await listCollection.findOne({ listId });
  
          if (!shoppingList) {
            return res.status(404).json({ error: "List not found" });
          }
  
          const isOwner = shoppingList.owner === user_id;
          const isMember = shoppingList.memberList.includes(user_id);
  
          if (!isOwner && !isMember) {
            return res
              .status(403)
              .json({ error: "Access denied: You do not have an access to this list." });
          }
  
          if (requiredRole) {
            if (requiredRole === "owner" && !isOwner) {
              return res.status(403).json({
                error: "Access denied: Only the owner can perform this action.",
              });
            }
            if (requiredRole === "member" && !isMember) {
              return res.status(403).json({
                error: "Access denied: Only members can perform this action.",
              });
            }
          }
  
          // Předání role
          req.userRole = isOwner ? "owner" : "member";
        }
  
        // Předání ověřeného uživatele do handleru
        req.userId = user_id;
        next();
      } catch (err) {
        console.error("Authorization error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    };
  };
  