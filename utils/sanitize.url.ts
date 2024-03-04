// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Sanitizes a URL by removing any part of the URL after the specified path.
 * If the URL does not contain the specified path, it is returned as is.
 *
 * @param url - The URL to sanitize.
 * @param path - The path to remove from the URL. Defaults to "/m/".
 * @returns The sanitized URL.
 */
export default function sanitizeUrl(url: string, path: string = "/m/"): string {
  if (url.indexOf(path) > -1) {
    const firstPart = url.split(path)[0];

    let sanitizedUrl = firstPart + path;
    return sanitizedUrl;
  }

  return url;
}
