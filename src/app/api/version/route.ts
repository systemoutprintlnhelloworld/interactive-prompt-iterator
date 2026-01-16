import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 检测是否为云端部署环境（Vercel）
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    // 获取远程 GitHub commit 数量
    let remoteVersion = null
    let localVersion = null
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
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch remote version:', error)
    }

    // 云端部署：直接显示远程版本
    if (isProduction) {
      return NextResponse.json({
        localVersion: remoteVersion,
        remoteVersion: remoteVersion,
        hasUpdate: false
      })
    }

    // 本地开发：获取本地 commit 数量并对比
    try {
      const { execSync } = require('child_process')
      const localCommitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim()
      localVersion = `v1.${localCommitCount}`

      if (remoteVersion) {
        const remoteCount = parseInt(remoteVersion.replace('v1.', ''))
        const localCount = parseInt(localCommitCount)
        hasUpdate = remoteCount > localCount
      }
    } catch (error) {
      console.error('Failed to get local version:', error)
      localVersion = remoteVersion // 如果获取本地版本失败，使用远程版本
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
