import { LegalDocScreen } from "@/views/legal";
import { readLegalDoc } from "@/views/legal/lib/read-legal-doc";

export default function TermsPage() {
  const html = readLegalDoc("terms-of-service.md");
  return <LegalDocScreen title="서비스 이용약관" html={html} />;
}
