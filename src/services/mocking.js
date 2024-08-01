import { faker } from '@faker-js/faker';

export const generateMockProducts = (num) => {
    let products = [];
    for (let i = 0; i < num; i++) {
        products.push({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            price: faker.commerce.price(),
            description: faker.commerce.productDescription(),
            category: faker.commerce.department(),
            image: faker.image.url()
        });
    }
    return products;
};