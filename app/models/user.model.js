export default (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.STRING(30),
      allowNull: false,
      primaryKey: true,
      comment: "jednoznačný identifikátor usera",
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "jméno usera",
    },
    email: {
      type: Sequelize.STRING,
      comment: "email usera",
    },
    password: {
      type: Sequelize.STRING,
      comment: "heslo - hash",
    },
    admin: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "příznak admina - 1/0",
    },
  });

  return User;
};
