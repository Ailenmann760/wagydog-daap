'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        const token = localStorage.getItem('adminToken');
        if (token) {
            router.push('/admin/dashboard');
        } else {
            router.push('/admin/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );
}
