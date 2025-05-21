import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Zap, Rocket, Lock, Globe, Cpu } from "lucide-react";

const features = [
  {
    title: "AI-Powered Analytics",
    description:
      "Leverage advanced machine learning algorithms to automatically detect and classify objects, behaviors, and anomalies in real-time.",
    icon: <Cpu className="h-6 w-6" />,
    badge: "Coming Soon",
  },
  {
    title: "Global Scalability",
    description:
      "Seamlessly expand your camera network across multiple locations worldwide with cloud-based infrastructure and edge computing.",
    icon: <Globe className="h-6 w-6" />,
    badge: "In Development",
  },
  {
    title: "Enhanced Security",
    description:
      "Implement cutting-edge encryption and authentication methods to ensure the highest level of data protection and privacy compliance.",
    icon: <Lock className="h-6 w-6" />,
    badge: "Planned",
  },
  {
    title: "Predictive Maintenance",
    description:
      "Utilize IoT sensors and predictive analytics to anticipate camera hardware issues before they occur, minimizing downtime.",
    icon: <Zap className="h-6 w-6" />,
    badge: "Concept",
  },
  {
    title: "Augmented Reality Integration",
    description:
      "Overlay real-time camera feeds with AR data for enhanced situational awareness and interactive monitoring experiences.",
    icon: <Rocket className="h-6 w-6" />,
    badge: "Research",
  },
  {
    title: "Autonomous Drone Integration",
    description:
      "Incorporate autonomous drones into your surveillance network for dynamic and adaptive monitoring capabilities.",
    icon: <Lightbulb className="h-6 w-6" />,
    badge: "Future Vision",
  },
];

export default function PossibilitiesPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Возможности</h1>
      <p className="text-xl text-muted-foreground mb-10">
        Исследуйте захватывающие будущие возможности и функции, которые мы
        планируем для нашей системы управления камерами.
      </p>

      <Tabs defaultValue="all" className="mb-10">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="coming-soon">Скоро</TabsTrigger>
          <TabsTrigger value="in-development">В разработке</TabsTrigger>
          <TabsTrigger value="future">Будущее</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="coming-soon">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((f) => f.badge === "Coming Soon")
              .map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="in-development">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((f) => f.badge === "In Development")
              .map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="future">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((f) =>
                ["Planned", "Concept", "Research", "Future Vision"].includes(
                  f.badge
                )
              )
              .map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Есть идеи?</CardTitle>
          <CardDescription>
            Мы всегда открыты для новых предложений и идей. Поделитесь своими.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Предложить идею</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({ title, description, icon, badge }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant(badge)}>{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}

function getBadgeVariant(badge: string) {
  switch (badge) {
    case "Coming Soon":
      return "default";
    case "In Development":
      return "secondary";
    case "Planned":
      return "outline";
    default:
      return "secondary";
  }
}
