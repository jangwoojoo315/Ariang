"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/shared/lib";

// 카카오 로그인 후 백엔드가 리다이렉트하는 콜백 페이지. UI 없음.
//
// 성공: location.hash 로 토큰 전달
//   /oauth/callback#accessToken=xxx&refreshToken=yyy&tokenType=Bearer&expiresIn=3600
// 실패: query string 으로 에러 전달
//   /oauth/callback?error=invalid_code | kakao_unavailable | missing_code
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 실패 케이스: ?error=...
    const search = new URLSearchParams(window.location.search);
    const error = search.get("error");
    if (error) {
      console.warn("카카오 로그인 실패:", error);
      router.replace("/");
      return;
    }

    // 성공 케이스: #accessToken=...&refreshToken=...&tokenType=Bearer&expiresIn=3600
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      setTokens(accessToken, refreshToken);
    }
    // 토큰 노출된 hash가 히스토리에 남지 않도록 replace로 홈 이동
    router.replace("/");
  }, [router]);

  return null;
}
