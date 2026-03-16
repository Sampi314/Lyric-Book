import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSongsFile, updateSongsFile } from '../../src/lib/github'

const mockOctokit = {
  rest: {
    repos: {
      getContent: vi.fn(),
      createOrUpdateFileContents: vi.fn(),
    },
  },
}

vi.mock('@octokit/rest', () => ({
  Octokit: class { constructor() { return mockOctokit } },
}))

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

describe('github', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getSongsFile returns parsed songs and sha', async () => {
    const songData = [{ id: '1', title: 'Test' }]
    const encoded = utf8ToBase64(JSON.stringify(songData))
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: { sha: 'abc123', content: encoded },
    })

    const result = await getSongsFile('token', 'owner', 'repo')
    expect(result.sha).toBe('abc123')
    expect(result.songs).toEqual(songData)
  })

  it('getSongsFile handles Vietnamese characters', async () => {
    const songData = [{ id: '1', title: 'B\u00e0i h\u00e1t', lyrics: 'Xin ch\u00e0o th\u1ebf gi\u1edbi' }]
    const encoded = utf8ToBase64(JSON.stringify(songData))
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: { sha: 'def456', content: encoded },
    })

    const result = await getSongsFile('token', 'owner', 'repo')
    expect(result.songs[0].lyrics).toBe('Xin ch\u00e0o th\u1ebf gi\u1edbi')
  })

  it('updateSongsFile calls API with SHA', async () => {
    mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({ data: {} })

    await updateSongsFile('token', 'owner', 'repo', [{ id: '1' }], 'abc123')

    expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'public/songs.json',
      message: 'Update songs.json via Lyric Book',
      content: expect.any(String),
      sha: 'abc123',
    })
  })
})
