import { Database, NewUser, UpdateUser, User } from '../schema';
import { db } from '../client';

export class UserRepository {
    private static instance: UserRepository | null = null;

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    async createUser(userData: NewUser): Promise<User> {
        const result = await db
            .insertInto('users')
            .values(userData)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    async getUserById(id: number): Promise<User | undefined> {
        const result = await db
            .selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();
        return result;
    }

    async updateUser(id: number, userData: UpdateUser): Promise<User> {
        const result = await db
            .updateTable('users')
            .set({
                ...userData,
                updated_at: new Date().toISOString()
            })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    async updateLastSync(id: number, lastSync: string): Promise<void> {
        await db
            .updateTable('users')
            .set({
                last_sync: lastSync,
                updated_at: new Date().toISOString()
            })
            .where('id', '=', id)
            .execute();
    }

    async getLastSyncDate(id: number): Promise<string | null> {
        const result = await db
            .selectFrom('users')
            .select('last_sync')
            .where('id', '=', id)
            .executeTakeFirst();
        return result?.last_sync || null;
    }
}
