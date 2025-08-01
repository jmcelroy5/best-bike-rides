import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from './generated/prisma';

// Mock Prisma Client
jest.mock('./generated/prisma', () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

declare global {
  var __PRISMA__: DeepMockProxy<PrismaClient>;
}

export const prismaMock = mockDeep<PrismaClient>();
global.__PRISMA__ = prismaMock;