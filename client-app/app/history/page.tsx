// page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthenticateStore from "@/lib/store/authenticate.store";
import HistoryItem from "@/components/items/history_item";
import { getHistory } from "./action";
import { Query } from "@/lib/schema/data/query.schema";
import Loader from "@/components/layout/loader";
import Pagination from "@/components/pagination/Pagination";

export default function HistoryPage() {
  return (
    <Suspense fallback={<Loader />}>
      <HistoryPageContent />
    </Suspense>
  );
}

function HistoryPageContent() {
  const router = useRouter();
  const { isAuthenticated, ensuredInitialized } = useAuthenticateStore();
  const [historyData, setHistoryData] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [totalItems, setTotalItems] = useState(0);
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    ensuredInitialized().then(() => {
      const access_token = localStorage.getItem("access_token");
      if (access_token) {
        getHistory(access_token, page)
          .then((data) => {
            const { histories, total } = data;
            setHistoryData(histories);
            setTotalItems(total);
          })
          .catch((error) => {
            setError(error.message);
            router.push("/login");
          })
          .finally(() => setLoading(false));
      } else {
        setError("Access token is missing");
        setLoading(false);
      }
    });
  }, [isAuthenticated, page]);

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
      <Pagination
        currentPage={page}
        itemsPerPage={10}
        totalItems={totalItems}
        onPageChange={(page) => {
          router.push(`?page=${page}`);
        }}
      />
    </div>
  );
}
