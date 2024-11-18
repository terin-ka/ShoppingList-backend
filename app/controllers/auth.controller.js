import {
  invalidateSession,
  generateSessionToken,
  createSession,
  generateId,
  hashPassword,
  verifyPasswordHash,
} from "../services/auth.js";
import mongoclient, { user_col } from "../services/database.js";
import { getResponse } from "../helpers/utils.js";

// tutorial viz.
// https://lucia-auth.com/tutorials/username-and-password/
export async function logout(_, res) {
  if (!res.locals.session) {
    return res.status(401).end();
  }
  await invalidateSession(res.locals.session.id);
  return res.status(200).send("Ok");
}

export async function register(req, res) {
  const username = req.body.username ?? null;
  const password = req.body.password ?? null;
  const hashedPassword = await hashPassword(password);
  const email = req.body.email ?? null;
  const userId = generateId(15);

  try {
    try {
      // založíme usera
      await mongoclient.connect();
      await user_col.insertOne({
        id: userId,
        username: username,
        email: email,
        password: hashedPassword,
      });
    } catch (error) {
      throw new Error(error.message);
    } finally {
      await mongoclient.close();
    }
    return res.status(200).send(
      getResponse("Ok", {
        id: userId,
      })
    );
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const username = req.body.username ?? null;
    const password = req.body.password ?? null;
    const needAdmin = req.body.admin ?? null; // signalizuje že požaduje nastavení admina
    try {
      await mongoclient.connect();
      /*kontroluji pouze mezi usery se zadaným heslem = registrovanými přes jméno/heslo*/
      const existingUser = await user_col.findOne({
        username: username,
        password: { $ne: null },
      });
      if (!existingUser) {
        res.locals.nolog = true;
        return res.status(404).send(getResponse("Neznámý uživatel !"));
      }

      //const validPassword = await new Argon2id().verify(existingUser.password, password);
      const validPassword = await verifyPasswordHash(existingUser.password, password);
      if (!validPassword) {
        res.locals.nolog = true;
        return res.status(401).send(getResponse("Neplatné heslo !"));
      }

      if (needAdmin) {
        if (existingUser.admin !== 1) {
          res.locals.nolog = true;
          return res.status(401).send(getResponse("Přístup je povolen pouze uživateli s právem admin !"));
        }
      }

      //const session = await lucia.createSession(existingUser.id, {}); !!LL

      const token = generateSessionToken();
      const session = await createSession(token, existingUser.id);
      // pošleme na klienta token kde ho uložíme (nikoliv tedy session.id), zpět dostaneme také token a zjiitíme z něj sessionid
      res.status(200).send(
        getResponse("Ok", {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          sessionid: token, //session.id,
        })
      );
    } finally {
      await mongoclient.close();
    }
  } catch (err) {
    res.status(500).send(getResponse(err.message));
  }
}

export async function changePassword(req, res) {
  try {
    const username = req.body.username ?? null;
    try {
      await mongoclient.connect();

      let user = await user_col.findOne({
        username: username,
      });
      if (!user) {
        res.locals.nolog = true;
        return res.status(404).send(getResponse("Neznámý uživatel !"));
      }

      // kontrolujeme zda souhlasí staré heslo
      //const validPassword = await new Argon2id().verify(user.password, req.body.oldPassword);
      const validPassword = await verifyPasswordHash(user.password, req.body.oldPassword);
      if (!validPassword) {
        res.locals.nolog = true;
        return res.status(401).send(getResponse("Neplatné heslo !"));
      }

      // uložíme nové heslo
      const filter = { username: username };
      const updateDocument = {
        $set: {
          password: await hashPassword(req.body.newPassword),
        },
      };
      await user_col.updateOne(filter, updateDocument);

      res.status(200).send(
        getResponse("Ok", {
          id: user.id,
          username: user.username,
        })
      );
    } finally {
      await mongoclient.close();
    }
  } catch (err) {
    res.status(500).send(getResponse(err.message));
  }
}
