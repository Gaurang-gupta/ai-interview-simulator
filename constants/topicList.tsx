import {FaPython, FaJava, FaJs} from "react-icons/fa6";
import {
    Database,
    Cpu,
    Layout
} from "lucide-react";
export const topics = [
    {
        slug: "databases",
        title: "Databases",
        icon: <Database className="text-emerald-400" />,
        desc: "Master SQL, NoSQL, and Schema Design.",
        id: "c2fd28ad-2f17-42d3-a000-32fbde48d65f"
    },
    {
        slug: "os",
        title: "Operating Systems",
        icon: <Cpu className="text-blue-400" />,
        desc: "Threads, Memory, and Kernel architecture.",
        id: "d4667cd4-2843-4344-a202-1d25ba9c14e1"
    },
    {
        slug: "system-design",
        title: "System Design",
        icon: <Layout className="text-purple-400" />,
        desc: "Scalability, Load Balancing, and Microservices.",
        id: "26b3312d-a04e-4ecb-94c4-15c8ceae32e8"
    },
    {
        slug: "java",
        title: "Java",
        icon: <FaJava className="text-red-400 text-2xl" />,
        desc: "Java: Class-based, object-oriented, platform-independent programming",
        id: "c13274b9-4a7f-4cc7-8199-5aed769acf23"
    },
    {
        slug: "javascript",
        title: "JavaScript",
        icon: <FaJs className="text-purple-400 text-2xl" />,
        desc: "Powerful, concise, and versatile scripting language",
        id: "1c35e53b-676b-45dc-8cf3-a69407f04d5e"
    },
    {
        slug: "python",
        title: "Python",
        icon: <FaPython className="text-yellow-400 text-2xl" />,
        desc: "Python is a powerful, concise, and readable language for automation",
        id: "65169be1-0500-4c21-9e89-e675d187d327"
    }
];