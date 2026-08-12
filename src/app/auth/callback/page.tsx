"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/shared/lib";

// OAuth 로그인 후 백엔드가 리다이렉트하는 콜백 페이지.
// URL 쿼리스트링(?accessToken=...&refreshToken=...)에서 토큰을 꺼내
// 저장한 뒤 홈으로 이동한다. 별도 UI는 없다.
//
// 백엔드 스펙 확정 시 변경 지점:
// - 파라미터 이름(accessToken/refreshToken)
// - 전달 방식(쿼리 → 프래그먼트/쿠키)이 바뀌면 파싱부만 수정
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      setTokens(accessToken, refreshToken);
      // 뒤로가기로 콜백 URL(토큰 노출)로 돌아오지 않도록 replace 사용
      router.replace("/");
    } else {
      // 토큰이 없으면 로그인 실패로 간주하고 홈(로그인 게이트)으로
      router.replace("/");
    }
  }, [router]);

  return null;
}
