import { LegalDocScreen } from "@/views/legal";
import { readLegalDoc } from "@/views/legal/lib/read-legal-doc";

export default function PrivacyPage() {
  const html = readLegalDoc("privacy-policy.md");
  return <LegalDocScreen title="개인정보 처리방침" html={html} />;
}
