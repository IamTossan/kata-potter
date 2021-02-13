const BASE_BOOK_PRICE = 8;
const DISCOUNTS = {
    '2': 5 / 100,
    '3': 10 / 100,
    '4': 20 / 100,
    '5': 25 / 100,
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

const getDiscount = (discountGroups: Book[][]) => {
    return discountGroups.reduce(
        (acc, cur) =>
            acc +
            cur.length * BASE_BOOK_PRICE * DISCOUNTS[String(cur.length) as Exclude<0 | 1, Book>],
        0,
    );
};

const getBasePrice = (booksAmount: number) => booksAmount * BASE_BOOK_PRICE;

const getFinalPrice = (a: Array<Book>): number => {
    if (!a.length) {
        return 0;
    }

    if (a.length === 1) {
        return BASE_BOOK_PRICE;
    }

    const books = [...a].sort();
    const discounts = Object.keys(DISCOUNTS)
        .map(Number)
        .map((maxSize) => {
            const curDiscount = getDiscountGroupings(books, maxSize);

            if (!curDiscount.length) {
                return getBasePrice(books.length);
            }
            if (curDiscount.length === 1) {
                return getBasePrice(books.length) - getDiscount(curDiscount);
            }

            const normalDiscount = getDiscount(curDiscount);
            const modifiedDiscount = getDiscount(equalizeGroupings(curDiscount));

            return getBasePrice(books.length) - Math.max(normalDiscount, modifiedDiscount);
        });

    return Math.min(...discounts);
};

export {
    // types
    Book,
    // main exports
    BASE_BOOK_PRICE,
    getFinalPrice,
    getDiscountGroupings,
    equalizeGroupings,
};
