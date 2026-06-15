import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'Roshan Perera',
    email: 'admin@exploreceylon.lk',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-customer',
    name: 'Alice Johnson',
    email: 'tourist@exploreceylon.lk',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-guide',
    name: 'Dilan Silva',
    email: 'guide@exploreceylon.lk',
    role: 'guide',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  }
];
