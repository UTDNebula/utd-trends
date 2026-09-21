## Testing

Tests are written with Jest. To run tests, type `npm run test`. **Tests should be run and passing when making or merging a PR.**

Test scripts are located in the `__tests__` folder.
Mock files necessary for the tests should be located in the `mocks` folder. Use mocks for any necessary data, but use the

Testing philosophy: test components with significant internal processing or logic. Keep tests as independent of details and implementation as possible.
