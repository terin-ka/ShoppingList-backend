export default (sequelize, Sequelize) => {
  const OAuthAccount = sequelize.define(
    "oauth_account",
    {
      provider_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true,
        comment: "enum providera",
      },
      provider_user_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true,
        comment: "jednoznačný identifikátor v systému providera",
      },
      user_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment: "identifikátor usera",
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      indexes: [
        {
          name: "idx_oauth_user_id",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );

  return OAuthAccount;
};
