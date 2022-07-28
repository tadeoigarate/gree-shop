const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define("product", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    image: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    valoration: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    disabled: {
        type: DataTypes.STRING,
        defaultValue: "no",
      },

    outsanding: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    count:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:1
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
