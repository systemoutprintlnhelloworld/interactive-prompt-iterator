'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'

interface VersionInfo {
  localVersion: string
  remoteVersion: string | null
  hasUpdate: boolean
}

export function VersionBadge() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchVersion = async () => {
    try {
      const response = await fetch('/api/version')
      if (response.ok) {
        const data = await response.json()
        setVersionInfo(data)

        if (data.hasUpdate) {
          toast.info('发现新版本', {
            description: `当前版本: ${data.localVersion}, 最新版本: ${data.remoteVersion}`,
            duration: 5000,
            action: {
              label: '查看更新',
              onClick: () => window.open('https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator#更新指南', '_blank')
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch version:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVersion()
  }, [])

  if (loading || !versionInfo) {
    return <Badge variant="outline" className="text-xs font-normal">加载中...</Badge>
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={versionInfo.hasUpdate ? "default" : "outline"}
        className={`text-xs font-normal ${versionInfo.hasUpdate ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
      >
        {versionInfo.localVersion}
        {versionInfo.hasUpdate && (
          <Download className="w-3 h-3 ml-1 inline" />
        )}
      </Badge>
    </div>
  )
}
