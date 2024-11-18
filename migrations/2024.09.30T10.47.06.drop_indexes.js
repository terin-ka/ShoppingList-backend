import { Sequelize } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  /* odstraníme nepotřebné indexy vzniklé po změnách v modelech*/
  /* sequelize neposkytuje podporu pro kontrolu zda index existuje proto výjimky pohltíme*/
  try {
    await queryInterface.removeIndex("image", "idx_images_render");
  } catch (e) {
    console.log(e.message);
  }

  try {
    await queryInterface.removeIndex("invoice", "invoice_customer");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("invoice", "invoice_payment_intent");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("invoice", "invoice_subscription");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("nolog", "nolog_idx_last_render_id");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("nolog_image", "idx_nolog_images_render");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("render_paid", "render_paid_customer");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("render_paid", "render_paid_subscription");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("render_paid", "render_payment_intent");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("render_paid", "invoice");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("render_paid", "invoice_2");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("subscriber", "subscriber_customer");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("subscriber", "subscriber_last_render_id");
  } catch (e) {
    console.log(e.message);
  }
  try {
    await queryInterface.removeIndex("subscription", "subscription_customer");
  } catch (e) {
    console.log(e.message);
  }
};

export const down = async ({ context: queryInterface }) => {
  /*await queryInterface.dropTable("Test");*/
  /* revert není podporován*/
};
