import nextSession from "next-session";
import { expressSession, promisifyStore } from "next-session/lib/compat";
import RedisStoreFactory from "connect-redis";
import Redis from "ioredis";
import {SessionData} from 'next-session/lib/types';

const RedisStore = RedisStoreFactory(expressSession);
export const getSession = nextSession<SessionData>({
    store: promisifyStore(
        new RedisStore({
            client: new Redis(),
        })
    ),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});
