export const isGitHubPages = process.env.GITHUB_PAGES === 'true';
export const basePath = isGitHubPages ? '/PPLALE-web_front' : '';

export const config = {
  basePath,
  isGitHubPages,
  imagePath: {
    base: `${basePath}/images`,
    loading: `${basePath}/images/yokan.png`,
  },
} as const; 