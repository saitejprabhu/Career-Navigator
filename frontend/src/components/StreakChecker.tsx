"use client";
import { useEffect } from "react";
import api from "@/lib/api";

export default function StreakChecker() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .post(
          "/streak/check",
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .catch((err) => console.error("Streak check failed:", err));
    }
  }, []);

  return null; // renders nothing, just runs the effect
}
