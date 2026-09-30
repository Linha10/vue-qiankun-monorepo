import type { AxiosInstance } from "axios";

const createAuthApi = (request: AxiosInstance) => {
  return {
    async login(payload: { account: string; password: string }) {
      const res = await request.post("/v1/accounts/login", payload);
      const { accessToken, refreshToken, accountId } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accountId", accountId);
      return res.data;
    },
    async logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accountId");
    },
  };
};

export default createAuthApi;
