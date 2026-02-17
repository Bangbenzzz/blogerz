'use server'

import prisma from '@/lib/prisma'

export async function getSiteSettings() {
  try {
    const settingsRaw = await prisma.setting.findMany()
    const settings: Record<string, string> = {}
    settingsRaw.forEach((s) => settings[s.key] = s.value)
    
    return {
      siteName: settings.site_name || 'CERMATI',
      siteLogo: settings.site_logo || '/logo.svg'
    }
  } catch (error) {
    console.error('Gagal mengambil settings:', error)
    return {
      siteName: 'CERMATI',
      siteLogo: '/logo.svg'
    }
  }
}