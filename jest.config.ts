module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@types|demo-wallet-app)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.spec.json',
    },
  },
};
  
  // module.exports = {
  //   preset: 'ts-jest',
  //   testEnvironment: 'node',
  //   globals: {
  //     'ts-jest': {
  //       tsconfig: 'tsconfig.json',
  //     },
  //   },
  // };
  