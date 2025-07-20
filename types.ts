
export interface IpInfo {
  ip: string;
  ip_number: string;
  ip_version: number;
  country_name: string;
  country_code2: string;
  isp: string;
  response_code: string;
  response_message: string;
}

export interface FetchedIpData {
  status: 'success' | 'error';
  ip: string;
  country_name?: string;
  country_code2?: string;
  isp?: string;
  errorMessage?: string;
}
