import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe, adminLogin, adminLogout } from "@/lib/api";

export function useAdminAuth() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: adminMe,
    staleTime: 60_000,
    retry: false,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-me"] });

  return {
    loading: isLoading,
    authenticated: !!data?.authenticated,
    email: data?.email ?? null,
    login: async (email: string, password: string) => { await adminLogin(email, password); await refresh(); },
    logout: async () => { await adminLogout(); await refresh(); },
  };
}
