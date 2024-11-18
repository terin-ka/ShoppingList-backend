import { Sequelize } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("invoice", "number", {
    type: Sequelize.STRING(30),
    comment: "číslo faktury, identifikátor použitý v emailu",
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("invoice", "number");
};
