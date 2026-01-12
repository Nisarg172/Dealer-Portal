import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { RequestPayload } from '@/types/common.types';

const JWT_SECRET = process.env.JWT_SECRET;

export const getAdminIdFromAuth= async() => {
  const token = cookies().get('auth_token')?.value;
  if (!token || !JWT_SECRET) {
    return null;
  }
  try {
    const {payload}: {payload: RequestPayload} = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    return payload; 
  } catch (error) {
    console.error('Error verifying token in admin categories API:', error);
    return null;
  }
}