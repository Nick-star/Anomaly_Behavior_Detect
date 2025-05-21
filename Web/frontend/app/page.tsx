import Link from "next/link";
import {
  Camera,
  CircleAlert,
  BarChart2,
  FileText,
  Lightbulb,
} from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 flex flex-col justify-center min-h-screen py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Система видеонаблюдения
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Link href="/buildings" className="group">
          <div className="h-full bg-card hover:bg-card/80 border rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Camera className="h-8 w-8 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Управление камерами</h2>
            <p className="text-muted-foreground">
              Конфигурация и просмотр камер
            </p>
          </div>
        </Link>

        <Link href="/alerts" className="group">
          <div className="h-full bg-card hover:bg-card/80 border rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <CircleAlert className="h-8 w-8 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Уведомления</h2>
            <p className="text-muted-foreground">Уведомления о происшествиях</p>
          </div>
        </Link>

        <Link href="/analysis" className="group">
          <div className="h-full bg-card hover:bg-card/80 border rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <BarChart2 className="h-8 w-8 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Аналитика</h2>
            <p className="text-muted-foreground">
              Просмотр аналитики данных с камер
            </p>
          </div>
        </Link>

        <Link href="/docs" className="group">
          <div className="h-full bg-card hover:bg-card/80 border rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-8 w-8 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Документация</h2>
            <p className="text-muted-foreground">
              Руководства, учебные пособия и справочные материалы
            </p>
          </div>
        </Link>

        <Link href="/possibilities" className="group">
          <div className="h-full bg-card hover:bg-card/80 border rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Lightbulb className="h-8 w-8 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Возможности</h2>
            <p className="text-muted-foreground">
              Функции и возможности системы
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
