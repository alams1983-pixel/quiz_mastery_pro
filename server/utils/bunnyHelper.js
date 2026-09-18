import crypto from 'crypto';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const {
  BUNNY_STREAM_LIBRARY_ID,
  BUNNY_API_KEY,
  BUNNY_STREAM_TOKEN_KEY,
  BUNNY_STREAM_CDN_HOSTNAME = 'vz-50f902cf-d05.b-cdn.net',
  BUNNY_ACCOUNT_API_KEY,
} = process.env;

const isConfigured = Boolean(
  BUNNY_STREAM_LIBRARY_ID &&
  BUNNY_API_KEY &&
  BUNNY_STREAM_LIBRARY_ID !== 'your_bunny_stream_library_id_here' &&
  BUNNY_API_KEY !== 'your_bunny_stream_api_key_here'
);

const BASE_URL = 'https://video.bunnycdn.com';

/**
 * Check if Bunny.net credentials are real and configured
 */
export function checkBunnyConfigured() {
  return isConfigured;
}

/**
 * Resolve effective Bunny credentials for a given institute.
 * If institute has its own provisioned video library, returns its credentials.
 * Otherwise, falls back to the master account environment variables.
 * @param {number} instituteId
 * @returns {Promise<{ libraryId: number|string, apiKey: string, tokenKey: string, cdnHostname: string, isDedicated: boolean }>}
 */
export async function getInstituteBunnyConfig(instituteId) {
  if (instituteId) {
    try {
      const [rows] = await pool.query(
        `SELECT bunny_library_id, bunny_api_key, bunny_token_key, bunny_cdn_hostname FROM institutes WHERE id = ?`,
        [instituteId]
      );
      if (rows.length > 0 && rows[0].bunny_library_id && rows[0].bunny_api_key) {
        return {
          libraryId: rows[0].bunny_library_id,
          apiKey: rows[0].bunny_api_key,
          tokenKey: rows[0].bunny_token_key || BUNNY_STREAM_TOKEN_KEY,
          cdnHostname: rows[0].bunny_cdn_hostname || BUNNY_STREAM_CDN_HOSTNAME,
          isDedicated: true,
        };
      }
    } catch (err) {
      console.warn('[BUNNY CONFIG] Error querying institute library, using master default:', err.message);
    }
  }

  return {
    libraryId: BUNNY_STREAM_LIBRARY_ID,
    apiKey: BUNNY_API_KEY,
    tokenKey: BUNNY_STREAM_TOKEN_KEY,
    cdnHostname: BUNNY_STREAM_CDN_HOSTNAME,
    isDedicated: false,
  };
}

/**
 * Provision a dedicated Video Library on Bunny.net for a coaching institute
 * Calls Bunny.net Management API (POST https://api.bunny.net/videolibrary)
 * @param {Object} params
 * @param {number} params.instituteId - Institute DB ID
 * @param {string} params.instituteName - Name of coaching institute
 * @returns {Promise<{ libraryId: number, apiKey: string, tokenKey: string, cdnHostname: string, isMock: boolean }>}
 */
