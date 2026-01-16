import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 获取本地 git commit 数量
    const { execSync } = require('child_process')
    const localCommitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim()
    const localVersion = `v1.${localCommitCount}`

    // 获取远程 GitHub commit 数量
    let remoteVersion = null
    let hasUpdate = false

    try {
      const response = await fetch(
        'https://api.github.com/repos/systemoutprintlnhelloworld/interactive-prompt-iterator/commits?per_page=1',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
          next: { revalidate: 300 } // 缓存 5 分钟
        }
      )

      if (response.ok) {
        const linkHeader = response.headers.get('Link')
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/)
          if (match) {
            const remoteCommitCount = match[1]
            remoteVersion = `v1.${remoteCommitCount}`
            hasUpdate = parseInt(remoteCommitCount) > parseInt(localCommitCount)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch remote version:', error)
    }

    return NextResponse.json({
      localVersion,
      remoteVersion,
      hasUpdate
    })
  } catch (error) {
    console.error('Version check error:', error)
    return NextResponse.json(
      { error: 'Failed to check version' },
      { status: 500 }
    )
  }
}
