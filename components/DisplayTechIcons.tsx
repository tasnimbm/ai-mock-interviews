import React from 'react';
import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
    const techIcons = await getTechLogos(techStack);

    return (
        <div className="flex flex-row">
            {techIcons.slice(0, 3).map(({ tech, url }, index) => (
                <div
                    key={tech}
                    className={cn(
                        "relative group rounded-full border border-dark-500 bg-dark-300",
                        index >= 1 && "-ml-4" // 👈 stronger overlap
                    )}
                >
                    <img
                        src={url}
                        alt={tech}
                        className="w-8 h-8 rounded-full object-contain"
                    />
                    <span className="tech-tooltip">{tech}</span>
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;
