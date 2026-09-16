/**
 * TourAPI 설명문 정리.
 *
 * 원문에는 `<br />` 같은 HTML 태그와, 줄바꿈이 아니라 문자 그대로인 `\n`이 섞여 있어
 * 화면에 그대로 노출된다. 태그·이스케이프를 실제 줄바꿈으로 바꾸고 나머지 태그는 지운다.
 * (렌더하는 쪽에서 `white-space: pre-line`이어야 줄바꿈이 보인다)
 */
export function cleanTourText(raw: string | null | undefined): string {
  if (!raw) return "";
  return (
    raw
      // 문자열로 들어온 이스케이프 → 실제 줄바꿈
      .replace(/\\r\\n|\\n|\\r/g, "\n")
      .replace(/\\t/g, " ")
      // 줄바꿈 의미를 가진 태그
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/?\s*p[^>]*>/gi, "\n")
      // 나머지 태그 제거
      .replace(/<[^>]+>/g, "")
      // HTML 엔티티 (&amp;는 이중 복원을 막으려고 마지막에)
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/gi, "&")
      // 공백·빈 줄 정리
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()
  );
}
