'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PATH_DASHBOARD } from '@/routes/paths';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname)

  useEffect(() => {
    if (pathname == PATH_DASHBOARD.quiz.root) {
      router.push(PATH_DASHBOARD.root);
    }
  });

  return null;
}