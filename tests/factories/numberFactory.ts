import { faker } from '@faker-js/faker'

export default async function numberFactory() {
    return {
        random: faker.datatype.number()
    }
}