'use client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TestLogin = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    auth.testLogin();
    router.push('/home');
  });

  return <main className='h-full w-full'></main>;
};

export default TestLogin;