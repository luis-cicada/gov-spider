import { PrismaClient } from '@prisma/client'

export class DatabaseClient {
  public prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({ log: ['info', 'warn', 'error'] })
  }
}

// Singleton instance
export const dbClient = new DatabaseClient()
