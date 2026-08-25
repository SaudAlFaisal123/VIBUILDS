export const portfolioConfig = {
  global: {
    name: "M Saud Al Faisal",
    title: "Full-Stack Developer & System Architect",
    fallbackImage: "/assets/bg-default.jpg",
  },
  screens: [
    {
      id: "start",
      title: "START GAME",
      accentColor: "#ff0055", // hud-pink
      objective: "BUILD NEXT LEVEL DIGITAL EXPERIENCES",
      type: "hero"
    },
    {
      id: "about",
      title: "ABOUT ME",
      accentColor: "#ffaa00", // hud-orange
      objective: "LEARN WHO YOU ARE DEALING WITH",
      type: "stats",
      content: {
        description: "Hey, I'm Saud. A Software Engineering graduate and full-stack developer who builds digital experiences that aren't just functional — they're memorable.",
        stats: [
          { label: "EDUCATION", value: "Software Engineering, Bahria University" },
          { label: "LOCATION", value: "Karachi, Pakistan" },
          { label: "STATUS", value: "Building my dreams" }
        ]
      }
    },
    {
      id: "skills",
      title: "SKILLS",
      accentColor: "#00d4ff", // hud-blue
      objective: "REVIEW UNLOCKED ABILITIES",
      type: "progress",
      content: {
        skills: [
          { name: "MERN STACK", percentage: 95 },
          { name: "NEXT.JS / REACT", percentage: 90 },
          { name: "TAILWIND CSS", percentage: 88 },
          { name: "SYSTEM ARCHITECTURE", percentage: 85 },
          { name: "AI INTEGRATION", percentage: 80 }
        ]
      }
    },
    {
      id: "projects",
      title: "PROJECTS",
      accentColor: "#00ff66", // hud-green
      objective: "INSPECT THE COMPLETED BUILDS",
      type: "list",
      content: {
        projects: [
          { 
            name: "HireAI", 
            description: "AI-enhanced job portal with automated resume analysis." 
          },
          { 
            name: "Portfolio V1", 
            description: "Game-inspired interactive digital resume." 
          }
        ]
      }
    },
    {
      id: "contact",
      title: "CONTACT",
      accentColor: "#ff0055",
      objective: "OPEN A SECURE LINE OF CONTACT",
      type: "links",
      content: {
        links: [
          { label: "EMAIL", value: "saudalfaisal65@gmail.com" },
          { label: "LOCATION", value: "Karachi, Sindh" },
          { label: "GITHUB", value: "/saud-al-faisal" }
        ]
      }
    }
  ]
};