// useDashboardStats.js
import { useEffect, useState } from "react";
import api from "../api/api";

export default function useDashboardStats() {
  const [stats, setStats] = useState({});

  const loadStats = async () => {
    const res = await api.get("/dashboard/stats");
    setStats(res.data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, reload: loadStats };
}
