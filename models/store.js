/**
* File : ./models/Store.js
* Tanggal Dibuat : 11/22/2018, 1:29:12 PM
* Penulis : edgarjeremy
*/

export default (sequelize, DataTypes) => {

    const Store = sequelize.define("store", {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        location: {
            // type: DataTypes.GEOMETRY('POINT', 4326),
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        location_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: 'Tidak ada deskripsi'
        }
    }, {
            underscored: true
        });

    Store.associate = (models) => {
        const { User } = models;
        Store.belongsTo(User, { onDelete: 'cascade' });
    }

    return Store;

}