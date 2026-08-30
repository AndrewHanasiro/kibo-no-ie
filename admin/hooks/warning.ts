import { useState, useEffect, useCallback } from "react";
import { auth } from "../lib/firebase";

export type Warning = {
  id: string;
  text: string;
  timestamp: string;
};

const useWarnings = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWarnings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listWarning`,
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = (await response.json()) satisfies Warning[];
      setWarnings(data);
    } catch (err) {
      console.error("Error fetching warnings:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWarning = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteWarning`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }
      );

      if (response.ok) {
        fetchWarnings();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  };

  const createWarning = async (text: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/createWarning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (response.ok) {
        fetchWarnings();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Create failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchWarnings();
    };
    load();
  }, [fetchWarnings]);

  return { warnings, loading, error, refetch: fetchWarnings, deleteWarning, createWarning };
};

export default useWarnings;
