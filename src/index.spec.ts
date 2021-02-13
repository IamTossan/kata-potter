import {
    Book,
    DiscountGroups,
    BASE_BOOK_PRICE,
    getFinalPrice,
    getDiscountGroupings,
    equalizeGroupings,
} from '.';

describe('src/index', () => {
    describe('getDiscountGroupings', () => {
        it('should return an empty array', () => {
            expect(getDiscountGroupings([1, 1, 1])).toEqual({
                '2': [],
                '3': [],
                '4': [],
                '5': [],
            });
        });

        it('should return an array with a book grouping', () => {
            expect(getDiscountGroupings([0, 1])).toEqual({
                '2': [[0, 1]],
                '3': [],
                '4': [],
                '5': [],
            });
        });

        it('should return an array with a book grouping (with remainder)', () => {
            expect(getDiscountGroupings([0, 0, 1])).toEqual({
                '2': [[0, 1]],
                '3': [],
                '4': [],
                '5': [],
            });
        });

        it('should return an array with two book grouping (2 + 2)', () => {
            expect(getDiscountGroupings([0, 0, 1, 1])).toEqual({
                '2': [
                    [0, 1],
                    [0, 1],
                ],
                '3': [],
                '4': [],
                '5': [],
            });
        });

        it('should return an array with two book grouping (4 + 2)', () => {
            expect(getDiscountGroupings([0, 0, 1, 2, 2, 3])).toEqual({
                '2': [[0, 2]],
                '3': [],
                '4': [[0, 1, 2, 3]],
                '5': [],
            });
        });
    });

    describe('equalizeGroupings', () => {
        it('should modify the two last items', () => {
            const getBaseInput = (): DiscountGroups => {
                return {
                    '3': [[0, 1, 3]],
                    '4': [],
                    '5': [
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                    ],
                };
            };

            const initialInput = getBaseInput();
            const actualResult = equalizeGroupings(initialInput);

            const expectedResult = {
                '3': [],
                '4': [
                    [0, 1, 3, 4],
                    [0, 1, 3, 2],
                ],
                '5': [
                    [0, 1, 2, 3, 4],
                    [0, 1, 2, 3, 4],
                    [0, 1, 2, 3, 4],
                ],
            };
            expect(actualResult).toStrictEqual(expectedResult);
        });

        it('should not mutate the input', () => {
            const getBaseInput = (): DiscountGroups => {
                return {
                    '3': [[0, 1, 3]],
                    '4': [],
                    '5': [
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                        [0, 1, 2, 3, 4],
                    ],
                };
            };

            const initialInput = getBaseInput();
            equalizeGroupings(initialInput);

            expect(initialInput).toEqual(getBaseInput());
        });
    });

    describe('getFinalPrice', () => {
        describe('simple cases', () => {
            it('should return 0 when empty input', () => {
                expect(getFinalPrice([])).toEqual(0);
            });

            it('should return 8 when input has a 1 length (1)', () => {
                expect(getFinalPrice([1])).toEqual(BASE_BOOK_PRICE);
            });

            it('should return 8 when input has a 1 length (2)', () => {
                expect(getFinalPrice([2])).toEqual(BASE_BOOK_PRICE);
            });

            it('should return 8 when input has a 1 length (3)', () => {
                expect(getFinalPrice([3])).toEqual(BASE_BOOK_PRICE);
            });

            it('should return 8 when input has a 1 length (4)', () => {
                expect(getFinalPrice([4])).toEqual(BASE_BOOK_PRICE);
            });

            it('should return 8 * 3 when input has a 3 length', () => {
                expect(getFinalPrice([1, 1, 1])).toEqual(BASE_BOOK_PRICE * 3);
            });
        });

        describe('simple discounts', () => {
            it('should return a price with a 5% discount', () => {
                expect(getFinalPrice([0, 1])).toEqual(BASE_BOOK_PRICE * 2 * 0.95);
            });

            it('should return a price with a 10% discount', () => {
                expect(getFinalPrice([0, 2, 4])).toEqual(BASE_BOOK_PRICE * 3 * 0.9);
            });

            it('should return a price with a 20% discount', () => {
                expect(getFinalPrice([0, 1, 2, 4])).toEqual(BASE_BOOK_PRICE * 4 * 0.8);
            });

            it('should return a price with a 25% discount', () => {
                expect(getFinalPrice([0, 1, 2, 3, 4])).toEqual(BASE_BOOK_PRICE * 5 * 0.75);
            });
        });

        describe('several discounts', () => {
            it('should return a price with the correct discount (1)', () => {
                expect(getFinalPrice([0, 0, 1])).toEqual(
                    BASE_BOOK_PRICE + BASE_BOOK_PRICE * 2 * 0.95,
                );
            });

            it('should return a price with the correct discount (2)', () => {
                expect(getFinalPrice([0, 0, 1, 1])).toEqual(2 * (BASE_BOOK_PRICE * 2 * 0.95));
            });

            it('should return a price with the correct discount (3)', () => {
                expect(getFinalPrice([0, 0, 1, 2, 2, 3])).toEqual(
                    BASE_BOOK_PRICE * 4 * 0.8 + BASE_BOOK_PRICE * 2 * 0.95,
                );
            });

            it('should return a price with the correct discount (4)', () => {
                expect(getFinalPrice([0, 1, 1, 2, 3, 4])).toEqual(
                    BASE_BOOK_PRICE + BASE_BOOK_PRICE * 5 * 0.75,
                );
            });
        });

        describe('edge cases', () => {
            it('should return an optimized discounted price (4 + 4)', () => {
                expect(getFinalPrice([0, 0, 1, 1, 2, 2, 3, 4])).toEqual(
                    2 * (BASE_BOOK_PRICE * 4 * 0.8),
                );
            });

            it('should return an optimized discounted price (5 + 5 + 5 + 4 + 4)', () => {
                // (5 + 5 + 5 + 5 + 3) => price is 141.5
                // (5 + 5 + 5 + 4 + 4) => price is 141.2
                expect(
                    getFinalPrice([
                        ...(<Array<Book>>[0, 0, 0, 0, 0]),
                        ...(<Array<Book>>[1, 1, 1, 1, 1]),
                        ...(<Array<Book>>[2, 2, 2, 2]),
                        ...(<Array<Book>>[3, 3, 3, 3, 3]),
                        ...(<Array<Book>>[4, 4, 4, 4]),
                    ]),
                ).toEqual(3 * (BASE_BOOK_PRICE * 5 * 0.75) + 2 * (BASE_BOOK_PRICE * 4 * 0.8));
            });

            it('should return an optimized discounted price with 500+ items (perf test)', () => {
                // produces 50 * [0, 1, 2, 3, 4]
                const sizeAdded = 100;
                const bigPayload = <Book[]>Array(sizeAdded)
                    .fill(0)
                    .reduce(
                        (acc) =>
                            acc.concat(
                                Array(5)
                                    .fill(0)
                                    .map((_, idx) => idx),
                            ),
                        [],
                    );

                expect(
                    getFinalPrice([
                        ...bigPayload,
                        ...(<Array<Book>>[0, 0, 0, 0, 0]),
                        ...(<Array<Book>>[1, 1, 1, 1, 1]),
                        ...(<Array<Book>>[2, 2, 2, 2]),
                        ...(<Array<Book>>[3, 3, 3, 3, 3]),
                        ...(<Array<Book>>[4, 4, 4, 4]),
                    ]).toFixed(2),
                ).toEqual(
                    (
                        (sizeAdded + 3) * (BASE_BOOK_PRICE * 5 * 0.75) +
                        2 * (BASE_BOOK_PRICE * 4 * 0.8)
                    ).toFixed(2),
                );
            });
        });
    });
});
