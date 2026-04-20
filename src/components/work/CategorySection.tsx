import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";
import type { WorkCategory } from "@/data/sections";

interface CategorySectionProps {
  category: WorkCategory;
  projects: Project[];
}

export function CategorySection({ category, projects }: CategorySectionProps) {
  if (projects.length === 0) return null;

  return (
    <div className="py-16" id={`category-${category.id}`}>
      <span
        className="font-mono text-mono uppercase tracking-wider"
        style={{ color: category.accent }}
      >
        ({category.number} — {category.label})
      </span>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {projects.map((project, i) => (
          <div key={project.id} className={i % 2 === 1 ? "lg:mt-12" : ""}>
            <ProjectCard project={project} accentColor={category.accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
