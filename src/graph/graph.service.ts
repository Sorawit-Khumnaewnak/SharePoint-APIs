import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GraphService {
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0/drives';
  constructor() {}

  private ensureAccessToken(accessToken?: string): string {
    if (!accessToken) throw new Error('access_token is required');
    return accessToken;
  }

  async listDrives(accessToken: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const { data } = await axios.get(this.baseUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async listItems(accessToken: string, driveId: string, pathOrItemId: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const url = `${this.baseUrl}/${encodeURIComponent(driveId)}/items/${encodeURIComponent(pathOrItemId)}/children`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async getFile(accessToken: string, driveId: string, itemId: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const url = `${this.baseUrl}/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async getSiteByName(accessToken: string, siteName: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const url = `https://graph.microsoft.com/v1.0/sites/root:/sites/${encodeURIComponent(siteName)}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async getSiteChildren(accessToken: string, siteId: string, driveName?: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const params = new URLSearchParams();
    params.set('$select', 'id,name');
    if (driveName) {
      const safe = driveName.replace(/'/g, "''");
      params.set('$filter', `name eq '${safe}'`);
    }
    const url = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/drives?${params.toString()}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async getDriveChildren(accessToken: string, driveId: string, itemName?: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const params = new URLSearchParams();
    params.set('$select', 'id,name');
    if (itemName) {
      const safe = itemName.replace(/'/g, "''");
      params.set('$filter', `name eq '${safe}'`);
    }
    const url = `${this.baseUrl}/${encodeURIComponent(driveId)}/root/children?${params.toString()}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async getDriveItemChildren(accessToken: string, driveId: string, itemId: string, filter?: string): Promise<unknown> {
    accessToken = this.ensureAccessToken(accessToken);
    const params = new URLSearchParams();
    params.set('$select', 'id,name,file,folder');
    params.set('$top', '1000');
    if (filter && filter.trim().length > 0) {
      params.set('$filter', filter);
    }
    const url = `${this.baseUrl}/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/children?${params.toString()}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
  }

  async downloadDriveItem(accessToken: string, driveId: string, itemId: string): Promise<{ data: any; headers: Record<string, string>; status: number; }> {
    accessToken = this.ensureAccessToken(accessToken);
    const url = `${this.baseUrl}/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/content`;
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(resp.headers)) {
      if (typeof v === 'string') headers[k] = v;
    }
    return { data: resp.data, headers, status: resp.status };
  }
}


