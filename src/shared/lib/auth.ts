// JWT 토큰 저장/조회/삭제 유틸.
// 저장소·키를 여기 한 곳에 모아두어 이후 쿠키 등으로 바꾸기 쉽게 한다.
// (instance.ts의 인터셉터도 동일 키를 사용)

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
// 같은 탭 안에서의 토큰 변경을 구독자에게 알리기 위한 커스텀 이벤트.
// (localStorage의 'storage' 이벤트는 다른 탭에서만 발생하므로 별도로 필요)
const AUTH_CHANGE_EVENT = 'auth-change';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string | null) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

// useSyncExternalStore용 구독 함수: 같은 탭(auth-change)·다른 탭(storage) 변경 모두 감지.
export function subscribeAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
