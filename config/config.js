import dotenv from "dotenv"; // načtení konfiguace ze souboru config.json - zde je to ještě před prvním použitím,Node.js to sám neudělá
dotenv.config(); // vloží hodnoty ze souboru .env do process.env
import { dbaConfig } from "./config.db.js";

const envDb = process.env.CONFIG_DB || "mongo_tereza"; // Získání názvu aktuální konfigurace prostředí - databáze
export const dbConfig = dbaConfig[envDb]; // konfigurace databáze je uložena v js souboru, je dynamická - dochází tam k načtení certifikátu
