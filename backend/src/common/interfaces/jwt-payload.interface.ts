import { Role } from '../enums/role.enum';

export interface JwtPayload {
  email: string;
  sub: string;
  role: Role;
}
