const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
    // defino el modelo
  sequelize.define("user", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
      },

      profile_img: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "https://i.imgur.com/UOk3zAg.png",
      },

      is_admin: {
        type: DataTypes.STRING,
        defaultValue: 'no',
      },

      disabled: {
        type: DataTypes.STRING,
        defaultValue: "no",
      },

      password: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
  })
}
