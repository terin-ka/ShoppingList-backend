import express from "express";
import cors from "cors";
//import cookieParser from "cookie-parser";
//import { appConfig } from "./config/config.js"; // Načtení konfigurace
//import userAPIRoutes from "./app/routes/user.routes.js"; // user routes
//import authRoutes from "./app/routes/auth.routes.js"; // authorization routes user + password
//import googleRoutes from "./app/routes/google.routes.js"; // authorization routes + google oAuth2
//import adminRoutes from "./app/routes/admin.routes.js"; // admin- pro dashboard

import listRouter from "./app/routes/list.routes.js";
import loginRouter from "./app/routes/login.routes.js";


const app = express();
// cors protection
// aby requesty z klienta přes axios obsahovaly také cookies potřebné k autorizaci tak musí mít axios nastaveno v konfiguraci withCredentials = true
// toto vyvolá potřebu nastavit i na backendu v cors credentials:true - header response pak obsahuje Access-Control-Allow-Credentials: true
// pokud toto není nastaveno tak na klientovi dochází ke cors error
// více https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// https://www.dhiwise.com/post/managing-secure-cookies-via-axios-interceptors
// https://web.dev/articles/cross-origin-resource-sharing

// do api se přistupuje  z klientské aplikace a z aplikace dashboardu
// proto je v konfiguraci parametr cors.origin zadáno jako pole které obsahuje url jak klienta , tak i dashboardu
// konfigurace je pak dynamicky pomocí funkce
/*let whitelist = appConfig.cors.origin || ["*"];
var corsOptions = {
  origin: function (origin, callback) {
    // doplní do headeru response Access-Control-Allow-Origin: https://foo.example
    // přesměrování do checkout neobsahuje header origin - proto ošetříme undefined
    if (whitelist.indexOf(origin) !== -1 || typeof origin === "undefined") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  //credentials: true, // doplní do headeru response Access-Control-Allow-Credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());

// zpřístupníme static file, použijeme je k zobrazení vzorových obrázků v galerii, umístíme před basicAuth
app.use(express.static("public"));
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));*/

app.use(express.json());
app.use(cors());

// simple route
app.get("/", (_, res) => {
  res.send("Welcome to Express application.");
});

app.use("/list", listRouter);
app.use("/login", loginRouter);

//app.use("/api/user", userAPIRoutes);
//app.use("/api/auth", authRoutes);
//app.use("/api/admin", adminRoutes);
//app.use("/login/google", googleRoutes);

app.set("port", process.env.PORT || 8082);
app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}`);
});


