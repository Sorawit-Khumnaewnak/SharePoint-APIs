import axios from 'axios';
import { Injectable } from '@nestjs/common';

export interface TokenResponse {
  token_type: string;
  scope?: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
}

@Injectable()
export class AuthService {
  private getTenantId(): string {
    const tenant = process.env.SHAREPOINT_TENANT_ID;
    if (!tenant) throw new Error('Missing SHAREPOINT_TENANT_ID');
    return tenant;
  }

  private getClientId(): string {
    const cid = process.env.SHAREPOINT_CLIENT_ID;
    if (!cid) throw new Error('Missing SHAREPOINT_CLIENT_ID');
    return cid;
  }

  async exchangeAssertionForToken(assertion: string): Promise<TokenResponse> {
    const tenantId = this.getTenantId();
    const clientId = this.getClientId();
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const form = new URLSearchParams();
    form.set('grant_type', 'client_credentials');
    form.set('client_id', clientId);
    form.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    form.set('client_assertion', assertion);
    form.set('scope', 'https://graph.microsoft.com/.default');
    try {
      const { data } = await axios.post<TokenResponse>(tokenUrl, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    } catch (err: any) {
      const status = err?.response?.status ?? 400;
      const details = err?.response?.data ?? err?.message ?? 'Token request failed';
      // eslint-disable-next-line no-console
      console.error('Azure AD token error:', details);
      throw err;
    }
  }
}


