import { Octokit } from '@octokit/rest'

function base64ToUtf8(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export async function getSongsFile(token, owner, repo) {
  const octokit = new Octokit({ auth: token })
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: 'public/songs.json',
  })

  const content = base64ToUtf8(data.content)
  const songs = JSON.parse(content)
  return { songs, sha: data.sha }
}

export async function updateSongsFile(token, owner, repo, songs, sha) {
  const octokit = new Octokit({ auth: token })
  const content = utf8ToBase64(JSON.stringify(songs, null, 2))
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: 'public/songs.json',
    message: 'Update songs.json via Lyric Book',
    content,
    sha,
  })
}

export async function validateToken(token, owner, repo) {
  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return data.permissions?.push === true
  } catch {
    return false
  }
}
