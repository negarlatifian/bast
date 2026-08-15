import MainLayout from '@/components/MainLayout';
import MapAndTimeline from '@/components/MapAndTimeline';
import type { MapPin, MapProjectSummary, MapThread } from '@/components/ProjectsMap';
import type { TimelineProject } from '@/components/ProjectsTimeline';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, type Locale } from '@/lib/i18n';
import {
  mapCities,
  onlineProjectSlugs,
  projectCityLinks,
  type MapCityId,
} from '@/lib/mapData';
import {
  getProjectBySlug,
  getProjectImage,
  getProjectYearRange,
  localizeProject,
  projects,
} from '@/lib/projects';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;

  if (!isLocale(rawLang)) {
    notFound();
  }

  const lang: Locale = rawLang;
  const dict = getDictionary(lang);

  function toProjectSummary(slug: string): MapProjectSummary | null {
    const rawProject = getProjectBySlug(slug);

    if (!rawProject) {
      return null;
    }

    const project = localizeProject(rawProject, lang);
    const basicInformation = project['1. Basic Information'];
    const title = basicInformation['Project Title'];

    return {
      slug: project.slug,
      title,
      artists:
        basicInformation[
          'Artist / Group / Collective / Organizer / Supervisor / Initiator'
        ],
      tags: basicInformation['Thematic Tags'] ?? [],
      imageSrc: getProjectImage(project),
      imageAlt: basicInformation['Featured Project Image'].alt || title,
    };
  }

  const pinsById = new Map<MapCityId, MapPin>();

  for (const { slug } of projects) {
    const cityIds = projectCityLinks[slug];

    if (!cityIds) {
      continue;
    }

    const summary = toProjectSummary(slug);

    if (!summary) {
      continue;
    }

    for (const cityId of cityIds) {
      const city = mapCities[cityId];
      const existingPin = pinsById.get(cityId);

      if (existingPin) {
        existingPin.projects.push(summary);
      } else {
        pinsById.set(cityId, {
          id: cityId,
          name: lang === 'fa' ? city.nameFa : city.name,
          x: city.x,
          y: city.y,
          projects: [summary],
        });
      }
    }
  }

  const pins = Array.from(pinsById.values());

  const threads: MapThread[] = Object.entries(projectCityLinks)
    .filter(([, cityIds]) => cityIds.length > 1)
    .map(([slug, cityIds]) => ({
      slug,
      points: cityIds.map((cityId) => {
        const city = mapCities[cityId];
        return { x: city.x, y: city.y };
      }),
    }));

  const onlineProjects = onlineProjectSlugs
    .map(toProjectSummary)
    .filter((project): project is MapProjectSummary => project !== null);

  const timelineProjects: TimelineProject[] = projects
    .map((rawProject) => {
      const yearRange = getProjectYearRange(rawProject);

      if (!yearRange) {
        return null;
      }

      const summary = toProjectSummary(rawProject.slug);

      if (!summary) {
        return null;
      }

      const localizedProject = localizeProject(rawProject, lang);

      return {
        ...summary,
        yearLabel:
          localizedProject['1. Basic Information']['Year / Time Period']
            .text,
        start: yearRange.start,
        end: yearRange.end,
        ongoing: yearRange.ongoing,
      };
    })
    .filter((project): project is TimelineProject => project !== null);

  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-3 sm:mt-8'>
        {dict.map.intro.map((paragraph, index) => (
          <p
            key={`map-intro-${index}`}
            className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'
          >
            {paragraph}
          </p>
        ))}
      </article>

      <MapAndTimeline
        pins={pins}
        threads={threads}
        onlineProjects={onlineProjects}
        timelineProjects={timelineProjects}
      />
    </MainLayout>
  );
}
