// Project registry ported from v1's Sanity data. Edit freely.
export interface Project {
  name: string
  nameEn: string
  description: string
  descriptionEn?: string
  url: string
  icon: string
  domain: string
}

export const projects: Project[] = [
  {
    name: 'ChatGPT Slack 机器人',
    nameEn: 'ChatGPT Slack Bot',
    description: '公司内部 Slack 的雏形版 ChatGPT 机器人。',
    descriptionEn: "An early ChatGPT bot built for Zolplay's Slack.",
    url: 'https://github.com/zolplay-cn/chatgpt-slack',
    icon: '/images/projects/chatgpt-slack.png',
    domain: 'github.com',
  },
]
