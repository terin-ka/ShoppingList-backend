import { Sequelize } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addIndex("image", {
    name: "idx_image_render_id_render_at",
    fields: [{ name: "render_id" }, { name: "render_at" }],
  });
};

export const down = async ({ context: queryInterface }) => {
  try {
    await queryInterface.removeIndex("image", "idx_image_render_id_render_at");
  } catch (e) {
    console.log(e.message);
  }
};
