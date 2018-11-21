import sqlFormatter from 'sql-formatter';
import moment from "moment";
import _ from 'lodash';

export default (name = "", fields = {}, dataRows = [], opts = {}) => {

    let typesMap = {
        string: "VARCHAR(255)",
        number: "INT(10)"
    };

    let safe = (s) => s ? s : '';
    let transformStyle = (opts.style === 'camelCase' ? _.camelCase : (
        opts.style === 'snakeCase' ? _.snakeCase : (
            opts.style === 'upperCase' ? _.upperCase : (
                opts.style === 'lowerCase' ? _.lowerCase : (s) => s
            )
        )
    ));
    let transformFields = {};
    Object.keys(fields).forEach((field) => {
        if(opts.attributes.indexOf(field) !== -1) {
            transformFields[field] = fields[field];
        }
    });
    let transformDataRows = [];
    dataRows.forEach((row) => {
        let newRow = {};
        Object.keys(row.dataValues).forEach((field) => {
            if(opts.attributes.indexOf(field) !== -1 || field === 'field_data') {
                newRow[field] = row.dataValues[field];
            }
        });
        Object.keys(newRow.field_data).forEach((field) => {
            if(opts.attributes.indexOf(field) === -1) {
                delete newRow.field_data[field];
            }
        });
        transformDataRows.push(newRow);
    });

    console.log(transformDataRows);

    name = transformStyle(name);

    return (`-- Buat table
${sqlFormatter.format(`CREATE TABLE IF NOT EXISTS ${name} (
    -- Atribut sistem
    ${safe((opts.attributes.indexOf('id') !== -1) && `\`${transformStyle('id')}\` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,`)}
    ${safe((opts.attributes.indexOf('latitude') !== -1) && `\`${transformStyle('latitude')}\` DOUBLE,`)}
    ${safe((opts.attributes.indexOf('longitude') !== -1) && `\`${transformStyle('longitude')}\` DOUBLE,`)}
    ${safe((opts.attributes.indexOf('image') !== -1) && `\`${transformStyle('image')}\` TEXT,`)}
    ${safe((opts.attributes.indexOf('created_at') !== -1) && `\`${transformStyle('created_at')}\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`)}
    ${safe((opts.attributes.indexOf('updated_at') !== -1) && `\`${transformStyle('updated_at')}\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`)}

    -- Atribut terdefinisi
    ${Object.keys(transformFields).map((field) => {
        let column = field;
        let rawType = fields[field];
        let type = typesMap[rawType] ? typesMap[rawType] : rawType;
        return `\`${transformStyle(column)}\` ${type}`;
    }).join(',\n    ')}
);`)}


-- Data
${sqlFormatter.format(transformDataRows.map((row) => (
    `INSERT INTO \`${name}\` (
        -- Atribut sistem
        ${safe((opts.attributes.indexOf('id') !== -1) && `\`${transformStyle('id')}\`,`)}
        ${safe((opts.attributes.indexOf('latitude') !== -1) && `\`${transformStyle('latitude')}\`,`)}
        ${safe((opts.attributes.indexOf('longitude') !== -1) && `\`${transformStyle('longitude')}\`,`)}
        ${safe((opts.attributes.indexOf('image') !== -1) && `\`${transformStyle('image')}\`,`)}
        ${safe((opts.attributes.indexOf('created_at') !== -1) && `\`${transformStyle('created_at')}\`,`)}
        ${safe((opts.attributes.indexOf('updated_at') !== -1) && `\`${transformStyle('updated_at')}\`,`)}

        -- Atribut terdefinisi
        ${Object.keys(transformFields).map((field) => {
            return `\`${transformStyle(field)}\``;
        }).join(',\n    ')}
    ) VALUES (
        -- Atribut sistem
        ${safe((opts.attributes.indexOf('id') !== -1) && `${row.id}, `)}
        ${safe((opts.attributes.indexOf('latitude') !== -1) && `${row.latitude}, `)}
        ${safe((opts.attributes.indexOf('longitude') !== -1) && `${row.longitude}, `)}
        ${safe((opts.attributes.indexOf('image') !== -1) && `"${row.image}", `)}
        ${safe((opts.attributes.indexOf('created_at') !== -1) && `"${moment(row.created_at).format('YYYY-MM-DD h:mm:ss')}", `)}
        ${safe((opts.attributes.indexOf('updated_at') !== -1) && `"${moment(row.updated_at).format('YYYY-MM-DD h:mm:ss')}", `)}

        -- Atribut terdefinisi
        ${Object.keys(row.field_data).map((field) => (
            `"${row.field_data[field]}"`
        )).join(',\n    ')}
    )`
)).join(';\n'))}`);

}