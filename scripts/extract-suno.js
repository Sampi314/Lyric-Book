#!/usr/bin/env node
/**
 * Suno Song Extractor
 *
 * Usage: node scripts/extract-suno.js <suno-url>
 * Example: node scripts/extract-suno.js https://suno.com/song/ed77e6b5-17a0-400c-b9c3-968ddd0319fa
 *
 * Extracts song title, artist, audio URL, and lyrics from a Suno song page.
 * Outputs JSON that can be added to songs.json.
 *
 * Note: This fetches the HTML server-side. Suno renders lyrics client-side,
 * so this script extracts what's available from meta tags and builds the CDN URL.
 * For full lyrics, use the browser-based extraction (Claude + Chrome).
 */

const url = process.argv[2]

if (!url || !url.includes('suno.com/song/')) {
  console.error('Usage: node scripts/extract-suno.js <suno-song-url>')
  console.error('Example: node scripts/extract-suno.js https://suno.com/song/abc123...')
  process.exit(1)
}

// Extract song ID from URL
const songId = url.split('/song/')[1]?.split(/[?#]/)[0]

if (!songId) {
  console.error('Could not extract song ID from URL')
  process.exit(1)
}

async function extract() {
  try {
    const res = await fetch(url)
    const html = await res.text()

    // Extract title from og:title meta tag
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)
    const title = titleMatch ? titleMatch[1] : 'Unknown Title'

    // Extract artist from page title pattern "Song by Artist | Suno"
    const pageTitleMatch = html.match(/<title>(.+?)<\/title>/)
    const pageTitle = pageTitleMatch ? pageTitleMatch[1] : ''
    const artistMatch = pageTitle.match(/by\s+(.+?)\s*\|/)
    const artist = artistMatch ? artistMatch[1] : 'Unknown Artist'

    // Build CDN audio URL (Suno pattern: cdn1.suno.ai/<song-id>.mp3)
    const audioUrl = `https://cdn1.suno.ai/${songId}.mp3`

    const song = {
      id: Date.now().toString(),
      title,
      artist,
      audioUrl,
      lyrics: '(Paste lyrics here - use browser extraction for full lyrics)',
      translation: '',
    }

    console.log('\n--- Extracted Song ---')
    console.log(JSON.stringify(song, null, 2))
    console.log('\n--- Copy the above JSON and add it to public/songs.json ---')
    console.log(`\nAudio URL: ${audioUrl}`)
    console.log(`\nTip: For lyrics, open the Suno URL in Chrome and use Claude to extract them.`)
  } catch (err) {
    console.error('Failed to fetch:', err.message)
    process.exit(1)
  }
}

extract()
