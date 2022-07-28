const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
    // defino el modelo
  sequelize.define("review", {
    reviewId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    review: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    valoration: {
        type: DataTypes.ENUM('1', '2', '3', '4', '5'),
        allowNull: false,
      },
  })
}