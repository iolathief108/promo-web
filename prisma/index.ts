// import { PrismaClient } from '@prisma/client'
// export const prisma = new PrismaClient()
import { PrismaClient, Prisma } from '@prisma/client'

let prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {
    // @ts-ignore
    if (!global.prisma) {
        // @ts-ignore
        global.prisma = new PrismaClient()
    }
    // @ts-ignore
    prisma = global.prisma
}

export {
    prisma
}
