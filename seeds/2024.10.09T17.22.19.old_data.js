import { readFileSync } from "fs";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import db from "../app/services/database.js";

export const up = async ({ context: queryInterface }) => {
  /*načteme data ze souboru, obsahuje pole*/
  const subscribers = JSON.parse(readFileSync("seeds/st_subscriber.json", "utf8")); // Načtení ze souboru
  for (const row of subscribers) {
    if (row.user_email) {
      // pokusíme se najít usera podle emailu, při existenci nevkládáme
      const user = await db.user.findOne({
        where: { email: row.user_email },
      });
      if (!user) {
        try {
          await db.sequelize.transaction(async (t) => {
            const hashedPassword = await new Argon2id().hash(row.user_email);
            const userId = generateId(15);
            console.log(row);
            // založíme usera
            await db.user.create(
              {
                id: userId,
                username: row.user_email,
                email: row.user_email,
                password: hashedPassword,
              },
              { transaction: t }
            );
            // založíme současně i subscribera
            await db.subscriber.create(
              {
                user_id: userId,
                username: row.user_email,
                email: row.user_email,
                disabled: 0,
                total: row.total_count,
                last_render_id: row.last_render_id,
                last_render_at: row.last_run,
              },
              { transaction: t }
            );
          });
        } catch (error) {
          // If the execution reaches this line, an error occurred.
          // The transaction has already been rolled back automatically by Sequelize!
          throw new Error(error.message);
        }
      }
    }
  }
};

export const down = async ({ context: queryInterface }) => {
  /*await queryInterface.dropTable("Test");*/
  /* down nepodporujeme*/
};
