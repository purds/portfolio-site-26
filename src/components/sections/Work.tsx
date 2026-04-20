import { CategorySection } from "@/components/work/CategorySection";
import { workCategories } from "@/data/sections";
import { getProjectsByCategory } from "@/data/projects";

export function Work() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:px-16">
      {workCategories.map((category) => {
        const categoryProjects = getProjectsByCategory(category.id);
        return (
          <CategorySection
            key={category.id}
            category={category}
            projects={categoryProjects}
          />
        );
      })}
    </div>
  );
}
