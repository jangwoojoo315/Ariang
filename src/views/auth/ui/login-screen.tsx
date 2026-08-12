"use client";

interface Props {
  onLogin: () => void;
}

// 로그인이 필요한 메뉴(내 여행·설정) 진입 시 노출되는 로그인 게이트 화면.
export function LoginScreen({ onLogin }: Props) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 56 }}>🌿</div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: -1,
            color: "var(--logo)",
          }}
        >
          아이랑
        </div>
        <div
          style={{
            color: "var(--text2)",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 4,
          }}
        >
          아이와 함께하는
          <br />
          생태여행을 시작해요
        </div>
      </div>

      <div
        style={{
          paddingBottom: 48,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "var(--text2)",
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          SNS 계정으로 시작하기
        </div>
        <button
          onClick={onLogin}
          aria-label="카카오로 시작"
          style={{
            width: "100%",
            maxWidth: 360,
            height: 54,
            border: "none",
            cursor: "pointer",
            backgroundColor: "transparent",
            backgroundImage: "url(/kakao_login_medium_narrow.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        />
      </div>
    </div>
  );
}
