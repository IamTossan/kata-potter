const BASE_BOOK_PRICE = 8;
const DISCOUNTS = {
    '2': 1 - 0.05, // 5% discount
    '3': 1 - 0.1, // 10% discount
    '4': 1 - 0.2, // 20% discount
    '5': 1 - 0.25, // 25% discount
};

type Book = 0 | 1 | 2 | 3 | 4;

const equalizeGroupings = (groupings: Book[][]) => {
    const groupingsCopy = [...groupings.map((group) => [...group])];
    const x = groupingsCopy[groupingsCopy.length - 2];
    const y = groupingsCopy[groupingsCopy.length - 1];

    if (x.length - y.length >= 2) {
        for (let i = 0; i < x.length; i += 1) {
            if (!y.includes(x[i])) {
                y.push(x[i]);
                x.splice(i, 1);
                break;
            }
        }
    }

    return groupingsCopy;
};

const getDiscountGroupings = (a: Array<Book>, maxSize: number = 5): Book[][] => {
    const uniqA = [...new Set(a)];
    if (uniqA.length === 1) {
        return [];
    }
    const hasDuplicates = uniqA.length !== a.length;
    if (!hasDuplicates) {
        return [a];
    }

    const discounts: Book[][] = [];

    const pool = [...a];
    let selectedValues: Array<Book> = [];

    while (pool.length) {
        const curDiscount: Array<Book> = [];

        // make grouping
        for (let i = 0; i < pool.length; i++) {
            if (!curDiscount.includes(pool[i])) {
                curDiscount.push(pool[i]);
                selectedValues.push(pool[i]);
            }
            if (selectedValues.length === maxSize) {
                break;
            }
        }

        // update pool
        selectedValues.forEach((val) =>
            pool.splice(
                pool.findIndex((book) => book === val),
                1,
            ),
        );
        selectedValues = [];

        // it means no grouping
        if (curDiscount.length === 1) {
            break;
        }

        // commit grouping
        discounts.push(curDiscount);

        // it means no more grouping possible
        if (a.length - discounts.reduce((acc, cur) => acc + cur.length, 0) <= 1) {
            break;
        }
    }
    return discounts;
};

const getPrice = (discountGroups: Book[][], totalBookAmount: number) => {
    const discountedPrice = discountGroups.reduce(
        (acc, cur) =>
            acc +
            cur.length * BASE_BOOK_PRICE * DISCOUNTS[String(cur.length) as Exclude<0 | 1, Book>],
        0,
    );

    return (
        discountedPrice +
        (totalBookAmount - discountGroups.reduce((acc, cur) => acc + cur.length, 0)) *
            BASE_BOOK_PRICE
    );
};

const getLowestPrice = (a: Array<Book>): number => {
    if (!a.length) {
        return 0;
    }

    const books = [...a].sort();

    if (books.length === 1) {
        return BASE_BOOK_PRICE;
    }

    const discounts = Object.keys(DISCOUNTS)
        .map(Number)
        .map((maxSize) => {
            const curDiscount = getDiscountGroupings(books, maxSize);

            if (!curDiscount.length) {
                return BASE_BOOK_PRICE * books.length;
            }
            if (curDiscount.length === 1) {
                return getPrice(curDiscount, books.length);
            }

            const normalPrice = getPrice(curDiscount, books.length);
            const modifiedGroupsPrice = getPrice(equalizeGroupings(curDiscount), books.length);

            return Math.min(normalPrice, modifiedGroupsPrice);
        });

    return Math.min(...discounts);
};

export {
    // types
    Book,
    // main exports
    BASE_BOOK_PRICE,
    getLowestPrice,
    getDiscountGroupings,
    equalizeGroupings,
};
