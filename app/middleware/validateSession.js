import { validateSessionToken, verifyRequestOrigin } from "../services/auth.js";
import { appConfig } from "../../config/config.js";

const validateBearer = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  const [authScheme, token] = (authorizationHeader ?? "").split(" ");
  const sessionId = authScheme === "Bearer" ? token : null;
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    //return next();
    res.locals.nolog = true;
    res.status(401).send({
      message: "Uživatel není přihlášen !",
    });
    return;
  }
  // zde dochází automaticky k prodloužení platnosti (updatuje user_session.expires_at) pokud do konce platnosti zbývá méně než polovina času
  const { session, user } = await validateSessionToken(token);
  if (!session) {
    res.locals.user = null;
    res.locals.session = null;
    //return next();
    res.locals.nolog = true;
    res.status(401).send({
      message: "Platnost přihlášení vypršela !",
    });
    return;
  }
  res.locals.session = session;
  res.locals.user = user;
  next();
};

// pozor na rozdíl ne volání next() vs. return next()
// Pokud zavoláte next(); bez return, funkce pokračuje ve vykonávání dalších instrukcí po volání next();.
// může tak dojít k nechtěnému vykonávání dalších příkazů po volání next();.
// To může způsobit problémy, jako je například pokus o zaslání odpovědi klientovi vícekrát, což by vedlo k chybě "Error: Can't set headers after they are sent".
// Pokud zavoláte return next();, vykonávání funkce middleware skončí po volání next(); a žádný další kód po return next(); se nevykoná.
const validateCsrf = async (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  const originHeader = req.headers.origin ?? null;
  const hostHeaders = appConfig.cors.origin ?? null; // je to pole, může obsahovat více hodnot
  // NOTE: You may need to use `X-Forwarded-Host` instead
  //const hostHeader = req.headers.host ?? null;
  if (!originHeader || !hostHeaders || !verifyRequestOrigin(originHeader, hostHeaders)) {
    return res.status(403).send({
      message: `Neplatný CSRF token nebo původ požadavku! (validateCsrf) - Origin: ${originHeader}, Host: ${hostHeaders.join(
        ","
      )}`,
    });
  }
  next();
};

// spoléhá na fakt že bude spuštěn až po vykonání middleware validateBearer který naplní locals.user
// je nutno definovat ve správném pořadí
const validateAdmin = async (req, res, next) => {
  if (res.locals.user?.admin === 1) {
    return next();
  } else
    return res.status(401).send({
      message: "Jsou vyžadována práva admin !",
    });
};

const validateSession = {
  //validateCookie: validateCookie,
  validateBearer: validateBearer,
  validateCsrf: validateCsrf,
  validateAdmin: validateAdmin,
};

export default validateSession;
