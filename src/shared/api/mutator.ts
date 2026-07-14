import type { AxiosRequestConfig } from 'axios';
import { apiInstance } from './instance';

// orval이 생성한 클라이언트에서 사용하는 mutator.
// apiInstance를 감싸 응답 data만 반환하며, 요청/응답 인터셉터가 그대로 적용된다.
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> =>
  apiInstance(config).then(({ data }) => data);

export default customInstance;
