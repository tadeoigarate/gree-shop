const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('orderline', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		amount: {  // debería ser como una foto del precio que viene de product para hacerlo persistente en el tiempo....
			type: DataTypes.DECIMAL,
			allowNull: false,
		},
		quantity: { // cantidad de producto q viene de la asociacion de products 
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		}

	},{ timestamps: false })
}