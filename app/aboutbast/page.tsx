import MainLayout from '@/components/MainLayout';
import type { ReactNode } from 'react';

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p className='text-base leading-7 tracking-normal text-black sm:text-[1.2rem] sm:leading-8'>
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='mt-6 text-2xl font-semibold leading-tight tracking-normal text-black sm:mt-8 sm:text-3xl'>
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-4 text-xl font-semibold leading-8 tracking-normal text-black sm:mt-5 sm:text-2xl'>
      {children}
    </h3>
  );
}

export default function Page() {
  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-4 pb-32 sm:mt-8 sm:pb-40'>
        <header className='flex flex-col gap-4'>
          {/* <h1 className='text-3xl font-semibold leading-tight tracking-normal text-black sm:text-4xl'>
            - About Bast
          </h1> */}

          <div className='flex flex-col gap-4 sm:gap-5'>
            <Paragraph>
              BAST (بسط in Persian, from the Arabic root meaning{' '}
              <em>to expand</em> or <em>to articulate</em>)
            </Paragraph>
            <Paragraph>
              Bast is a research platform dedicated to the study, rethinking,
              and documentation of participatory art in Iran.
            </Paragraph>
            <Paragraph>
              Our focus is on curatorial, editorial, and research-based studies
              of participatory art projects and artistic actions in Iran, with
              the aim of examining how these approaches respond to social and
              political realities and how they contribute to shaping spaces for
              interaction.
            </Paragraph>
          </div>
        </header>

        <p className='text-base font-semibold leading-7 tracking-normal text-black sm:text-[1.2rem] sm:leading-8'>
          How and why has participatory art in Iran emerged under conditions of
          institutional, social, and political constraints? What patterns of
          interaction, collaboration, and creative action does it propose, and
          in which contexts does it acquire meaning and impact?
        </p>

        <Paragraph>
          The aim of this project is to focus on the various possibilities of
          participation, its complexities, and its relationship to social,
          institutional, environmental, and lived contexts. While avoiding fixed
          labels or rigid frameworks, we seek to develop a deeper understanding
          of what participatory art is and how it operates in contemporary Iran
          through creative documentation, polyphonic readings, and analytical
          categorization. The project attempts to gather and revisit different
          methods of documenting, narrating, and sustaining these experiences,
          and through this process to explore new possibilities for redefining
          the roles of the artist, the audience, and artistic action within the
          context of contemporary Iran.
        </Paragraph>

        <SectionTitle>Context and Necessity</SectionTitle>

        <Paragraph>
          In recent decades, alongside the expansion of post-studio approaches,
          forms of art that focus not on the production of objects but on
          collective action, audience participation, and intervention within
          social contexts have gained increasing significance. What we broadly
          refer to as <em>Participatory Art</em>, unlike traditional art that
          positions the viewer as a passive observer, transforms them into an
          active participant in the process of creating the work such that the
          work remains incomplete without their presence and participation.
        </Paragraph>

        <Paragraph>
          In Iran as well, numerous projects with participatory approaches have
          emerged in recent years. These works often emphasize process,
          dialogue, and the formation of relationships rather than the
          production of a final artistic object. They have appeared in diverse
          formats, spaces, and contexts: from small neighborhood interventions
          to long-term collective collaborations, and from dialogue-based
          workshops to spaces for shared creation.
        </Paragraph>

        <Paragraph>
          Despite this, the documentation and archiving of such projects,
          particularly those carried out in public spaces, has faced significant
          challenges. The absence of centralized resources and the fragmentation
          of available data have resulted in many valuable experiences being
          removed from collective memory or gradually falling into obscurity.
          This lack of accessibility has created a significant gap in the
          documentation and critical historiography of contemporary Iranian art,
          particularly in relation to activism and participatory practices.
        </Paragraph>

        <Paragraph>
          The Bast project was initiated with the aim of decentralizing dominant
          forms of knowledge and creating a research-oriented platform for the
          study, documentation, and re-examination of participatory art in Iran.
          In our view, documentation is not a static archival process but a
          critical and creative act that can lead to the production of
          knowledge, analysis, and the rearticulation of collective experiences.
          Bast therefore seeks to form a kind of{' '}
          <strong>counter-archive</strong>: a living, multi-voiced narrative
          that intervenes in the process of documentation and opens
          possibilities for revisiting official narratives and creating new
          horizons for alternative perspectives. Within this framework, each
          selected project becomes a platform for parallel writing, critical
          reading, or creative intervention.
        </Paragraph>

        <Paragraph>
          Bast is also an attempt to recover lived and subject-centered
          experiences within participatory art in Iran, experiences that have
          emerged from structural gaps, crises, and the absence of
          infrastructures for critique and education, and that have sought to
          create alternative spaces for interaction and collective action.
          Within this process, each project is documented and presented as an
          independent dossier. In addition to basic information, each dossier
          includes <strong>a re-reading</strong>: an analysis written from the
          perspective of another individual invited by Bast to expand on the
          experience and context of the project.
        </Paragraph>

        <Paragraph>
          Our focus is on projects that have emerged in response to
          institutional, social, economic, and political constraints, and that
          engage with questions surrounding participation, the body, place,
          politics, gender, memory, and media. At the same time, we seek to
          develop a critical perspective toward the concept and function of{' '}
          <em>participatory art</em> itself within the context of Iran, asking
          in which situations this approach has enabled constructive
          intervention, and where it may have reproduced existing structures.
        </Paragraph>

        <Paragraph>
          Within Bast, we ask how these projects might be understood not only as
          visual documents but also as forms of social action or modes of
          knowledge production. We also ask how we, as artists, curators,
          researchers, or mediators, enter into dialogue with these projects.
          Through what methods, parallel writing, creative interpretation, or
          reactivation, can we engage with them?
        </Paragraph>

        <Paragraph>
          Members of Bast share a common concern regarding the fragility of
          collective memory, the absence of certain narratives, and the
          necessity of creating spaces where marginalized voices can be heard.
          For this reason, we rethink the archive as a living, participatory,
          and dynamic entity. Our aim is to create sustainable networks of
          cultural actors who, through collective and collaborative processes,
          contribute to the creation and re-reading of memory.
        </Paragraph>

        <Paragraph>
          From a temporal perspective, Bast does not limit itself to a specific
          period or generation. We have not defined a fixed timeframe for the
          project and seek, through available data, documents, and oral
          histories, to trace earlier projects and actions as well, in order to
          draw a broader historical continuity of the formation and
          transformation of participatory art in Iran.
        </Paragraph>

        <SectionTitle>Research Process</SectionTitle>

        <SubTitle>Collection, Selection, and Initial Documentation</SubTitle>
        <Paragraph>
          In this phase, participatory art projects are identified and collected
          from various contexts. This stage is not limited to gathering primary
          data, such as visual and written documentation, narratives, and
          contextual texts. Rather, through a curatorial approach, it involves
          selecting projects that enter into tension or dialogue with the
          central questions of the project. The criteria for selection are not
          only historical or artistic importance, but also the project&apos;s
          capacity to reflect the social, institutional, and embodied dynamics
          of participatory art in contemporary Iran.
        </Paragraph>

        <SubTitle>Conversation with the Artist or Project Initiator</SubTitle>
        <Paragraph>
          Before any interpretation or re-reading takes place, a conversation is
          conducted with the creator of the project. Depending on accessibility
          and the conditions surrounding the project, these conversations may
          take different forms. They aim to understand the lived experiences of
          the artists, the personal, social, and institutional contexts of the
          work&apos;s production, the methods through which participants were
          engaged, and the challenges and limitations encountered by the
          project.
        </Paragraph>

        <SubTitle>
          Re-readings, Parallel Writing, and Creative Mediation
        </SubTitle>
        <Paragraph>
          The collected projects and conversations with artists become the basis
          for critical reinterpretation. These readings are produced either by
          members of Bast or through invitations extended to researchers,
          artists, and independent writers, and they are gradually added to the
          projects in the Bast repository.
        </Paragraph>
        <Paragraph>Two main approaches are pursued in this phase:</Paragraph>
        <ul className='ml-6 list-disc space-y-4 text-base leading-7 tracking-normal text-black sm:ml-12 sm:text-[1.2rem] sm:leading-8'>
          <li>
            <strong>Parallel writing and annotation:</strong> the production of
            interpretive, experiential, or theoretical texts that accompany the
            projects and allow for the emergence of multilayered and non-linear
            narratives.
          </li>
          <li>
            <strong>Creative mediation:</strong> the reactivation, translation,
            or creative reworking of parts of projects into other formats such
            as conversations, podcasts, or interactive online formats.
          </li>
        </ul>

        <Paragraph>
          The process of Bast is not linear. Artists may propose their own
          projects, projects may be revisited and reread at different stages,
          conversations may continue over time, readings may be challenged by
          others, and new layers of interpretation and intervention may be
          added.
        </Paragraph>

        <SectionTitle>Contribute to Bast</SectionTitle>
        <Paragraph>
          As a growing platform, Bast welcomes the participation of artists,
          researchers, writers, and cultural practitioners.
        </Paragraph>
        <Paragraph>
          You may suggest a participatory art project for inclusion in the
          repository, propose a re-reading in response to an existing project,
          or share relevant documentation and resources with the platform. If
          you are interested in collaboration or would like to learn more about
          the project, you may contact us.
        </Paragraph>

        <SectionTitle>Intellectual Property and Copyright</SectionTitle>
        <Paragraph>Bast is a non-profit research platform.</Paragraph>
        <Paragraph>
          Within the Bast project, protecting the privacy and security of
          participants is of particular importance. For this reason, final
          decisions regarding the presentation of collected information are made
          by the project team in consultation and agreement with the artists,
          groups, and art spaces represented in the platform. Artists and
          registered artistic groups have the right to request the removal or
          editing of their information at any time, and such requests will be
          reviewed and implemented by the project team.
        </Paragraph>
        <Paragraph>Rights of Use and Redistribution:</Paragraph>
        <Paragraph>
          All users and researchers are allowed to access the information
          published on this platform and may use it for research and educational
          purposes with proper attribution. However, the copyright of all
          participatory artworks published on this platform remains with their
          artists and creators. Bast does not claim ownership of the
          intellectual property of the works.
        </Paragraph>
        <Paragraph>
          None of the information related to artistic projects published on Bast
          may be used for commercial purposes or incorporated into other
          projects without obtaining permission from the artist or the creators
          of the work. In all such cases, Bast and its users are required to
          properly credit the work and its creator according to citation
          standards.
        </Paragraph>
        <Paragraph>
          Materials first published on this platform may be republished with
          proper attribution and a link to the Bast website. For materials that
          are republished from other sources, redistribution remains subject to
          the limitations of the original source.
        </Paragraph>

        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          If you would like to learn more about Bast, propose a participatory
          art project for the repository, suggest a re-reading, or share
          relevant materials and documentation, we would be glad to hear from
          you.
        </Paragraph>
        <Paragraph>
          For collaborations, research inquiries, or general questions, please
          contact us through the form below or via email.
        </Paragraph>
      </article>
    </MainLayout>
  );
}