export async function provisionInstituteVideoLibrary({ instituteId, instituteName }) {
  const accountApiKey = process.env.BUNNY_ACCOUNT_API_KEY;
  if (!accountApiKey || accountApiKey.includes('your_')) {
    console.warn('[BUNNY PROVISION] BUNNY_ACCOUNT_API_KEY not configured. Falling back to master video library.');
    return {
      libraryId: parseInt(BUNNY_STREAM_LIBRARY_ID, 10),
      apiKey: BUNNY_API_KEY,
      tokenKey: BUNNY_STREAM_TOKEN_KEY,
      cdnHostname: BUNNY_STREAM_CDN_HOSTNAME,
      isMock: true,
    };
  }

  const cleanName = `EdutorAI - ${instituteName.trim().substring(0, 50)} (Inst #${instituteId})`;

  // 1. Create Video Library via Bunny Management API
  const createRes = await fetch('https://api.bunny.net/videolibrary', {
    method: 'POST',
    headers: {
      AccessKey: accountApiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ Name: cleanName }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Bunny.net Video Library creation failed (${createRes.status}): ${errText}`);
  }

  const libData = await createRes.json();
  const libraryId = libData.Id;
  const apiKey = libData.ApiKey;
  let cdnHostname = BUNNY_STREAM_CDN_HOSTNAME;
  let tokenKey = BUNNY_STREAM_TOKEN_KEY;

  // 2. Fetch Pull Zone details to retrieve the exact CDN Hostname and Token Auth Key
  if (libData.PullZoneId) {
    try {
      const pzRes = await fetch(`https://api.bunny.net/pullzone/${libData.PullZoneId}`, {
        headers: { AccessKey: accountApiKey },
      });
      if (pzRes.ok) {
        const pzData = await pzRes.json();
        if (pzData.Hostnames && pzData.Hostnames.length > 0) {
          cdnHostname = pzData.Hostnames[0].Value;
        }
        if (pzData.ZoneSecurityKey) {
          tokenKey = pzData.ZoneSecurityKey;
        }
      }
    } catch (pzErr) {
      console.warn('[BUNNY PROVISION] Could not fetch PullZone details:', pzErr.message);
    }
  }

  // 3. Save library credentials to institutes table in MySQL
  await pool.query(
    `UPDATE institutes 
     SET bunny_library_id = ?, 
         bunny_api_key = ?, 
         bunny_token_key = ?, 
         bunny_cdn_hostname = ? 
     WHERE id = ?`,
    [libraryId, apiKey, tokenKey, cdnHostname, instituteId]
  );

  console.log(`[BUNNY PROVISION] Dedicated Video Library #${libraryId} provisioned for institute #${instituteId} (${cleanName})`);

  return {
    libraryId,
    apiKey,
    tokenKey,
    cdnHostname,
    isMock: false,
  };
}

/**
 * Delete a dedicated Video Library from Bunny.net
 * @param {number} libraryId
 */
export async function deleteInstituteVideoLibrary(libraryId) {
  const accountApiKey = process.env.BUNNY_ACCOUNT_API_KEY;
  if (!accountApiKey || !libraryId || libraryId === parseInt(BUNNY_STREAM_LIBRARY_ID, 10)) {
    return;
  }

  try {
    const res = await fetch(`https://api.bunny.net/videolibrary/${libraryId}`, {
      method: 'DELETE',
      headers: { AccessKey: accountApiKey },
    });
    console.log(`[BUNNY DEPROVISION] Video Library #${libraryId} deleted from Bunny.net: status ${res.status}`);
  } catch (err) {
    console.warn('[BUNNY DEPROVISION] Failed to delete video library:', err.message);
  }
}

/**
 * Create a new video entry in Bunny.net Stream
 * @param {Object} params
 * @param {string} params.title - Title of the video
 * @param {string} [params.collectionId] - Optional Bunny collection ID
 * @param {Object} [params.config] - Optional institute Bunny configuration
 * @returns {Promise<{ videoId: string, directUploadUrl: string }>}
 */
