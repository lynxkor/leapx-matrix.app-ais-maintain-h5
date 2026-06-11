import { defineStore } from 'pinia'
import { getOwnerTree } from '@/libs/api/common'

function extractAismcTags(nodes) {
  const tags = new Set()
  if (!nodes) return tags
  for (const node of nodes) {
    if (node.resourceTag && node.resourceTag.startsWith('AISMC-')) {
      tags.add(node.resourceTag)
    }
    if (node.children?.length) {
      const childTags = extractAismcTags(node.children)
      childTags.forEach(t => tags.add(t))
    }
  }
  return tags
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: new Set(),
    loaded: false
  }),
  getters: {
    hasPermission: (state) => (tag) => {
      if (!state.loaded) return true
      return state.permissions.has(tag)
    }
  },
  actions: {
    async fetchPermissions() {
      try {
        const res = await getOwnerTree({ resourceTag: 'SE0000', resourceType: 'APP_SIDE' })
        if (res.code === 200 && res.data) {
          this.permissions = extractAismcTags(res.data)
        }
      } catch (e) {
        console.error('获取权限失败:', e)
      } finally {
        this.loaded = true
      }
    }
  }
})
