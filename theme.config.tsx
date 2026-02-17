import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong>The Governor HQ System Principles</strong>,
  project: {
    link: 'https://github.com/the-governor-hq/constitution',
  },
  docsRepositoryBase: 'https://github.com/the-governor-hq/constitution',
  footer: {
    text: '© The Governor HQ System Principles ',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="The Governor HQ System Principles" />
      <title>The Governor HQ System Principles — AI Safety Constitution for Wearable Data Projects</title>
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    float: true,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s — The Governor HQ System Principles',
    }
  },
  banner: {
    key: 'product-notice',
    text: '⚠️ This system does not provide medical advice.',
  },
}

export default config
