import faker from "faker";
import _ from 'lodash';
import utils from "./core/utils";

faker.locale = "id_ID";

export default {
    default_times: 30,
    entities: {
        User: {
            name: faker.name.findName,
            email: faker.internet.email,
            password: () => utils.hash(faker.internet.password()),
            type: () => 'user',
            avatar: () => 'base64',
            active: () => 1
        },
        Store: {
            name: faker.commerce.department,
            location: faker.address.latitude,
            location_text: faker.address.streetName,
            description: faker.lorem.lorem,
            user_id: () => 1
        }
    }
};