import axios, { AxiosError } from 'axios';

export const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'il-deung-haja',
  },
});

// 요청 인터셉터: 액세스 토큰 주입
apiInstance.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터: 401 시 토큰 갱신 처리
apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;

    // 로그인 상태(refreshToken 보유)에서 401일 때만 갱신/리다이렉트를 시도한다.
    // 비로그인 사용자가 홈·탐색에서 받는 401은 무시 → 강제 이동/루프 방지.
    if (error.response?.status === 401 && originalRequest && refreshToken) {
      try {
        // 저장해둔 refreshToken으로 새 토큰 쌍 발급 (accessToken 1시간 만료)
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'X-API-KEY': 'il-deung-haja' } },
        );

        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiInstance(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // 이미 홈이면 리다이렉트하지 않아 새로고침 루프를 막는다.
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  },
);
