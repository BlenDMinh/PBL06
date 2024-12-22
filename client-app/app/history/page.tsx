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
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error">Error</h2>
            <p>{error}</p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl font-bold mb-6">History</h1>
            {historyData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-base-content/70">
                  No history items found.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {historyData.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </div>
            )}
            <div className="card-actions justify-center mt-6">
              <Pagination
                currentPage={page}
                itemsPerPage={10}
                totalItems={totalItems}
                onPageChange={(page) => {
                  router.push(`?page=${page}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
