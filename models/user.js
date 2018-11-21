import utils from '../core/utils';

export default (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(191),
            unique: {
                args: true,
                msg: 'Email sudah terdaftar. Cek kembali inbox email anda untuk kode verifikasi'
            },
            validate: {
                isEmail: {
                    args: true,
                    msg: 'Field email harus merupakan email yang valid'
                }
            },
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(191),
            validate: {
                len: {
                    args: [8, 42],
                    msg: 'Panjang password minimal harus 8 karakter'
                }
            },
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(['administrator', 'user']),
            allowNull: false
        },
        avatar: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verify_code: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        last_login: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    }, {
            underscored: true
        });


    // Hooks
    User.beforeCreate((user, options) => {
        user.password = utils.hash(user.password);
    });
    User.beforeUpdate((user, options) => {
        user.password = utils.hash(user.password);
    });

    User.associate = (models) => {
        const { Token } = models;
        User.hasMany(Token, { onDelete: 'cascade' });
    }

    return User;
}