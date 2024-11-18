export default (sequelize, Sequelize) => {
  const UserSession = sequelize.define(
    "user_session",
    {
      id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true,
        comment: "jednoznačný identifikátor session",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "čas vypršení session session",
      },
      user_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      indexes: [
        {
          name: "idx_session_user_id",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );

  return UserSession;
};
