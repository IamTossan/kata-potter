const BASE_BOOK_PRICE = 8;
const DISCOUNTS: { [i: number]: number } = {
    2: 5 / 100,
    3: 10 / 100,
    4: 20 / 100,
    5: 25 / 100,
};

type DiscountGroups = {
    [i: string]: Book[][];
};
type Book = 0 | 1 | 2 | 3 | 4;

const equalizeGroupings = (groupings: DiscountGroups) => {
    const groupingsCopy = Object.assign(
        { '2': [], '3': [], '4': [], '5': [] },
        JSON.parse(JSON.stringify(groupings)),
    );

    while (groupingsCopy[3].length && groupingsCopy[5].length) {
        const x = groupingsCopy[5].pop();
        const y = groupingsCopy[3].pop();
        for (let i = 0; i < x.length; i += 1) {
            if (!y.includes(x[i])) {
                y.push(x[i]);
                x.splice(i, 1);
                groupingsCopy[4].push(x, y);
                break;
            }
        }
    }

    return groupingsCopy;
};

const getDiscountGroupings = (a: Array<Book>): DiscountGroups => {
    const discounts: DiscountGroups = { '2': [], '3': [], '4': [], '5': [] };

    const uniqA = [...new Set(a)];
    if (uniqA.length === 1) {
        return discounts;
    }

    const hasDuplicates = uniqA.length !== a.length;
    if (!hasDuplicates) {
        discounts[a.length] = [a];
        return discounts;
    }

    const pool = [...a];
    let selectedValues: Array<Book> = [];

    while (pool.length > 1) {
        const curDiscount: Array<Book> = [];

        // make grouping
        for (let i = 0; i < pool.length; i++) {
            if (!curDiscount.includes(pool[i])) {
                curDiscount.push(pool[i]);
                selectedValues.push(pool[i]);
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
        discounts[curDiscount.length].push(curDiscount);
    }
    return discounts;
};

const getDiscount = (discountGroups: DiscountGroups): number => {
    return Object.keys(discountGroups).reduce((acc, cur) => {
        return (
            acc +
            discountGroups[cur].length * Number(cur) * BASE_BOOK_PRICE * DISCOUNTS[Number(cur)]
        );
    }, 0);
};

const getBasePrice = (booksAmount: number) => booksAmount * BASE_BOOK_PRICE;

const getFinalPrice = (a: Array<Book>): number => {
    if (!a.length) {
        return 0;
    }

    const basePrice = getBasePrice(a.length);

    if (a.length === 1) {
        return basePrice;
    }

    const books = [...a].sort();
    const curDiscount = getDiscountGroupings(books);
    const discount = getDiscount(equalizeGroupings(curDiscount));

    return basePrice - discount;
};

export {
    // types
    Book,
    DiscountGroups,
    // main exports
    BASE_BOOK_PRICE,
    getFinalPrice,
    getDiscountGroupings,
    equalizeGroupings,
};
