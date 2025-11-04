import { Injectable } from '@nestjs/common';
import {hash, compare } from 'bcrypt';

@Injectable()
export class BcryptService {
      async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await hash(password, saltRounds);
    }
    async comparePassword(Password: string, hashedPassword: string): Promise<boolean> {
        return await compare(Password, hashedPassword);
    }
}
