import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { parse } from 'pg-connection-string';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        // build the connection string ourselves if `DATABASE_URL` wasn't
        // expanded by dotenv (dotenv doesn't expand by default).
        let url = process.env.DATABASE_URL;

        if (!url) {
            const {
                DATABASE_USER,
                DATABASE_PASSWORD,
                DATABASE_HOST,
                DATABASE_PORT,
                DATABASE_NAME,
            } = process.env;

            if (
                !DATABASE_USER ||
                !DATABASE_PASSWORD ||
                !DATABASE_HOST ||
                !DATABASE_PORT ||
                !DATABASE_NAME
            ) {
                throw new Error('Missing database environment variables');
            }

            url = `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public` as string;
        }

        const cfg = parse(url);

        if (cfg.password != null) {
            cfg.password = String(cfg.password);
        }

        const adapter = new PrismaPg(cfg);
        super({ adapter });
    }
}
