"use client";

import AgentCoreVisual from "@/components/agent/AgentCoreVisual";
import AgentEventTimeline from "@/components/agent/AgentEventTimeline";
import AgentStatusPanel from "@/components/agent/AgentStatusPanel";
import { useAgentStatusFeed } from "@/lib/agent-status";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/ui";

interface AgentStatusDashboardProps {
  lang?: Locale;
}

export default function AgentStatusDashboard({
  lang = DEFAULT_LOCALE,
}: AgentStatusDashboardProps) {
  const t = useTranslations(lang);
  const feed = useAgentStatusFeed();
  const current = feed.current.data;

  return (
    <section className="agent-console-shell border-b border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        <header className="agent-intro max-w-3xl">
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base md:leading-8">
            {t("agent.intro")}
          </p>
          <a
            className="agent-intro__link mt-6"
            href="https://github.com/hcsum/my-opencode-agent"
            rel="noreferrer"
            target="_blank"
          >
            {t("agent.repoLink")}
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 17 17 7M9 7h8v8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </a>
        </header>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <AgentCoreVisual
              lang={lang}
              hasFetchError={feed.derived.hasFetchError}
              lastKnownStatus={feed.derived.lastKnownStatus}
              presence={feed.derived.presence}
              summary={current?.summary}
              status={feed.derived.status}
              title={current?.title}
              tone={feed.derived.statusTone}
            />
            <AgentStatusPanel feed={feed} lang={lang} />
          </div>
          <AgentEventTimeline feed={feed} lang={lang} />
        </div>
      </div>
    </section>
  );
}
