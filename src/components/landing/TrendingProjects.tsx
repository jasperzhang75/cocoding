import Image from "next/image";
import {
  formatViews,
  getTrendingProjects,
  type TrendingProject,
} from "@/lib/trending-projects";

/* Values read from Figma nodes 16555:16217 (grid) and 16555:16313 (header).
   Card image: 286x200, radius 8, 1px #FFFFFF/10 stroke.
   Hover: #141415 @ 65% wash plus a white "View" button (radius 6, #010101).
   Text roles: title Button/Primary + Label/sm, category Text/Body + Label/sm,
   count Number + Label/sm.

   Two inconsistencies in the design, normalized here: row 1 uses an 18px
   column gap and 286px cards while row 2 uses 20px and 285px, and the
   image-to-meta gap is 18px in row 1 but 12px in row 2. This uses one
   4-column grid at 18px with a 12px image-to-meta gap throughout. */

function ProjectCard({ project }: { project: TrendingProject }) {
  return (
    <a href={project.href} className="group flex flex-col gap-3">
      <div className="relative h-[200px] w-full overflow-hidden rounded-md border border-white/10">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 286px"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[#141415]/65 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <span className="flex h-8 items-center justify-center rounded-sm bg-button-primary px-3 text-body-sm text-bg">
            View
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-label-sm text-button-primary">{project.title}</p>
        <div className="flex items-center justify-between">
          <p className="text-label-sm text-text-body">{project.category}</p>
          <div className="flex items-center gap-1.5">
            <Image src="/icons/eye.svg" alt="" width={14} height={14} />
            <p className="text-label-sm text-number">{formatViews(project.views)}</p>
          </div>
        </div>
      </div>
    </a>
  );
}

export default async function TrendingProjects() {
  const projects = await getTrendingProjects();

  return (
    <section className="px-5 py-20 md:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-heading-md text-text-primary">
            Not inspired yet? Start with a trending project
          </h2>
          <a
            href="#"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-label-sm text-text-body/60 transition hover:text-text-body"
          >
            View all
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3.5 8H12.5M8.5 4L12.5 8L8.5 12"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-x-[18px] gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
