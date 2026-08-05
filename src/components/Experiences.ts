import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export interface Experience {
  title: string;
  titleZh?: string;
  startDate: string;
  startDateZh?: string;
  endDate: string;
  endDateZh?: string;
  company?: string;
  companyZh?: string;
  details?: string;
  detailsZh?: string;
  challenge?: string;
  challengeZh?: string;
  chips?: string[];
  img?: string;
  altText?: string;
  externalLink?: string;
}

export const experiences: Experience[] = [
  {
    title:
      "Full-stack Engineer (contract), remote. 80% backend, 20% frontend. Tech stack: AWS, DynamoDB, NodeJS, React Native.",
    titleZh:
      "全栈工程师（合同制），远程办公。八成后端，两成前端。技术栈：AWS、DynamoDB、NodeJS、React Native。",
    startDate: "Feb 2025",
    startDateZh: "2025 年 2 月",
    endDate: "present",
    endDateZh: "至今",
    company: "De Stijl Technology Network",
    details: "",
    chips: ["AWS", "DynamoDB", "NodeJS", "React Native"],
  },
  {
    title: "Career break — personal goal pursuit.",
    titleZh: "停下来一段时间，去做自己想做的事。",
    startDate: "Apr 2024",
    startDateZh: "2024 年 4 月",
    endDate: "Feb 2025",
    endDateZh: "2025 年 2 月",
    company: "Personal goal pursuit",
    companyZh: "职业间隔期",
    details: "",
  },
  {
    title:
      "Full-stack Software Engineer at Eventx.io, a Hong Kong SASS company. Tech stack: TypeScript, PostgresDB, NodeJS, ReactJS, TypeORM, KOA, BullMQ.",
    titleZh:
      "Eventx.io 全栈软件工程师，一家香港 SaaS 公司。技术栈：TypeScript、PostgresDB、NodeJS、ReactJS、TypeORM、KOA、BullMQ。",
    startDate: "Sep 2022",
    startDateZh: "2022 年 9 月",
    endDate: "Apr 2024",
    endDateZh: "2024 年 4 月",
    company: "Eventx",
    img: "eventx.jpg",
    altText: "Logo for Eventx",
    externalLink: "https://eventx.io/",
    details:
      "Full-stack development from data model design, backend, to frontend. At Eventx, they expect engineer be the owner of the whole feature, instead of splitting backend and frontend. Built the Email Campaign system (custom sender, statistic tracking, template customization) and a data aggregation system that collects, parses, and visualizes real-time Sendgrid email events; moved instant and scheduled email onto BullMQ to off-load pressure. Also built a new registration flow encapsulating registration form, ticketing, ticket add-ons, RSVP, and ticket assignment on top of legacy code.",
    detailsZh:
      "全栈开发，从数据模型设计、后端一路做到前端。Eventx 要求工程师对一个功能整体负责，而不是把前后端切开各做各的。做过 Email Campaign 系统（自定义发件人、数据统计、模板定制），以及一套采集、解析并可视化 Sendgrid 实时邮件事件的数据聚合系统；把即时邮件和定时邮件迁到 BullMQ 上分摊压力。还在一堆遗留代码之上重做了报名流程，涵盖报名表单、票务、附加票、RSVP 和票务分配。",
    challenge:
      "It was daunting to work full-stack at first, as I had to propose data model design and discuss with the system architect. But I managed to get good at it.",
    challengeZh:
      "一开始做全栈挺发怵的，数据模型得自己先出方案，再拿去跟系统架构师过。后来慢慢就做熟了。",
    chips: ["TypeScript", "PostgresDB", "NodeJS", "ReactJS", "TypeORM", "KOA", "BullMQ"],
  },
  {
    title:
      "Senior Software Engineer at EPAM, a US publicly traded company consulting for Fortune 1000. Tech stack: ReactJS, NodeJS, Typescript, GraphQL.",
    titleZh:
      "EPAM 高级软件工程师，一家为 Fortune 1000 做咨询的美国上市公司。技术栈：ReactJS、NodeJS、TypeScript、GraphQL。",
    startDate: "May 2021",
    startDateZh: "2021 年 5 月",
    endDate: "Sep 2022",
    endDateZh: "2022 年 9 月",
    company: "EPAM",
    img: "EPAM_logo.png",
    altText: "Logo for EPAM",
    externalLink: "https://www.epam.com/",
    details:
      "Still with client Expedia Group, leading a few frontend projects aiming for modularity.",
    detailsZh: "还是服务 Expedia Group 这个客户，主导了几个奔着模块化去的前端项目。",
    chips: ["TypeScript", "NodeJS", "ReactJS", "GraphQL", "ApolloClient"],
  },
  {
    title:
      "Software Engineer at EPAM, a US publicly traded company consulting for Fortune 1000. Tech stack: ReactJS, NodeJS, Typescript, GraphQL.",
    titleZh:
      "EPAM 软件工程师，一家为 Fortune 1000 做咨询的美国上市公司。技术栈：ReactJS、NodeJS、TypeScript、GraphQL。",
    startDate: "Nov 2019",
    startDateZh: "2019 年 11 月",
    endDate: "Apr 2021",
    endDateZh: "2021 年 4 月",
    company: "EPAM",
    img: "EPAM_logo.png",
    altText: "Logo for EPAM",
    externalLink: "https://www.epam.com/",
    details:
      "Consulted for Expedia Group, the US online travel agent company. Worked with their Partner Central team based in Shenzhen. Led and built complex frontend pages for cancellation policy, reservation deposit policy, and hotel amenities settings. As lead developer, did task breakdown, time estimation, and communicated progress with the project manager. Demo new features to key stakeholders and senior VPs on behalf of the team. Helped to interview and onboard new engineers.",
    detailsZh:
      "为美国在线旅行平台 Expedia Group 做咨询，跟他们在深圳的 Partner Central 团队一起做事。主导并实现了取消政策、预订押金政策、酒店设施设置这几组复杂的前端页面。作为 lead developer 负责拆任务、估工时，并向项目经理同步进度；代表团队给关键干系人和 senior VP 演示新功能；也参与面试和新工程师的 onboarding。",
  },
  {
    company: "Fagougou",
    title:
      "Software Engineer at a local startup. Developed and maintained the client-facing Nuxt.js project and an internal workflow platform; unified the separate mobile & desktop Nuxt.js projects into one for better maintainability. Tech stack: Vue, Nuxt, Node, Express, Webpack, MongoDB.",
    titleZh:
      "本地创业公司的软件工程师。开发并维护面向客户的 Nuxt.js 项目和一个内部工作流平台；把原本分开的移动端和桌面端两个 Nuxt.js 项目合并成一个，维护起来省事得多。技术栈：Vue、Nuxt、Node、Express、Webpack、MongoDB。",
    startDate: "Nov 2018",
    startDateZh: "2018 年 11 月",
    endDate: "Nov 2019",
    endDateZh: "2019 年 11 月",
    details: "",
    chips: ["Vue", "Nuxt", "NodeJS", "Express", "MongoDB"],
  },
  {
    company: "Learning to code full-time",
    companyZh: "全职学编程",
    title: "Decided to pursue programming as a career by learning full-time!",
    titleZh: "决定把编程当成职业，索性脱产全职学。",
    startDate: "2017",
    endDate: "2018",
    details: "",
  },
  {
    company: "Marketing · consumer tech",
    companyZh: "市场营销 · 消费电子",
    title:
      "Worked in marketing for a consumer tech company. I was quite interested in consumer electronics at that time. Meanwhile learning to code as a hobby.",
    titleZh:
      "在一家消费电子公司做市场营销。那几年我对消费电子挺着迷，同时把写代码当业余爱好在学。",
    startDate: "2014",
    endDate: "2017",
    details: "",
  },
  {
    company: "College",
    companyZh: "读大专",
    title:
      "Graduated with a college degree, but didn't figure out what I want to do. I guess traditional education and me failed each other.",
    titleZh: "拿到了大专文凭，但一直没想明白自己想做什么。大概是传统教育和我互相辜负了吧。",
    startDate: "2008",
    endDate: "2012",
    details: "",
  },
];

export function localizeExperience(experience: Experience, locale: Locale = DEFAULT_LOCALE) {
  if (locale !== "zh") {
    return {
      title: experience.title,
      company: experience.company,
      startDate: experience.startDate,
      endDate: experience.endDate,
      details: experience.details,
      challenge: experience.challenge,
    };
  }

  return {
    title: experience.titleZh ?? experience.title,
    company: experience.companyZh ?? experience.company,
    startDate: experience.startDateZh ?? experience.startDate,
    endDate: experience.endDateZh ?? experience.endDate,
    details: experience.detailsZh ?? experience.details,
    challenge: experience.challengeZh ?? experience.challenge,
  };
}