export async function createBunnyVideo({ title, collectionId = null, config = null }) {
  const libraryId = config?.libraryId || BUNNY_STREAM_LIBRARY_ID;
  const apiKey = config?.apiKey || BUNNY_API_KEY;

  if (!isConfigured && !config?.libraryId) {
    const mockId = `mock_vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.warn('[BUNNY] Warning: Bunny.net credentials not configured. Returning mock video entry.');
    return {
      videoId: mockId,
      directUploadUrl: `/api/videos/mock-upload?videoId=${mockId}`,
      isMock: true,
    };
  }

  const payload = { title };
  if (collectionId) payload.collectionId = collectionId;

  const res = await fetch(`${BASE_URL}/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Bunny.net Create Video failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const videoId = data.guid;

  return {
    videoId,
    directUploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    isMock: false,
  };
}

/**
 * Generate Tus Resumable Upload Authorization Signature
 * Needed for direct browser-to-Bunny resumable video uploading
 * @param {string} videoId
 * @param {number} [expiresInSeconds=86400] - 24 hours
 * @param {Object} [config] - Optional institute Bunny configuration
 */
export function getBunnyTusUploadAuth(videoId, expiresInSeconds = 86400, config = null) {
  const libraryId = config?.libraryId || BUNNY_STREAM_LIBRARY_ID;
  const apiKey = config?.apiKey || BUNNY_API_KEY;

  if (!isConfigured && !config?.libraryId) {
    return {
      libraryId: 0,
      videoId,
      expirationTime: Math.floor(Date.now() / 1000) + expiresInSeconds,
      signature: 'mock_signature',
      isMock: true,
    };
  }

  const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;
  // Signature = SHA256(library_id + api_key + expiration_time + video_id)
  const toHash = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  const signature = crypto.createHash('sha256').update(toHash).digest('hex');

  return {
    libraryId: parseInt(libraryId, 10),
    videoId,
    expirationTime,
    signature,
    endpoint: 'https://video.bunnycdn.com/tusupload',
    isMock: false,
  };
}

/**
 * Generate a cryptographically signed HLS playback URL with SHA256 Token Auth (VOD Video Lectures)
 * @param {Object} params
 * @param {string} params.videoId - Bunny video GUID
 * @param {number} [params.expiresInSeconds=7200] - Token validity (default 2 hours)
 * @param {string} [params.userIp] - Optional IP lock
 * @param {Object} [params.config] - Optional institute Bunny configuration
 * @returns {string} Signed HLS stream URL (.m3u8)
 */
export function generateSignedHlsUrl({ videoId, expiresInSeconds = 7200, userIp = null, config = null }) {
  const cdnHostname = config?.cdnHostname || BUNNY_STREAM_CDN_HOSTNAME;
  const tokenKey = config?.tokenKey || BUNNY_STREAM_TOKEN_KEY;

  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${videoId}/`;
  const file = 'playlist.m3u8';

  if (!tokenKey || tokenKey.includes('security_key')) {
    // Return standard URL if token key is not yet configured
    return `https://${cdnHostname}${path}${file}`;
  }

  // Bunny Token Auth formula:
  // Base token = SHA256(security_key + path + expires [+ userIp])
  let hashable = `${tokenKey}${path}${expires}`;
  if (userIp) {
    hashable = `${tokenKey}${path}${expires}${userIp}`;
  }

  const token = crypto
    .createHash('sha256')
    .update(hashable)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `https://${cdnHostname}${path}${file}?token=${token}&expires=${expires}`;
}

/**
 * Get video details & transcoding status from Bunny
 * Status: 0=Created, 1=Uploaded, 2=Processing, 3=Transcoding, 4=Finished (Ready), 5=Error
 * @param {string} videoId
 * @param {Object} [config] - Optional institute Bunny configuration
 */
export async function getBunnyVideoStatus(videoId, config = null) {
  const libraryId = config?.libraryId || BUNNY_STREAM_LIBRARY_ID;
  const apiKey = config?.apiKey || BUNNY_API_KEY;

  if (!isConfigured && !config?.libraryId) {
    return { status: 4, isReady: true, duration: 3600, isMock: true };
  }

  const res = await fetch(`${BASE_URL}/library/${libraryId}/videos/${videoId}`, {
    headers: {
      AccessKey: apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch video status (${res.status})`);
  }

  const data = await res.json();
  const isReady = data.status === 4;
  return {
    rawStatus: data.status,
    isReady,
    duration: data.length || 0,
    views: data.views || 0,
  };
}

/**
 * Delete a video from Bunny.net library
 * @param {string} videoId
 * @param {Object} [config] - Optional institute Bunny configuration
 */
export async function deleteBunnyVideo(videoId, config = null) {
  const libraryId = config?.libraryId || BUNNY_STREAM_LIBRARY_ID;
  const apiKey = config?.apiKey || BUNNY_API_KEY;

  if (!isConfigured && !config?.libraryId) return true;

  const res = await fetch(`${BASE_URL}/library/${libraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: {
      AccessKey: apiKey,
    },
  });

  return res.ok;
}

