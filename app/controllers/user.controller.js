import mongoclient, { user_col } from "../services/database.js";

export async function getUser(req, res) {
  //  předám userId jako query parametr
  let user = null;
  try {
    await mongoclient.connect();
    user = await user_col.findOne({
      id: req.params.id ?? null,
    });
  } finally {
    await mongoclient.close();
  }
  if (user) {
    res.status(200).json({ email: user.email });
  } else {
    res.status(400).send({ message: "Uživatel nenalezen !" });
  }
}

// profil uživatele
export async function getUserProfile(req, res) {
  //  předám userId jako query parametr
  let user = null;
  try {
    await mongoclient.connect();
    user = await user_col.findOne({
      id: req.params.id ?? null,
    });
  } finally {
    await mongoclient.close();
  }
  if (user) {
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(400).send({ message: "Uživatel nenalezen !" });
  }
}

// změna emailu uživatele
export async function changeEmail(req, res) {
  try {
    const id = req.body.id ?? null;
    const email = req.body.email ?? null;
    try {
      await mongoclient.connect();
      let user = await user_col.findOne({
        id: id,
      });
      if (!user) {
        return res.status(404).send({ message: "Uživatel nenalezen !" });
      }
      // uložíme email, nové heslo pouze pokud již heslo existuje - toto signalizuje že se jedná o usera registrovaného přes jméno/heslo
      const filter = { id: id };
      // update the value of the 'quantity' field to 5
      const updateDocument = {
        $set: {
          email: email,
        },
      };
      await user_col.updateOne(filter, updateDocument);
      // načteme znovu usera
      res.status(200).send({
        id: id,
        username: user.username,
      });
    } finally {
      await mongoclient.close();
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}
