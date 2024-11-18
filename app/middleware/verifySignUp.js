import mongoclient, { user_col } from "../services/database.js";

/*duplicitu jména kontroluji pouze mezí usery se zadaným heslem - tj. registrovanými přímo pomocí jména a hesla (nikoliv oAuth)
 zde unikátnost potřebuji protože hledám podle jména v tabulce user abych našel odpovídající heslo
 při registraci přes oAuth podle jména nehledám, dostávám unikátní identifikátor + provider a tedy můžu mít více stejných jmen nebo emailů*/
const checkDuplicateUsername = async (req, res, next) => {
  const username = req.body.username ?? null;
  try {
    await mongoclient.connect();
    const existingUser = await user_col.findOne({
      username: username,
      password: { $ne: null },
    });
    if (existingUser) {
      res.status(400).send({
        message: "Zadané jméno již existuje !",
      });
      return;
    }
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
    return;
  } finally {
    await mongoclient.close();
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsername: checkDuplicateUsername,
};

export default verifySignUp;
