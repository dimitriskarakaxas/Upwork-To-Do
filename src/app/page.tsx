import { TodoApp } from "@/components/todo-app";

export default function Home() {
  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            To-Do
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Stay focused. Get things done.
          </p>
        </header>
        <TodoApp />
      </div>
    </main>
  );
}
