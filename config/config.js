import dotenv from "dotenv"; // načtení konfiguace ze souboru config.json - zde je to ještě před prvním použitím,Node.js to sám neudělá
dotenv.config(); // vloží hodnoty ze souboru .env do process.env
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
// konfigurace databáze je uložena v js souboru, je dynamická - dochází tam k načtení certifikátu
import { dbaConfig } from "./config.db.js";

// Získání __dirname ekvivalentu v ES modulech
// vrátí "C:\\MySource\\AIStaging\\backend\\config"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ostatní konfigurace jsou statické json soubory
const configPath = path.join(__dirname, "config.json");
const configOAuthPath = path.join(__dirname, "config.oauth.json");

const env = process.env.CONFIG || "development"; // Získání názvu aktuální konfigurace prostředí
const envOAuth = process.env.CONFIG_OAUTH || "development"; // Získání názvu aktuální konfigurace prostředí - oAuth
const envDb = process.env.CONFIG_DB || "local"; // Získání názvu aktuální konfigurace prostředí - databáze

const cfg = JSON.parse(readFileSync(configPath, "utf8")); // Načtení konfigurace ze souboru config.json
const cfgOAuth = JSON.parse(readFileSync(configOAuthPath, "utf8")); // Načtení konfigurace ze souboru config.json
//export const sslcert = readFileSync(sslPath); // Exportování certifikátu pro připojení databáze
export const appConfig = cfg[env]; // Exportování konfigurace pro aktuální prostředí
export const oauthConfig = cfgOAuth[envOAuth]; // Načtení konfigurace ze souboru config.auth.json
export const dbConfig = dbaConfig[envDb]; // konfigurace databáze je uložena v js souboru, je dynamická - dochází tam k načtení certifikátu
