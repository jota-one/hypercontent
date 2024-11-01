import type { HcPage, HcPageShow } from '../types/page'

export interface Pages {
  [id: string]: HcPage
}

type NavigationItem = {
  pageId: number
  path: string
  label: string
  sort: number
  show: HcPageShow
  children?: NavigationItem[]
}

export const useHcNavigation = () => {
  const homePage = useState('hcHomePage', () =>
    ref<NavigationItem | null>(null)
  )
  const navigation = useState('hcNavigation', () => ref<NavigationItem[]>([]))
  const pages = useState('hcPages', () => ref<Pages>({}))

  const { hypercontent } = useRuntimeConfig().public
  const route = useRoute()
  const { currentLangCode, defaultLang } = useHcLangs()

  const _loadNavigation = async () => {
    const langCode = currentLangCode.value || defaultLang.value?.code || 'en'
    const hcApiPath = `${hypercontent.content.api.base}${hypercontent.content.api.navigation.replace('__langCode__', langCode)}`

    const { data: _pageList } = await useAsyncData('_navigation', () =>
      queryContent()
        .where({ _partial: true, _id: `content:${hcApiPath}` })
        .findOne()
    )

    if (!_pageList.value) {
      navigation.value = []
      pages.value = {}
      return
    }

    const pageList = _pageList.value?.body as unknown as HcPage[]

    // Set homepasge
    homePage.value = {
      ...pageList[0],
      pageId: pageList[0].id,
    }

    // Build pages
    for (const page of pageList) {
      pages.value[page.id] = page
    }

    // Build naviagtion
    const hasChild = (page: HcPage, next: HcPage) =>
      next.path !== page.path &&
      next.path.length > page.path.length &&
      next.path.includes(page.path)

    const isFirstLevel = (page: HcPage) => {
      // Homepage path is /<lang> => split('/') has length 2
      // => first level pages have path with 2 slashes /<lang>/<page>
      // thus split('/').length = 3
      return page.path.split('/').length === 3
    }

    const _navigation = []
    let parent: NavigationItem | null = null

    // Backend returns a flat list of pages ordered by path,
    // so we can avoid recursive looping.
    for (let index = 1; index < pageList.length; index++) {
      const page = pageList[index]
      const next = index < pageList.length && pageList[index + 1]

      if (isFirstLevel(page)) {
        parent = null
      }

      if (parent) {
        if (!parent.children) {
          parent.children = []
        }

        parent.children.push({
          pageId: page.id,
          path: page.path,
          label: page.label,
          sort: page.sort,
          show: page.show,
        })
      } else {
        _navigation.push({
          pageId: page.id,
          path: page.path,
          label: page.label,
          sort: page.sort,
          show: page.show,
        })
      }

      if (next && hasChild(page, next)) {
        parent = {
          pageId: page.id,
          path: page.path,
          label: page.label,
          sort: page.sort,
          show: page.show,
        }

        const parentIndex = _navigation.findIndex(
          n => n.pageId === parent?.pageId
        )
        _navigation[parentIndex] = parent
      }
    }

    navigation.value = _navigation
  }

  const getPageByPath = (path: string) => {
    const stripTrailingSlash = (path: string) => path.replace(/(.*)\/$/, '$1')

    return Object.values(pages.value).find(
      page => stripTrailingSlash(page.path || '') === stripTrailingSlash(path)
    )
  }

  const getPageByName = (name: string) => {
    return Object.values(pages.value).find(page => page.name === name)
  }

  const currentPage = computed<HcPage | undefined>(() => {
    const staticPage = getPageByPath(route.path)

    if (staticPage) {
      return staticPage
    }

    const stripPathDown = (path: string) =>
      path.substring(0, path.lastIndexOf('/')) + '/:'

    const resolveDynamicPage = (path: string, page: HcPage) => {
      const match = page.path.match(/:([^/]+)/)

      if (
        match &&
        match.index &&
        stripPathDown(path) === page.path.replace(match[0], ':')
      ) {
        return { key: match[1], value: path.substring(match.index) }
      }

      return {}
    }

    for (const page of Object.values(pages.value)) {
      const { key, value } = resolveDynamicPage(route.path, page)

      if (key && value) {
        return { ...page, resolveSlug: `${key}=${value}`, label: value }
      }
    }
  })

  return {
    currentPage,
    homePage,
    navigation,
    pages,
    getPageByName,
    getPageByPath,
    _loadNavigation,
  }
}
