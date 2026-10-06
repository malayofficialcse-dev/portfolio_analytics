import geoip from 'geoip-lite';

export interface GeoInfo {
  country: string;
  region: string;
  city: string;
}

export function getGeoInfo(ip: string): GeoInfo {
  try {
    // Skip private IPs
    if (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    ) {
      return { country: 'Local', region: '', city: '' };
    }
    const geo = geoip.lookup(ip);
    if (!geo) return { country: 'Unknown', region: '', city: '' };
    return {
      country: geo.country || 'Unknown',
      region: geo.region || '',
      city: geo.city || '',
    };
  } catch {
    return { country: 'Unknown', region: '', city: '' };
  }
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  return (req.socket?.remoteAddress || '127.0.0.1').replace('::ffff:', '');
}
