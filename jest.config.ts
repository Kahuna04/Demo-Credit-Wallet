module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.spec.json', // Moved from globals to here
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@types|demo-wallet-app)/)'
  ],
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
  