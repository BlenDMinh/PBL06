// page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthenticateStore from '@/lib/store/authenticate.store';
import HistoryItem from '@/components/items/history_item';
import { getHistory } from './action';
import { Query } from '@/lib/schema/data/query.schema';
import Loader from '@/components/layout/loader';

export default function HistoryPage() {
    const { isAuthenticated, ensuredInitialized } = useAuthenticateStore();
    const router = useRouter();
    const [historyData, setHistoryData] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ensuredInitialized().then(() => {

            const access_token = localStorage.getItem('access_token');
            if (access_token) {
                getHistory(access_token)
                    .then((data) => setHistoryData(data || []))
                    .finally(() => setLoading(false));
            } else {
                setError('Access token is missing');
                setLoading(false);
            }

        });
    }, [isAuthenticated]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">History</h1>
            <div className="space-y-4">
                {historyData.map((item) => (
                    <HistoryItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}