import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function RequireAuth({ children }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    api.get("/api/profile/me").then(() => setOk(true)).catch(() => {
      window.location.href = "/login";
    });
  }, []);
  return ok ? children : null;
}
