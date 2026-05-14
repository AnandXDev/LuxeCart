import { useState, useEffect } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.data.orders || []);
    } catch (err: any) {
      console.error(err);
      setOrdersError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchOrders();
    }
  }, []);

  return {
    orders,
    loadingOrders,
    ordersError,
    refreshOrders: fetchOrders,
  };
};